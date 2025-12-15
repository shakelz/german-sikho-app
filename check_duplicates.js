const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);

    const candidates = [
        "Rechnung", "trinken", "gesund", "helfen", "leben", "müssen", "singen", "spielen", "tanzen"
    ];

    const existing = vocab.filter(item => candidates.includes(item.clean_word) || candidates.includes(item.german));

    if (existing.length > 0) {
        console.log("Existing words found:");
        existing.forEach(item => console.log(`${item.id}: ${item.german}`));
    } else {
        console.log("No duplicates found for candidates.");
    }

} catch (err) {
    console.error(err);
}
