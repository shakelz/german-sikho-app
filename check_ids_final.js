const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);
    const ids = vocab.map(item => item.id).sort((a, b) => a - b);

    const maxId = ids[ids.length - 1];
    const missingIds = [];

    for (let i = 1; i <= maxId; i++) {
        if (!ids.includes(i)) {
            missingIds.push(i);
        }
    }

    console.log(JSON.stringify({
        totalItems: ids.length,
        maxId: maxId,
        missingCount: missingIds.length,
        missingIds: missingIds
    }, null, 2));

} catch (err) {
    console.error(err);
}
