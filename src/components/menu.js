import Nav from 'react-bootstrap/Nav';
import React from 'react';
import { Button } from 'react-bootstrap';
const { ipcRenderer } = window.require('electron');


const Menu = () => {

    const onListen = () => {
        ipcRenderer.send('receive-file');
    };

    return (
        <Nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <Nav.Item>
                <Button onClick={onListen}>Connect</Button>
            </Nav.Item>

        </Nav>
    );
}

export default Menu;