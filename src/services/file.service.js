import { IP_SERVER_APP } from '../constant/constants';
import { io } from "socket.io-client";


export const connectToApp = () => {

    return new Promise((resolve, reject) => {

        const socket = io(IP_SERVER_APP);
        let directories = null;

        console.log("tentativo di connesione")
        socket.on('connect', () => {
            console.log('Connesso al server Socket.IO!');

        });

        socket.on('directoryTree', async (directoryTree) => {
            directories = await directoryTree.filter(item => item);
            resolve(directories);
        });

        socket.on('disconnect', () => {
            reject('Disconnesso dal server Socket.IO!');
        });

        socket.on('message', (message) => {
            console.log('Messaggio ricevuto dal server:', message);
        });

        

        // Chiudi la connessione quando il componente si smonta
        // return () => {
        //     socket.disconnect();
        // };
    });
};
