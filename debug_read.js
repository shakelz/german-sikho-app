const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', 'vocab_part23.json');
console.log('Reading file:', filePath);
const content = fs.readFileSync(filePath, 'utf8');
const data = JSON.parse(content);
const item = data.find(i => i.id === 459);
console.log('Item 459:', item);
