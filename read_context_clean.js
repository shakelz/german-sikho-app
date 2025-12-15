const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);

    const targetIds = [1005, 1008, 1041, 1043, 1044, 1046, 1048, 1050, 1052, 1053, 1057];
    const surroundingItems = vocab.filter(item => targetIds.includes(item.id));

    surroundingItems.sort((a, b) => a.id - b.id);

    console.log(JSON.stringify(surroundingItems.map(item => ({
        id: item.id,
        german: item.german,
        english: item.english,
        category: item.category
    })), null, 2));

} catch (err) {
    console.error(err);
}
