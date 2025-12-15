import grammarData from '../data/a1_grammar.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GRAMMAR_PROGRESS_KEY = 'grammar_progress';

export const getLessonsByTile = (tileId) => {
    let lessonIds = [];
    switch (tileId) {
        // --- Jungle Theme (Basics) ---
        case 'articles':
            lessonIds = ['articles'];
            break;
        case 'nouns':
            // Placeholder: Map to articles as it covers gender
            lessonIds = ['articles'];
            break;
        case 'pronouns':
            lessonIds = ['pronouns'];
            break;
        case 'basic_verbs':
            lessonIds = ['sein', 'haben', 'regular_verbs'];
            break;
        case 'sentence_structure':
            lessonIds = ['sentence_structure'];
            break;

        // --- Desert Theme (Structure) ---
        case 'nom_acc': // Was 'cases'
            lessonIds = ['nom_acc'];
            break;
        case 'negation':
            lessonIds = ['negation'];
            break;
        case 'possessive': // Was 'possession'
            lessonIds = ['possessive', 'possessive_acc'];
            break;
        case 'w_questions': // Was 'questions'
            lessonIds = ['w_questions'];
            break;
        case 'modal_verbs':
            lessonIds = ['modal_verbs'];
            break;

        // --- Snow Theme (Advanced) ---
        case 'time_date':
            lessonIds = ['time_date'];
            break;
        case 'adjectives':
            lessonIds = ['adjectives'];
            break;
        case 'prepositions_acc': // Was 'prepositions'
            lessonIds = ['prepositions_acc'];
            break;
        case 'separable_verbs':
            lessonIds = ['separable_verbs'];
            break;
        case 'imperative': // Was 'commands'
            lessonIds = ['imperative'];
            break;
        case 'sentence_master': // Was 'word_order_3'
            lessonIds = ['word_order_2', 'word_order_3'];
            break;

        // Fallback for direct ID usage
        default:
            // If the tileId matches a lesson ID directly, return it
            lessonIds = [tileId];
            break;
    }

    return grammarData.filter(lesson => lessonIds.includes(lesson.id));
};

export const getLessonProgress = async () => {
    try {
        const progress = await AsyncStorage.getItem(GRAMMAR_PROGRESS_KEY);
        return progress ? JSON.parse(progress) : {};
    } catch (error) {
        console.error('Error getting grammar progress:', error);
        return {};
    }
};

export const markLessonComplete = async (lessonId) => {
    try {
        const progress = await getLessonProgress();
        // Preserve existing data if it's an object, otherwise set default object
        if (typeof progress[lessonId] === 'object') {
            progress[lessonId].completed = true;
        } else {
            progress[lessonId] = { completed: true, score: 0, total: 0, stars: 0 };
        }
        await AsyncStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Error marking lesson complete:', error);
    }
};

export const isLessonUnlocked = (lessonId, allLessons, progress) => {
    const index = allLessons.findIndex(l => l.id === lessonId);
    if (index === 0) return true; // First lesson always unlocked
    const previousLessonId = allLessons[index - 1].id;
    const previousLessonData = progress[previousLessonId];
    return previousLessonData === true || (previousLessonData && previousLessonData.completed);
};

export const isTileComplete = (tileId, progress) => {
    const lessons = getLessonsByTile(tileId);
    if (!lessons || lessons.length === 0) return false;
    // Check if EVERY lesson in this tile is marked as true (completed)
    // Progress object structure: { lessonId: { completed: true, score: 8, total: 10 } } OR { lessonId: true } (legacy)
    return lessons.every(lesson => {
        const lessonData = progress[lesson.id];
        return lessonData === true || (lessonData && lessonData.completed);
    });
};

export const saveLessonScore = async (lessonId, score, total) => {
    try {
        const progress = await getLessonProgress();
        // Update structure to store object instead of just boolean
        progress[lessonId] = {
            completed: true,
            score: score,
            total: total,
            stars: calculateStars(score, total)
        };
        await AsyncStorage.setItem(GRAMMAR_PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
        console.error('Error saving lesson score:', error);
    }
};

export const calculateStars = (score, total) => {
    const percentage = (score / total) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
};

export const getTileStars = (tileId, progress) => {
    const lessons = getLessonsByTile(tileId);
    if (!lessons || lessons.length === 0) return 0;

    let totalStars = 0;
    let lessonCount = 0;

    lessons.forEach(lesson => {
        const lessonData = progress[lesson.id];
        if (lessonData && lessonData.stars) {
            totalStars += lessonData.stars;
        }
        lessonCount++;
    });

    if (lessonCount === 0) return 0;
    // Return average stars rounded down (or nearest)
    return Math.round(totalStars / lessonCount);
};
