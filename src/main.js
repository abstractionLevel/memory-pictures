const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dgram = require('dgram');
const fs = require('fs');
const { spawn } = require('child_process');


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
	app.quit();
}

const server = dgram.createSocket('udp4');

const createWindow = () => {
	// Create the browser window.

	// Avvia il server Express come processo separato
	const projectDir = process.cwd();
	const expressServer = spawn('node', [path.join(projectDir, 'src', 'server.js')]);

	expressServer.stdout.on('data', (data) => {
		console.log(`stdout: ${data}`);
	});

	expressServer.stderr.on('data', (data) => {
		console.error(`stderr: ${data}`);
	});

	expressServer.on('close', (code) => {
		console.log(`Child process exited with code ${code}`);
	});

	const mainWindow = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
			contextIsolation: false,
		},
	});

	// and load the index.html of the app.
	mainWindow.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);

	// Open the DevTools.
	mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
	createWindow();

	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});

ipcMain.on('receive-file', (event) => {
	const server = dgram.createSocket('udp4');
	const projectDir = process.cwd();
	console.log('Directory corrente del progetto:', projectDir);
	server.on('error', (err) => {
		console.log(`Server error:\n${err.stack}`);
		server.close();
	});

	server.on('message', (file, rinfo) => {
		/**
		 * todo: dopo ricevuta la cartella devo aggiornare la view
		 */
		const projectDir = process.cwd();
		const filePath = path.join(projectDir + "/src/folders", 'file_ricevuto');
		fs.writeFile(filePath, file, (err) => {
			if (err) {
				console.error('Error saving file:', err);
				return;
			}
			console.log('File saved successfully:', filePath);
		});
	});

	server.on('listening', () => {
		const address = server.address();
		console.log(`Server listening ${address.address}:${address.port}`);
	});

	server.bind(8080);
	console.log("connesione ", server)
});
