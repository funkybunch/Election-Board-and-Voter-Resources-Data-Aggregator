const writeJSON = require('write-json-file');

require('./states/all.js').collect().then((response) => {
    saveStateDataToFile(response);
});

function saveStateDataToFile(data) {
    writeJSON('./dist/all.json', data);
    for(let i in data) {
        writeJSON('./dist/' + i + '/all.json', data[i]);
        writeJSON('./dist/' + i + '/boes.json', data[i].boes);
    }
}