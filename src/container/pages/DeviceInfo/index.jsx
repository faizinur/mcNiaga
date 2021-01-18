import React, { Component, useEffect, useState } from 'react';
import {
    Page,
    Navbar,
    List,
    ListInput,
    Block,
    Row,
    Col,
    Button
} from 'framework7-react';
import { useDispatch, useSelector } from "react-redux";
import { navigate } from '../../../config/redux/actions/';
import { log } from '../../../utils';

const DeviceInfo = (props) => {
    useEffect(() => {
        log('MOUNT OR UPDATE DeviceInfo');
        log(props)
        return () => {
            log('UNMOUNT DeviceInfo');
        }
    }, [])
    const device = useSelector(state => state.main.device);

    return (
        <Page noToolbar noNavbar>
            <List noHairlinesMd style={{ fontSize: 1 }}>
                <ListInput
                    outline
                    label="Manufacture"
                    type="text"
                    disabled={true}
                    value={device.manufacturer}
                />
                <ListInput
                    outline
                    label="Operating System"
                    type="text"
                    disabled={true}
                    value={device.platform}
                />
                <ListInput
                    outline
                    label="Device ID"
                    type="text"
                    disabled={true}
                    value={device.uuid}
                />
                <ListInput
                    outline
                    label="ICCID"
                    type="text"
                    disabled={true}
                    value={device.serial}
                />
                <ListInput
                    outline
                    label="Version"
                    type="text"
                    disabled={true}
                    value={device.version}
                />
            </List>
        </Page>
    );
}


export default DeviceInfo;