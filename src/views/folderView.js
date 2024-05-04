import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Card, CardMedia } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal } from 'react-bootstrap';
import { ToastContainer, toast } from 'react-toastify';
const fs = window.require('fs');
const fsPr = window.require('fs').promises
const path = window.require('path');
import io from 'socket.io-client';
import './folderView.css';
import { getUniqueDatesFromArray } from "../utility/date";
import FolderIcon from "@mui/icons-material/Folder";
import ImageModal from "../modal/imgaModal";
import { useLocation } from 'react-router-dom';


const socket = io('http://192.168.1.7:3100', {
    query: { clientId: 'react-electron-12' }
});

const FolderView = () => {

    const [files, setFiles] = useState([]);
    const [isModalDirectories, setIsModalDirectories] = useState(false);
    const [directories, setDirectories] = useState(null);
    const [isNotify, setIsNotify] = useState(false);
    const [isImageModal, setIsImageModal] = useState(false);
    const [clickedImage, setClickedImage] = useState(false);

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const folderName = searchParams.get('parametro');
    console.log("folder name : ", folderName)

    socket.on('getDirectories', (data) => {
        setDirectories(data)
    });

    socket.on('fileRicevied', () => {
        setIsNotify(true)
    });

    const handleDirectoryModal = () => {
        setIsModalDirectories(!isModalDirectories);
    }


    const getDirectoriesPathFromMobile = async () => {
        socket.emit('getDirectoriesPathFromMobile', "");
    }

    const sendFile = (path) => {
        const filePath = 'C:/projects/memory-pictures/src/folders/documenti/televisione1.jpg';
        fs.readFile(filePath, 'base64', (err, data) => {
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

    const sortElementByDate = async (resp) => {
        const uniqueDate =  getUniqueDatesFromArray(resp);
        //ogni data ha un gruppo di file
        let groupedPicture = [];
        uniqueDate.forEach(date => {//per ogni data
            const dateGroup = { date: date, file: [] };//setto la prima data
            resp.forEach(item => {//itero l array d immagin
                if (date === item.date) {
                    dateGroup.file.push({ name: item.name, ext: item.type });//setto l immagine che combacia con la data
                }
            });
            groupedPicture.push(dateGroup);
        });
        groupedPicture.sort((a, b) => {
            if (a.date && b.date) {
                const dateA = new Date(a.date.split('/').reverse().join('-'));
                const dateB = new Date(b.date.split('/').reverse().join('-'));
                return dateB - dateA;
            }
        });
        setFiles(groupedPicture);
    }

    const onClickImage = (currentImage) => {
        console.log(currentImage)
        setClickedImage(currentImage)
        setIsImageModal(true);
    }

    const fetchFolders = async () => {//todo: da refactorare // splittare la funzione seguendo i solid
        const projectDir = process.cwd(); 
        const foldersPath = path.join(projectDir, 'media', folderName);
        const filesFound = await fs.promises.readdir(foldersPath);
        let contents = []
        for (const item of filesFound) {
            const fileInfo = await fsPr.stat(path.join(foldersPath, item));
            if (fileInfo.isFile()) {
                const date = new Date(fileInfo.mtime);
                const formattedDate = date.toLocaleDateString();
                const type = path.extname(item);
                contents.push({
                    name: item,
                    date: formattedDate,
                    type: type
                });
            } else {
                contents.push({
                    name: item,
                    date: new Date().toLocaleDateString(),
                    type: "dir"
                });
            }
        }
        sortElementByDate(contents);
    }

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        fetchFolders();
    }, [folderName]);

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
        }
    }, [isNotify])

    return (
        <div>
            {files.length > 0 &&
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                        <IconButton component={Link} to={!folderName ? `/folder/${folderName}` : "/"} style={{ marginRight: '10px' }}>
                            <ArrowBackIcon />
                            <span style={{ marginLeft: 20, marginBottom: 8 }}>{folderName}</span>
                        </IconButton>
                    </div>
                    <div>
                        <div >
                            {files && files.map((element, index) => (
                                <div style={{ marginLeft: 10 }}>
                                    <p>{element.date}</p>
                                    <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                                        {element.file.map((file, index) =>
                                            file.ext === "dir" ?
                                                <div>
                                                    <Link
                                                        to={{
                                                            pathname: `/folder/${folderName}/${file.name}`,
                                                            search: '?parametro=' + folderName + '/' + file.name
                                                        }}
                                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                                    >
                                                        <FolderIcon color="primary" sx={{ fontSize: 60 }} />
                                                    </Link>
                                                    <p>{file.name}</p>
                                                </div>
                                                :
                                                <div>
                                                    <Card key={index} style={{ width: '60px', height: '60px', margin: '10px' }} onClick={() => onClickImage(`http://localhost:3100/images?parametro=${folderName}/${file.name}`)}>
                                                        <CardMedia component="img" image={`http://localhost:3100/images?parametro=${folderName}/${file.name}`} alt={file.path} />
                                                    </Card>
                                                    <p style={{fontSize:10,textAlign:'center'}}>{file.name}</p>
                                                </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <ImageModal
                        isOpen={isImageModal}
                        handleModal={() => setIsImageModal(!isImageModal)}
                        image={clickedImage}
                    />
                    {/* <button onClick={getDirectoriesPathFromMobile}>send file</button>
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
                    <ToastContainer /> */}
                </div>
            }
        </div >
    )

}

export default FolderView;