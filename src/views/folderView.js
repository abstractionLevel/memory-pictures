import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Card, CardMedia } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { connectToApp } from "../services/file.service";
const fs = window.require('fs');
const path = window.require('path');
import io from 'socket.io-client';
import './folderView.css'; // Importa il file CSS



const socket = io('http://192.168.1.7:3100', {
    query: { clientId: 'react-electron-12' }
});

const FolderView = () => {



    const { folderName } = useParams();
    const [files, setFiles] = useState([]);
    const [isModalDirectories, setIsModalDirectories] = useState(false);
    const [directories, setDirectories] = useState(null);


    socket.on('getDirectories', (data) => {
        console.log("ecco le directories ", data)//capire il response
        setDirectories(data)
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

    const provaMess = async () => {
        // const filePath = 'C:/projects/memory-pictures/src/folders/documenti/televisione1.jpg';
        // fs.readFile(filePath, (err, data) => {
        //     if (err) {
        //       console.error('Si è verificato un errore durante la lettura del file:', err);
        //       return;
        //     }
        //     socket.emit('messageFromClientElectron', {
        //         filename: 'televisione1.jpg',
        //         content: data,
        //         pathOfFile: "priva"
        //     });
        //   });
        socket.emit('getDirectoriesPathFromMobile', "");


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


    const renderInnerDirectories = (tree,spc) => {
        return tree.map((item,index)=>{
            const newSpc = spc + 3;
            return (
                <div style={{marginLeft:newSpc}}>
                    <p className="direcotryLabel">|</p>
                    <p className="direcotryLabel">{item.name}</p>
                    {item.directories.length > 0 && renderInnerDirectories(item.directories, newSpc)}
                </div>
            )
        })
    }

    useEffect(() => {
        if (directories) {
            setIsModalDirectories(true);
        }
    }, [directories]);

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
            <button onClick={provaMess}>send file</button>
            <Modal show={isModalDirectories} onHide={handleDirectoryModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Titolo del Modal</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {directories && directories.map(el => (
                        <div>
                            <p className="direcotryLabel">{el.name}</p>
                            {el.directories.length > 0 && (
                                renderInnerDirectories(el.directories, 20)
                        )}
                        </div>

                    ))}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleDirectoryModal}>
                        Chiudi
                    </Button>
                    {/* Puoi aggiungere altri bottoni qui se necessario */}
                </Modal.Footer>
            </Modal>
        </div>
    )

}

export default FolderView;