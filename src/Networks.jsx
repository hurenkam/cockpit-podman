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

import './Networks.css';
import '@patternfly/react-styles/css/utilities/Sizing/sizing.css';

const _ = cockpit.gettext;

class Networks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            intermediateOpened: false,
            isExpanded: false,
        };

        // this.downloadImage = this.downloadImage.bind(this);
        this.renderRow = this.renderRow.bind(this);
    }

    renderRow(network) {
        const tabs = [];
        const columns = [];

        return {
            expandedContent: <ListingPanel
                                colSpan='8'
                                tabRenderers={tabs} />,
            columns: columns,
            props: {
                key :network.Id + network.isSystem.toString(),
                "data-row-id": network.Id + network.isSystem.toString(),
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

        const emptyCaption = _("No networks");
        const networkRows = [];
        const cardBody = (
            <>
                <ListingTable aria-label={_("Networks")}
                              variant='compact'
                              emptyCaption={emptyCaption}
                              columns={columnTitles}
                              rows={networkRows} />
            </>
        );

        return (
            <Card id="containers-networks" key="networks" className="containers-networks">
                <CardHeader>
                    <Flex flexWrap={{ default: 'nowrap' }} className="pf-u-w-100">
                        <FlexItem grow={{ default: 'grow' }}>
                            <Flex>
                                <Text className="networks-title" component={TextVariants.h3}>{_("Networks")}</Text>
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

export default Networks;
