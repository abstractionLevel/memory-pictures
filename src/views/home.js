import React, { useEffect, useState } from 'react';
import FolderIcon from "@mui/icons-material/Folder";
import { Link } from 'react-router-dom';
const fs = window.require('fs').promises;
const path = window.require('path');

const Home = () => {

    const [folders, setFolders] = useState([]);

    const createMediaFolder = async () => {
        try {
            await fs.stat("media");
        } catch (error) {
            await fs.mkdir("media", { recursive: true });
        }
    }

    useEffect(() => {

        const loadFolders = async () => {
            try {
                const projectDir = process.cwd();
                const folderPath = path.join(projectDir, 'media');
                const folderNames = await fs.readdir(folderPath);
                setFolders(folderNames);
            } catch (error) {
                console.error('Error loading folders:', error);
            }
        };

        loadFolders();
        createMediaFolder();

    }, []);

    return (
        <div >
            {/* <Menu/> */}
            <div style={{ display: "flex", marginTop: 30 }}>
                {folders.map(folderName => (
                    <div style={{ width: "100px", marginLeft: "10px" }}>
                        <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                            <Link to={{
                                pathname: `/folder/${folderName}`,
                                search: '?parametro=' + folderName
                            }}
                                style={{ textDecoration: 'none', color: 'inherit' }}
                            >
                                <FolderIcon />
                            </Link>
                        </div>
                        <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                            <span>{folderName}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Home;