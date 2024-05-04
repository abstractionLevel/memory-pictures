const express = require('express');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: '*' } });
const fs = require('fs').promises; // Per gestire le operazioni sul filesystem in modo asincrono

app.use(express.static(path.join(__dirname, 'doc')));


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

// const writeFileAsync = async (filePath, data,socket) => {
//     try {
//         await fs.writeFile(filePath, data, 'base64');
//         console.log("spedisco il messagio a react native")
//         socket.to("rect-native-12").emit('fileRecivied');
//     } catch (error) {
//         socket.to("rect-native-12").emit('error', 'Errore durante la scrittura del file:', error);
//     }
// }

const writeFileAsync = (filePath, data) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, data, 'base64');
        resolve();
    });
};



app.get('/images/:folderName/*', (req, res) => {
    const parametro = req.query.parametro;
    if(parametro) {
        const projectDir = process.cwd();
        const folderPath = path.join(projectDir, 'media',parametro);
        res.sendFile(folderPath);
    }

});

app.get('/hello', (req, res) => {
    // Invia il messaggio "Hello, world!" come risposta
    res.send('Hello, world!');
  });

io.on('connection', async (socket) => {
    const clientId = socket.handshake.query.clientId;
    socket.join(clientId);

    console.log('Nuova connessione da:', clientId);

    const directoryTree = await getDirectoryTree(path.join(__dirname, 'folders'));

    socket.on('getTirectoryTree', (msg) => {
        socket.emit('directoryTree', directoryTree);
    });

   
    socket.on('file', ({ filename, content, pathOfFile }) => {
        const filePath = path.join("media" + pathOfFile, filename);
        writeFileAsync(filePath, content,socket)
            .then(()=>{
                socket.emit('fileRecivied');
            })
            .catch(()=>{
                socket.to("rect-native-12").emit('error', 'Errore durante la scrittura del file:', error);
            })
    });

    socket.on('sendFileToDesk', (msg) => {
        socket.to("rect-native-12").emit("reciveFile", {
            content:msg.content,
            name:msg.filename,
            path:msg.path
        });
    });

    socket.on('getDirectoriesPathFromMobile', (msg) => {
        socket.to("rect-native-12").emit("getDirectoriesPathFromMobile",msg);
    });

    socket.on('sendDirectoriesToDesk', (msg) => {
        socket.to("react-electron-12").emit("getDirectories",msg);
    });

    socket.on('fileReciviedFromMobile', () => {
        console.log("spedisco il file")
        socket.to("react-electron-12").emit("fileRicevied");
    });


});

 
const port = 3100;
server.listen(port, async () => {
    console.log(`Server Express in esecuzione sulla porta ${port}`);
});


