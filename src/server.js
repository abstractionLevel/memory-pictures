const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
const fs = require('fs').promises; // Per gestire le operazioni sul filesystem in modo asincrono


const getDirectoryTree = async (rootPath) => {
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

const writeFileAsync = async (filePath, data) => {
    try {
        await fs.writeFile(filePath, data, 'utf8');
        io.emit('message', 'File salvato con successo:');
    } catch (error) {
        io.emit('message', 'Errore durante la scrittura del file:', error);
    }
}

app.use(express.static(path.join(__dirname, 'build')));


app.get('/images/:folderName/:fileName', (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const imagePath = path.join(__dirname, 'folders', folderName, fileName);
    res.sendFile(imagePath);
});

io.on('connection', async (socket) => {

    const clientId = socket.handshake.query.clientId;
    socket.join(clientId);

    console.log('Nuova connessione da:', clientId);

    const directoryTree = await getDirectoryTree(path.join(__dirname, 'folders'));

    socket.emit('directoryTree', directoryTree);

    socket.on('file', ({ filename, content, pathOfFile }) => {
        const filePath = path.join("src/folders/" + pathOfFile, filename);
        const decodedContent = Buffer.from(content, 'base64');

        writeFileAsync(filePath, decodedContent);

    });

    socket.on('messageFromClientElectron', (msg) => {
        const data = msg.content
        const base64Data = data.toString('base64'); // Converti il buffer in una stringa Base64

        console.log("messaggio ricevuto da electron " , base64Data)
        socket.to("rect-native-12").emit("messagToNative", {
            content:base64Data,
            name:msg.filename,
            pathOfFile:msg.pathOfFile
        });
    });

    socket.on('getDirectoriesPathFromMobile', (msg) => {
        socket.to("rect-native-12").emit("getDirectoriesPathFromMobile",msg);
    });

    socket.on('sendDirectoriesToDesk', (msg) => {
        // console.log("spedisco le directori al componente  ", msg)
        socket.to("react-electron-12").emit("getDirectories",msg);
    });


});

 
const port = 3100;
server.listen(port, () => {
    console.log(`Server Express in esecuzione sulla porta ${port}`);
});


