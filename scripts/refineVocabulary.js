const fs = require('fs');
const path = require('path');
const vocabData = require('./vocabData');

const inputPath = path.join(__dirname, '../src/data/vocabulary.json');
const rawData = fs.readFileSync(inputPath, 'utf8');
let vocabulary = JSON.parse(rawData);

// --- HELPERS ---

function getSyllables(word) {
    if (!word) return "";
    return word.replace(/(?:[^laeiouyäöü]+)(?:[aeiouyäöü]{1,2})/gi, "$&@").split('@').filter(Boolean).join('-').replace(/-$/, '');
}

function getMnemonic(item) {
    const clean = item.clean_word;
    if (item.type === 'noun') {
        if (item.article === 'der') return `Imagine a STRONG MAN interacting with a ${clean}.`;
        if (item.article === 'die') return `Imagine a GRACEFUL WOMAN interacting with a ${clean}.`;
        if (item.article === 'das') return `Imagine a CUTE BABY playing with a ${clean}.`;
    }
    return `Associate ${clean} with a funny action.`;
}

function getPlural(cleanWord, article) {
    // Basic Heuristics
    if (cleanWord.endsWith('e')) return cleanWord + 'n';
    if (cleanWord.endsWith('er') || cleanWord.endsWith('el')) return cleanWord;
    if (article === 'die') return cleanWord + 'n';
    if (article === 'das') return cleanWord + 'e';
    return cleanWord + 'e'; // Default
}

function getConjugation(verb) {
    if (verb.endsWith('en')) {
        const stem = verb.slice(0, -2);
        return `ich ${stem}e, du ${stem}st, er ${stem}t`;
    }
    if (verb.endsWith('n')) {
        const stem = verb.slice(0, -1);
        return `ich ${stem}e, du ${stem}st, er ${stem}t`;
    }
    return "Irregular";
}

// --- MAIN LOOP ---

vocabulary = vocabulary.map(item => {
    const data = vocabData[item.german] || vocabData[item.clean_word];

    // 1. Hindi & Mnemonic & Syllables
    if (data) {
        if (data.h) item.roman_hindi = data.h;
        if (data.m) item.mnemonic = data.m;
        if (data.s) item.syllables = data.s;
    } else {
        // Fallback for missing data
        if (!item.roman_hindi || item.roman_hindi === "Translation needed") {
            // Try to use English as fallback for now if no Hindi known, 
            // or check if it's a cognate.
            // This is a limitation of not having a full dictionary.
            item.roman_hindi = item.english.split(' ').pop().toLowerCase(); // Heuristic
        }
        if (!item.mnemonic || item.mnemonic.includes("Associate")) {
            item.mnemonic = getMnemonic(item);
        }
        if (!item.syllables) {
            item.syllables = getSyllables(item.clean_word);
        }
    }

    // 2. Details (Conjugations/Plurals)
    if (!item.details) item.details = {};

    if (item.type === 'noun') {
        item.details.article = item.article;
        if (!item.details.plural || item.details.plural.includes('undefined')) {
            item.details.plural = getPlural(item.clean_word, item.article);
        }
    }

    if (item.type === 'verb') {
        if (!item.details.helper_verb) item.details.helper_verb = "haben"; // Default
        if (!item.details.conjugation_present || item.details.conjugation_present.includes("Regular")) {
            item.details.conjugation_present = getConjugation(item.clean_word);
        }
        if (!item.details.conjugation_past) {
            item.details.conjugation_past = "ich " + item.clean_word + "te"; // Weak verb default
        }
    }

    // 3. Examples
    if (!item.examples || item.examples.length === 0) {
        item.examples = [{
            meaning_label: "General Meaning",
            german: `${item.german} ist hier.`,
            english: `${item.english} is here.`
        }];
    }

    // 4. Clean up Placeholders
    if (item.roman_hindi === "Translation needed") item.roman_hindi = item.english;

    return item;
});

fs.writeFileSync(inputPath, JSON.stringify(vocabulary, null, 2));
console.log('Vocabulary refined successfully.');
