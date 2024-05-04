const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const express = require('express');
const appExpress = express();
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(appExpress);
const io = socketIo(server, { cors: { origin: '*' } });
const fs = require('fs').promises; // Per gestire le operazioni sul filesystem in modo asincrono
import { getDirectoryTree, writeFileAsync } from './services/fileServiceIO';


if (require('electron-squirrel-startup')) {
	app.quit();
}

const createWindow = () => {

	const mainWindow = new BrowserWindow({
		width: 1200,
		height: 800,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true
		},
	});

	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// mainWindow.webContents.openDevTools();
};


app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});

	appExpress.get('/hello', (req, res) => {
		res.send('Hello, world!');
	});

	appExpress.get('/images', (req, res) => {
		const parametro = req.query.parametro;
		if (parametro) {
			const folderPath = path.join(process.cwd(), 'media', parametro);
			res.sendFile(folderPath);
		}
	});

	io.on('connection', async (socket) => {
		const clientId = socket.handshake.query.clientId;
		socket.join(clientId);

		console.log('Nuova connessione da:', clientId);

		const directoryTree = await getDirectoryTree(path.join(process.cwd(), 'media'));

		socket.on('getTirectoryTree', (msg) => {
			socket.emit('directoryTree', directoryTree);
		});


		socket.on('file', ({ filename, content, pathOfFile }) => {
			const filePath = path.join("media/" + pathOfFile, filename);
			writeFileAsync(filePath, content, socket)
				.then(() => {
					socket.emit('fileRecivied');
				})
				.catch(() => {
					socket.to("rect-native-12").emit('error', 'Errore durante la scrittura del file:', error);
				})
		});

		socket.on('sendFileToDesk', (msg) => {
			socket.to("rect-native-12").emit("reciveFile", {
				content: msg.content,
				name: msg.filename,
				path: msg.path
			});
		});

		socket.on('getDirectoriesPathFromMobile', (msg) => {
			socket.to("rect-native-12").emit("getDirectoriesPathFromMobile", msg);
		});

		socket.on('sendDirectoriesToDesk', (msg) => {
			socket.to("react-electron-12").emit("getDirectories", msg);
		});

		socket.on('fileReciviedFromMobile', () => {
			console.log("spedisco il file")
			socket.to("react-electron-12").emit("fileRicevied");
		});

	});

});


app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.on('openPopup', () => {
	dialog.showOpenDialog({
		properties: ['openDirectory']
	});
});

const port = 3100;
server.listen(port, '192.168.1.2',async () => {
	console.log(`Server Express in esecuzione sulla porta ${port}`);
});
