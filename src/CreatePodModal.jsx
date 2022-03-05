import React from 'react';
import {
    Button,
    Form, FormGroup,
    Modal,
    TextInput, Tabs, Tab, TabTitleText,
    Flex,
} from '@patternfly/react-core';
import * as dockerNames from 'docker-names';

import { ErrorNotification } from './Notification.jsx';
import { PublishPort } from './PublishPort.jsx';
import { DynamicListForm } from './DynamicListForm.jsx';
import * as client from './client.js';
import cockpit from 'cockpit';

import "./CreatePodModal.scss";

const _ = cockpit.gettext;

const systemOwner = "system";

export class CreatePodModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            podName: dockerNames.getRandomName(),
            publish: [],
            volumes: [],
            networks: [],
            owner: this.props.systemServiceAvailable ? systemOwner : this.props.user,
        };
        this.getCreateConfig = this.getCreateConfig.bind(this);
        this.onCreateClicked = this.onCreateClicked.bind(this);
        this.onValueChanged = this.onValueChanged.bind(this);
    }

    getCreateConfig() {
        const createConfig = {};

        if (this.state.podName)
            createConfig.name = this.state.podName;

        if (this.state.publish.length > 0)
            createConfig.portmappings = this.state.publish
                    .filter(port => port.containerPort)
                    .map(port => {
                        const pm = { container_port: parseInt(port.containerPort), protocol: port.protocol };
                        if (port.hostPort !== null)
                            pm.host_port = parseInt(port.hostPort);
                        if (port.IP !== null)
                            pm.host_ip = port.IP;
                        return pm;
                    });

        if (this.state.volumes.length > 0) {
            createConfig.mounts = this.state.volumes
                    .filter(volume => volume.hostPath && volume.containerPath)
                    .map(volume => {
                        const record = { source: volume.hostPath, destination: volume.containerPath, type: "bind" };
                        record.options = [];
                        if (volume.mode)
                            record.options.push(volume.mode);
                        if (volume.selinux)
                            record.options.push(volume.selinux);
                        return record;
                    });
        }

        return createConfig;
    }

    createPod = (isSystem, createConfig) => {
        client.createPod(isSystem, createConfig)
                .then(reply => {
                    this.props.close();
                })
                .catch(ex => {
                    this.setState({
                        dialogError: _("Pod failed to be created"),
                        dialogErrorDetail: cockpit.format("$0: $1", ex.reason, ex.message)
                    });
                });
    }

    onCreateClicked() {
        const createConfig = this.getCreateConfig();
        const isSystem = this.isSystem();

        this.createPod(isSystem, createConfig);
    }

    onValueChanged(key, value) {
        this.setState({ [key]: value });
    }

    handleTabClick = (event, tabIndex) => {
        // Prevent the form from being submitted.
        event.preventDefault();
        this.setState({
            activeTabKey: tabIndex,
        });
    };

    isSystem = () => {
        const { owner } = this.state;
        return owner === systemOwner;
    }

    render() {
        const { pod } = this.props;
        const dialogValues = this.state;
        const { activeTabKey, owner, selectedImage } = this.state;

        const defaultBody = (
            <Form isHorizontal={activeTabKey == 0}>
                <Flex className="create-pod-dialog-header pf-c-form pf-m-horizontal" justifyContent={{ default: 'justifyContentSpaceBetween' }}>
                    <FormGroup fieldId='create-pod-dialog-name' label={_("Name")}>
                        <TextInput id='create-pod-dialog-name'
                           className="pod-name"
                           placeholder={_("Pod name")}
                           value={dialogValues.podName}
                           onChange={value => this.onValueChanged('podName', value)} />
                    </FormGroup>
                </Flex>
                <Tabs activeKey={activeTabKey} onSelect={this.handleTabClick}>
                    <Tab eventKey={0} title={<TabTitleText>{_("Details")}</TabTitleText>} className="pf-c-form pf-m-horizontal" />
                    <Tab eventKey={1} title={<TabTitleText>{_("Integration")}</TabTitleText>} id="create-image-dialog-tab-integration" className="pf-c-form">

                        <DynamicListForm id='create-pod-dialog-publish'
                                 emptyStateString={_("No ports exposed")}
                                 formclass='publish-port-form'
                                 label={_("Port mapping")}
                                 actionLabel={_("Add port mapping")}
                                 onChange={value => this.onValueChanged('publish', value)}
                                 default={{ IP: null, podPort: null, hostPort: null, protocol: 'tcp' }}
                                 itemcomponent={ <PublishPort />} />
                    </Tab>
                </Tabs>
            </Form>
        );
        return (
            <Modal isOpen
                   position="top" variant="medium"
                   onClose={this.props.close}
                   // TODO: still not ideal on chromium https://github.com/patternfly/patternfly-react/issues/6471
                   onEscapePress={() => {
                       this.props.close();
                   }}
                   title={_("Create pod")}
                   footer={<>
                       {this.state.dialogError && <ErrorNotification errorMessage={this.state.dialogError} errorDetail={this.state.dialogErrorDetail} />}
                       <Button variant='primary' onClick={this.onCreateClicked}>
                           {_("Create")}
                       </Button>
                       <Button variant='link' className='btn-cancel' onClick={ this.props.close }>
                           {_("Cancel")}
                       </Button>
                   </>}
            >
                {defaultBody}
            </Modal>
        );
    }
}
