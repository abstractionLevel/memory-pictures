import React, { useEffect, useState } from "react";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { IconButton, Card, CardMedia } from '@mui/material';
import { Link, useParams } from 'react-router-dom';
const fs = window.require('fs');
const path = window.require('path');

const FolderView = () => {

    const { folderName } = useParams();
    const [files, setFiles] = useState([]);


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

    return (
        <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <IconButton component={Link} to="/" style={{ marginRight: '10px' }}>
                    <ArrowBackIcon />
                </IconButton>
            </div>
            <div>
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {files && files.map((file, index) => (
                        // <Card key={index} style={{ width: '350px', margin: '10px' }}>
                        //     <CardMedia component="img" image={file.path} alt={file.path} />
                        // </Card>
                        <img src={`http://localhost:3100/images/${folderName}/${file.name}`} width={'100px'} height={'100px'} ></img>
                    ))}
                </div>
            </div>
            {/* Aggiungi qui il codice per visualizzare il contenuto della cartella */}
        </div>
    )

}

export default FolderView;