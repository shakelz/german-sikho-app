import vocabService from './vocabService';
import grammarData from '../data/a1_grammar.json';

const TestService = {

    /**
     * Generates a mixed batch of questions (Grammar + Vocabulary)
     * @param {number} count - Total number of questions
     */
    generateMixedBatch: async (count = 10) => {
        const vocabCount = Math.floor(count / 2);
        const grammarCount = count - vocabCount;

        const vocabQuestions = await TestService.generateVocabQuestions(vocabCount);
        const grammarQuestions = TestService.generateGrammarQuestions(grammarCount);

        return [...vocabQuestions, ...grammarQuestions].sort(() => 0.5 - Math.random());
    },

    /**
     * Generates Reading Questions (Sentence Translation/Comprehension)
     */
    generateReadingQuestions: (count = 10) => {
        // Extract sentences from grammar examples
        const sentences = [];
        grammarData.forEach(lesson => {
            if (lesson.sections) {
                lesson.sections.forEach(section => {
                    if (section.type === 'table' && section.rows) {
                        section.rows.forEach(row => {
                            let german = null;
                            let english = null;

                            // Strategy 1: Look for "German (English)" format in any cell
                            row.forEach(cell => {
                                if (cell && cell.includes('(') && cell.includes(')')) {
                                    const match = cell.match(/([^(]+)\(([^)]+)\)/);
                                    if (match) {
                                        german = match[1].trim();
                                        english = match[2].trim();
                                    }
                                }
                            });

                            // Strategy 2: If no parenthesis, check specific columns based on known formats
                            if (!english) {
                                // Format: [Pronoun, Conjugation, Meaning] -> ["Ich", "bin", "I am"]
                                if (row.length === 3 && !row[2].includes('(')) {
                                    // Check if it looks like a sentence (has spaces)
                                    if (row[2].includes(' ')) {
                                        english = row[2].trim();
                                        // Construct German from parts if needed, or take the example
                                        // For "Ich", "bin", "I am" -> German is "Ich bin"
                                        if (row[0] && row[1]) {
                                            german = `${row[0]} ${row[1]}`;
                                        }
                                    }
                                }
                            }

                            // Strategy 3: Use Headers to identify columns
                            if (!english && section.headers) {
                                const headers = section.headers.map(h => h.toLowerCase());
                                const englishIndex = headers.findIndex(h => h.includes('meaning') || h.includes('english'));
                                const germanIndex = headers.findIndex(h => h.includes('example') || h.includes('german') || h.includes('sentence'));

                                if (englishIndex !== -1 && germanIndex !== -1 && row[englishIndex] && row[germanIndex]) {
                                    english = row[englishIndex].trim();
                                    german = row[germanIndex].trim();

                                    // Clean up if German has (Translation) inside it
                                    if (german.includes('(')) {
                                        german = german.split('(')[0].trim();
                                    }
                                }
                            }

                            // Only add if we have both parts and they look valid
                            if (german && english && english !== "Translation not found") {
                                // Basic validation: German shouldn't be just one word if English is a sentence
                                if (german.includes(' ') || english.split(' ').length < 5) {
                                    sentences.push({ german, english });
                                }
                            }
                        });
                    }
                });
            }
        });

        // Filter out duplicates
        const uniqueSentences = Array.from(new Set(sentences.map(s => JSON.stringify(s))))
            .map(s => JSON.parse(s));

        // Shuffle and pick
        const selected = uniqueSentences.sort(() => 0.5 - Math.random()).slice(0, count);

        return selected.map((item, index) => ({
            id: `reading_${index}`,
            type: 'multiple_choice',
            question: `Translate: "${item.german}"`,
            options: generateWrongOptions(item.english, uniqueSentences),
            correct_answer: item.english,
            difficulty: 'medium'
        }));
    },

    /**
     * Generates Listening Questions (Audio -> Select Correct English)
     */
    generateListeningQuestions: (count = 10) => {
        const readingQuestions = TestService.generateReadingQuestions(count);
        return readingQuestions.map(q => ({
            ...q,
            id: `listening_${q.id}`,
            type: 'listening', // Special type for QuizScreen
            audioText: q.question.replace('Translate: "', '').replace('"', ''), // Extract German text
            question: "Listen and choose the correct translation:"
        }));
    },

    /**
     * Generates the Final Exam (50 Questions: 20 Vocab + 30 Grammar)
     */
    generateFinalExam: async () => {
        const vocabQuestions = await TestService.generateVocabQuestions(20);
        const grammarQuestions = TestService.generateGrammarQuestions(30);

        return [...vocabQuestions, ...grammarQuestions].sort(() => 0.5 - Math.random());
    },

    // --- Helper Functions ---

    generateVocabQuestions: async (count) => {
        const words = await vocabService.getRandomWords(count * 4); // Fetch more to generate wrong options
        const questions = [];

        for (let i = 0; i < count; i++) {
            const target = words[i];
            if (!target) break;

            // Pick 3 random wrong options from the rest of the list
            const wrongOptions = words
                .filter(w => w.german !== target.german)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3)
                .map(w => w.english);

            const options = [...wrongOptions, target.english].sort(() => 0.5 - Math.random());

            questions.push({
                id: `vocab_${i}`,
                type: 'multiple_choice',
                question: `What is "${target.german}"?`,
                options: options,
                correct_answer: target.english,
                difficulty: 'easy'
            });
        }
        return questions;
    },

    generateGrammarQuestions: (count) => {
        const allQuizzes = [];
        grammarData.forEach(lesson => {
            if (lesson.quiz) {
                allQuizzes.push(...lesson.quiz);
            }
        });
        return allQuizzes.sort(() => 0.5 - Math.random()).slice(0, count);
    }
};

// Helper to extract English translation from "German (English)" format
const extractEnglish = (text) => {
    const match = text.match(/\(([^)]+)\)/);
    return match ? match[1] : null;
};

// Helper to generate wrong options for reading/listening
const generateWrongOptions = (correct, allSentences) => {
    const wrong = allSentences
        .filter(s => s.english !== correct && s.english !== "Translation not found")
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(s => s.english);

    return [...wrong, correct].sort(() => 0.5 - Math.random());
};

export default TestService;
