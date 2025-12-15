const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'src', 'data');
let allVocab = [];
let ids = new Set();
let words = new Set();
let duplicates = [];
let duplicateIds = [];

// Read all vocab_partX.json files
for (let i = 1; i <= 54; i++) {
    const filePath = path.join(dataDir, `vocab_part${i}.json`);
    if (fs.existsSync(filePath)) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const batch = JSON.parse(content);
            batch.forEach(item => {
                // Check for duplicate IDs
                if (ids.has(item.id)) {
                    duplicateIds.push({ id: item.id, file: `vocab_part${i}.json` });
                } else {
                    ids.add(item.id);
                }

                // Check for duplicate German words (case-insensitive)
                // Use clean_word if available, otherwise german (but clean_word should be there)
                const wordToCheck = item.clean_word || item.german;
                const lowerWord = wordToCheck.toLowerCase();

                if (words.has(lowerWord)) {
                    duplicates.push({ word: wordToCheck, id: item.id, file: `vocab_part${i}.json` });
                } else {
                    words.add(lowerWord);
                }

                allVocab.push(item);
            });
        } catch (e) {
            console.error(`Error reading ${filePath}:`, e.message);
        }
    } else {
        console.warn(`File not found: ${filePath}`);
    }
}

console.log(`Total words loaded: ${allVocab.length}`);
console.log(`Unique IDs: ${ids.size}`);
console.log(`Unique Words: ${words.size}`);

if (duplicateIds.length > 0) {
    console.log('Duplicate IDs found:', duplicateIds);
} else {
    console.log('No duplicate IDs found.');
}

if (duplicates.length > 0) {
    console.log('Duplicate words found:', duplicates);
} else {
    console.log('No duplicate words found.');
}
