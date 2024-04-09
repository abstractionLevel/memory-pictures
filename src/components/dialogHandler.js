const { dialog } = require('electron').remote

exports.openFile = () => {
    return dialog.showOpenDialog({
        title: 'Seleziona un file',
        properties: ['openFile']
    });
};
