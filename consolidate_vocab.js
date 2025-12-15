const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
const outputFile = path.join(dataDir, 'vocabulary.json');

let allVocab = [];

for (let i = 1; i <= 54; i++) {
    const filePath = path.join(dataDir, `vocab_part${i}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const batch = JSON.parse(content);
            allVocab = allVocab.concat(batch);
        } catch (e) {
            console.error(`Error reading ${filePath}:`, e.message);
        }
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}

// Sort by ID just in case
allVocab.sort((a, b) => a.id - b.id);

fs.writeFileSync(outputFile, JSON.stringify(allVocab, null, 4));
console.log(`Consolidated ${allVocab.length} words into ${outputFile}`);
