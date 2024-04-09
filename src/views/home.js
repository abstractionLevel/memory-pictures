import React, { useEffect, useState } from 'react';
import FolderIcon from "@mui/icons-material/Folder";
import { Link } from 'react-router-dom';
const fs = window.require('fs');
const path = window.require('path');
import Menu from '../components/menu';



const Home = () => {

    const [folders, setFolders] = useState([]);


    useEffect(() => {
        const loadFolders = async () => {
            try {
                const projectDir = process.cwd();
                const folderPath = path.join(projectDir, 'src', 'folders');
                const folderNames = await fs.promises.readdir(folderPath);
                setFolders(folderNames);
            } catch (error) {
                console.error('Error loading folders:', error);
            }
        };

        loadFolders();

    }, []);

    return (
        <div >
            <Menu/>
            <div style={{ display: "flex" }}>
                {folders.map(folderName => (
                    <div style={{ width: "100px", marginLeft: "10px" }}>
                        <div style={{ display: "flex", alignItems: 'center', justifyContent: 'center' }}>
                            <Link to={`/folder/${folderName}`} style={{ textDecoration: 'none', color: 'inherit' }}>
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