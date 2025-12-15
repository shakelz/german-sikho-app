const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'android/signing_report.txt');

try {
    // Try reading as UTF-16LE
    let data = fs.readFileSync(filePath, 'utf16le');

    // Split by lines
    const lines = data.split(/\r?\n/);

    const relevantLines = lines.filter(line =>
        line.includes('Variant') ||
        line.includes('Config') ||
        line.includes('SHA1') ||
        line.includes('SHA-256') ||
        line.includes('Alias')
    );

    console.log(relevantLines.join('\n'));

} catch (err) {
    console.error(err);
}
