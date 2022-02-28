import React from 'react';
import {
    Button,
    Form, FormGroup,
    Modal,
    TextInput,
    Flex,
} from '@patternfly/react-core';
import * as dockerNames from 'docker-names';

import { ErrorNotification } from './Notification.jsx';
import cockpit from 'cockpit';

import "./CreatePodModal.scss";

const _ = cockpit.gettext;

const systemOwner = "system";

export class CreatePodModal extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            podName: dockerNames.getRandomName(),
        };
    }

    onValueChanged(key, value) {
        this.setState({ [key]: value });
    }


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
