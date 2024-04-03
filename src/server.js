const express = require('express');
const path = require('path');

const app = express();

// Servi i file statici dell'applicazione Electron
app.use(express.static(path.join(__dirname, 'build')));

// Definisci una route che servirà le immagini dalla cartella specificata
app.get('/images/:folderName/:fileName', (req, res) => {
    const folderName = req.params.folderName;
    const fileName = req.params.fileName;
    const imagePath = path.join(__dirname, 'folders', folderName, fileName);
    res.sendFile(imagePath);
});

// Avvia il server
const port = 3100;
app.listen(port, () => {
    console.log(`Server Express in esecuzione sulla porta ${port}`);
});
