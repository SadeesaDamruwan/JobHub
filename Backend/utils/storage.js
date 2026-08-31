const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function getFilePath(fileName) {
    return path.join(dataDir, fileName.endsWith('.json') ? fileName : `${fileName}.json`);
}

function readData(fileName, defaultData = []) {
    const filePath = getFilePath(fileName);
    try {
        if (!fs.existsSync(filePath)) {
            writeData(fileName, defaultData);
            return defaultData;
        }
        const raw = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(raw);
    } catch (err) {
        console.error(`Error reading ${fileName}:`, err);
        return defaultData;
    }
}

function writeData(fileName, data) {
    const filePath = getFilePath(fileName);
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error(`Error writing ${fileName}:`, err);
        return false;
    }
}

module.exports = {
    readData,
    writeData
};
