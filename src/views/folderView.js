import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Card, CardMedia } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { connectToApp } from "../services/file.service";
import { ToastContainer, toast } from 'react-toastify';
const fs = window.require('fs');
const path = window.require('path');
import io from 'socket.io-client';
import './folderView.css';



const socket = io('http://192.168.1.7:3100', {
    query: { clientId: 'react-electron-12' }
});

const FolderView = () => {

    const { folderName } = useParams();
    const [files, setFiles] = useState([]);
    const [isModalDirectories, setIsModalDirectories] = useState(false);
    const [directories, setDirectories] = useState(null);
    const [isNotify, setIsNotify] = useState(false);


    socket.on('getDirectories', (data) => {
        setDirectories(data)
    });

    socket.on('fileRicevied', () => {
        setIsNotify(true)
    });

    const handleDirectoryModal = () => {
        setIsModalDirectories(!isModalDirectories);
    }

    const fetchDirectories = async () => {
        try {
            const directories = await connectToApp();
            console.log(directories)
            setDirectories(directories);
        } catch (err) {
            console.log(err);
        }
    };

    const getDirectoriesPathFromMobile = async () => {
        socket.emit('getDirectoriesPathFromMobile', "");
    }

    const sendFile = (path) => {
        const filePath = 'C:/projects/memory-pictures/src/folders/documenti/televisione1.jpg';
        fs.readFile(filePath,'base64', (err, data) => {
            if (err) {
                console.error('Si è verificato un errore durante la lettura del file:', err);
                return;
            }
            socket.emit('sendFileToDesk', {
                filename: 'televisione1.jpg',
                content: data,
                path: path
            });
            setIsModalDirectories(false);

        });

    }

    const renderInnerDirectories = (tree, spc, path) => {

        return tree.map((item, index) => {
            const newSpc = spc + 3;
            const pathTree = path + '/' + item.name;
            return (
                <div style={{ marginLeft: newSpc }}  >
                    <p className="direcotryLabel">|</p>
                    <p className="direcotryLabel" style={{ cursor: "pointer" }} onClick={() => sendFile(pathTree)} >{item.name}</p>
                    {item.directories.length > 0 && renderInnerDirectories(item.directories, newSpc, pathTree)}
                </div>
            )
        })
    }

    useEffect(() => {
        const fetchFolders = async () => {
            const projectDir = process.cwd();
            const foldersPath = path.join(projectDir, 'src', 'folders');
            const foldersNames = await fs.promises.readdir(foldersPath);
            const folder = foldersNames.find(folder => folder === folderName);
            const folderPath = path.join(projectDir, 'src', 'folders', folder);
            const filesFound = await fs.promises.readdir(folderPath);
            let listFile = []
            filesFound.map(file => {
                listFile.push({
                    name: file,
                    path: path.join(projectDir, 'src', 'folders', folderName, file)
                });
            });
            setFiles(listFile);
        }
        fetchFolders();
    }, []);

    useEffect(() => {
        if (directories) {
            setIsModalDirectories(true);
        }
    }, [directories]);

    useEffect(() => {
        if (isNotify) {
            setIsNotify(false);
            toast.success('🦄 file sent', {
                position: "top-right",
                autoClose: 1000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            console.log("ciao")
        }
    }, [isNotify])

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <IconButton component={Link} to="/" style={{ marginRight: '10px' }}>
                    <ArrowBackIcon />
                    <span style={{ marginLeft: 20, marginBottom: 8 }}>{folderName}</span>
                </IconButton>
            </div>
            <div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {files && files.map((file, index) => (
                        <Card key={index} style={{ width: '100px', margin: '10px' }}>
                            <CardMedia component="img" image={`http://localhost:3100/images/${folderName}/${file.name}`} alt={file.path} />
                        </Card>
                        // <img src={`http://localhost:3100/images/${folderName}/${file.name}`} width={'100px'} height={'100px'} ></img>
                    ))}
                </div>
            </div>
            <button onClick={getDirectoriesPathFromMobile}>send file</button>
            <Modal show={isModalDirectories} onHide={handleDirectoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Chose Directory</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {directories && directories.map(el => (
                        <div>
                            <p onClick={sendFile} style={{ cursor: "pointer" }} className="direcotryLabel">{el.name}</p>
                            {el.directories.length > 0 && (
                                renderInnerDirectories(el.directories, 20, el.name)
                            )}
                        </div>

                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDirectoryModal}>
                        Chiudi
                    </Button>
                </Modal.Footer>
            </Modal>
            <ToastContainer />
        </div>
    )

}

export default FolderView;