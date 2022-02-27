import React, { useState } from 'react';
import {
    Card, CardBody, CardHeader, CardFooter,
    Flex, FlexItem,
    Text, TextVariants
} from '@patternfly/react-core';
import { cellWidth } from '@patternfly/react-table';

import cockpit from 'cockpit';
import { ListingTable } from "cockpit-components-table.jsx";
import { ListingPanel } from 'cockpit-components-listing-panel.jsx';

import './Volumes.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';

const _ = cockpit.gettext;

class Volumes extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            intermediateOpened: false,
            isExpanded: false,
        };

        // this.downloadImage = this.downloadImage.bind(this);
        this.renderRow = this.renderRow.bind(this);
    }

    renderRow(volume) {
        const tabs = [];
        const columns = [];

        return {
            expandedContent: <ListingPanel
                                colSpan='8'
                                tabRenderers={tabs} />,
            columns: columns,
            props: {
                key :volume.Id + volume.isSystem.toString(),
                "data-row-id": volume.Id + volume.isSystem.toString(),
            },
        };
    }

    render() {
        const columnTitles = [
            { title: _("Name"), transforms: [cellWidth(20)] },
            _("Owner"),
            _("Created"),
            _("ID"),
            _("State")
        ];

        const emptyCaption = _("No volumes");
        const volumeRows = [];
        const cardBody = (
            <>
                <ListingTable aria-label={_("Volumes")}
                              variant='compact'
                              emptyCaption={emptyCaption}
                              columns={columnTitles}
                              rows={volumeRows} />
            </>
        );

        return (
            <Card id="containers-volumes" key="volumes" className="containers-volumes">
                <CardHeader>
                    <Flex flexWrap={{ default: 'nowrap' }} className="pf-u-w-100">
                        <FlexItem grow={{ default: 'grow' }}>
                            <Flex>
                                <Text className="volumes-title" component={TextVariants.h3}>{_("Volumes")}</Text>
                            </Flex>
                        </FlexItem>
                    </Flex>
                </CardHeader>
                <CardBody>
                    {cardBody}
                </CardBody>
            </Card>
        );
    }
}

export default Volumes;
