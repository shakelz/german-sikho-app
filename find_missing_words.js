const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);

    const candidates = [
        "Luft", "Markt", "Mensch", "Nacht", "Name", "nehmen", "neu", "nicht", "öffnen", "oft", "ohne", "Ort", "Papier", "Party", "Pass", "Pause", "Problem", "reisen", "rennen", "richtig", "Sache", "sagen", "Salat", "Salz", "sauber", "schlafen", "schlecht", "schnell", "schreiben", "Schuh", "Schule", "schwer", "Schwester", "schwimmen", "sehen", "sehr", "sein"
    ];

    const existingWords = new Set(vocab.map(item => item.clean_word || item.german));
    const missing = candidates.filter(word => !existingWords.has(word) && !existingWords.has("die " + word) && !existingWords.has("der " + word) && !existingWords.has("das " + word));

    console.log("Missing words found:");
    missing.forEach(word => console.log(word));

} catch (err) {
    console.error(err);
}
