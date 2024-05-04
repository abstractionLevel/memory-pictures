const fs = require('fs').promises; 
const path = require('path');


export const getDirectoryTree = async (rootPath) => {
    const stats = await fs.stat(rootPath);
    if (!stats.isDirectory()) {
        return null;
    }

    const children = await fs.readdir(rootPath);
    const directories = [];

    for (const child of children) {
        const childPath = path.join(rootPath, child);
        const childStats = await fs.stat(childPath);
        if (childStats.isDirectory()) {
            const directory = {
                name: child,
                directories: await getDirectoryTree(childPath)
            };
            directories.push(directory);
        }
    }

    return directories;
}

export const writeFileAsync = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'base64');
        resolve();
    });
};
