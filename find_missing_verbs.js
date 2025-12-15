const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/data/vocabulary_part2.json');

try {
    const data = fs.readFileSync(filePath, 'utf8');
    const vocab = JSON.parse(data);

    const candidates = [
        "abholen", "anfangen", "anrufen", "antworten", "arbeiten", "bekommen", "bestellen", "besuchen", "bezahlen", "bleiben", "brauchen", "bringen", "danken", "denken", "diskutieren", "drucken", "duschen", "empfehlen", "essen", "fahren", "feiern", "finden", "fliegen", "fragen", "frühstücken", "geben", "gefallen", "gehen", "gehören", "glauben", "haben", "halten", "hängen", "hoffen", "hören", "kaufen", "kennen", "kochen", "kommen", "können", "kosten", "lächeln", "laufen", "legen", "lernen", "lesen", "lieben", "machen", "meinen", "nehmen", "öffnen", "packen", "passen", "planen", "probieren", "putzen", "rauchen", "regnen", "reisen", "reparieren", "reservieren", "riechen", "sagen", "schaden", "schaffen", "schauen", "scheinen", "schenken", "schicken", "schlafen", "schmecken", "schneiden", "schneien", "schreiben", "schwimmen", "sehen", "sein", "setzen", "singen", "sitzen", "sollen", "spielen", "sprechen", "spülen", "stattfinden", "stehen", "stellen", "sterben", "stimmen", "stören", "studieren", "suchen", "tanzen", "tauschen", "teilnehmen", "telefonieren", "tragen", "träumen", "treffen", "trinken", "tun", "üben", "übernachten", "übersetzen", "umsteigen", "umziehen", "unterrichten", "unterschreiben", "untersuchen", "verdienen", "vergessen", "verkaufen", "verlieren", "versprechen", "verstehen", "versuchen", "warten", "waschen", "wechseln", "wecken", "werden", "wiederholen", "wissen", "wohnen", "wünschen", "zahlen", "zeigen", "ziehen", "zuhören"
    ];

    const existingWords = new Set(vocab.map(item => item.clean_word || item.german));
    const missing = candidates.filter(word => !existingWords.has(word));

    console.log("Missing words found:");
    missing.forEach(word => console.log(word));

} catch (err) {
    console.error(err);
}
