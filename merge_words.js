const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');
const newWordsPath = path.join(__dirname, 'new_words.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);

    const newWordsData = fs.readFileSync(newWordsPath, 'utf8');
    const newWords = JSON.parse(newWordsData);

    // Merge
    const mergedVocab = [...vocab, ...newWords];

    // Sort by ID
    mergedVocab.sort((a, b) => a.id - b.id);

    // Write back
    fs.writeFileSync(filePath, JSON.stringify(mergedVocab, null, 4));

    console.log(`Successfully merged ${newWords.length} new words. Total items: ${mergedVocab.length}`);

} catch (err) {
    console.error(err);
}
