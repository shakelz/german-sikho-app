import AsyncStorage from '@react-native-async-storage/async-storage';

const VOCAB_URL = 'https://germansikho.pages.dev/vocabulary.json';
const CACHE_KEY = 'vocabulary_cache';
const SRS_DATA_KEY = 'srs_progress_data';

const vocabService = {
    /**
     * Master function: Fetches data from Remote URL and merges with Local SRS Data
     */
    fetchData: async () => {
        try {
            // 1. Fetch Vocabulary
            console.log('🌐 Fetching vocabulary from Cloudflare...');
            let remoteData = [];
            try {
                const response = await fetch(VOCAB_URL);
                if (response.ok) {
                    remoteData = await response.json();
                    await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(remoteData));
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (networkError) {
                console.warn('⚠️ Network failed, loading from cache:', networkError);
                const cachedData = await AsyncStorage.getItem(CACHE_KEY);
                if (cachedData) {
                    remoteData = JSON.parse(cachedData);
                } else {
                    throw networkError;
                }
            }

            // 2. Fetch SRS Progress
            const srsDataJson = await AsyncStorage.getItem(SRS_DATA_KEY);
            const srsData = srsDataJson ? JSON.parse(srsDataJson) : {};

            // 3. Merge Data
            const mergedData = remoteData.map(word => {
                const progress = srsData[word.german] || {}; // Use German word as ID for now
                return {
                    ...word,
                    nextReviewDate: progress.nextReviewDate || new Date().toISOString(),
                    interval: progress.interval || 1, // Days
                    repetition: progress.repetition || 0,
                    ef: progress.ef || 2.5, // Easiness Factor
                };
            });

            return mergedData;

        } catch (error) {
            console.error('Error in fetchData:', error);
            throw error;
        }
    },

    /**
     * Updates the SRS progress for a specific word
     * @param {string} wordId - The unique identifier (currently using German word)
     * @param {string} quality - 'again', 'hard', 'good'
     */
    updateWordProgress: async (wordId, quality) => {
        try {
            const srsDataJson = await AsyncStorage.getItem(SRS_DATA_KEY);
            let srsData = srsDataJson ? JSON.parse(srsDataJson) : {};

            let currentProgress = srsData[wordId] || {
                interval: 1,
                repetition: 0,
                ef: 2.5,
                nextReviewDate: new Date().toISOString()
            };

            let { interval, repetition, ef } = currentProgress;

            // SRS Algorithm (Simplified SuperMemo-2)
            if (quality === 'again') {
                interval = 1;
                repetition = 0;
            } else if (quality === 'hard') {
                interval = Math.max(1, Math.floor(interval * 1.2));
                repetition += 1;
            } else if (quality === 'good') {
                interval = Math.max(1, Math.floor(interval * 2.5));
                repetition += 1;
            }

            // Calculate Next Review Date
            const nextDate = new Date();
            nextDate.setDate(nextDate.getDate() + interval);

            srsData[wordId] = {
                interval,
                repetition,
                ef,
                nextReviewDate: nextDate.toISOString()
            };

            await AsyncStorage.setItem(SRS_DATA_KEY, JSON.stringify(srsData));
            console.log(`✅ Updated SRS for ${wordId}: Next review in ${interval} days`);

        } catch (error) {
            console.error('Error updating SRS progress:', error);
        }
    },

    /**
     * Returns words that are due for review (nextReviewDate <= today)
     */
    getDueWords: async () => {
        const allWords = await vocabService.fetchData();
        const now = new Date();
        return allWords.filter(word => new Date(word.nextReviewDate) <= now);
    },

    /**
     * Returns all words for the dictionary
     */
    getAllWords: async () => {
        return await vocabService.fetchData();
    },

    /**
     * Returns the count of words considered 'learned' (interval > 1 day)
     */
    getLearnedCount: async () => {
        const allWords = await vocabService.fetchData();
        return allWords.filter(word => (word.interval || 0) > 1).length;
    },

    // --- Compatibility Methods (Keeping existing API working) ---

    fetchVocabItems: async (moduleId) => {
        const allWords = await vocabService.fetchData();
        if (!moduleId) return allWords;

        // Special handling for Jungle Theme Treasures
        if (moduleId === 'jungle_easy') {
            const jungleKeywords = ['tree', 'river', 'forest', 'animal', 'green', 'water', 'sun', 'flower', 'plant', 'nature', 'bird', 'fish'];
            return allWords.filter(word =>
                jungleKeywords.some(k => word.english.toLowerCase().includes(k))
            );
        }

        // 1. Family Members (Treasure 1) - Limit 10
        if (moduleId === 'family_members') {
            const familyKeywords = ['mother', 'father', 'sister', 'brother', 'son', 'daughter', 'family', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin', 'parents', 'wife', 'husband'];
            const familyWords = allWords.filter(word =>
                familyKeywords.some(k => word.english.toLowerCase().includes(k))
            );
            return familyWords.slice(0, 10);
        }

        // 2. Easy Verbs (Treasure 2) - Limit 15
        if (moduleId === 'easy_verbs') {
            const verbKeywords = ['eat', 'drink', 'sleep', 'go', 'run', 'play', 'read', 'write', 'speak', 'learn', 'see', 'hear', 'come', 'give', 'take', 'make', 'do', 'say', 'know', 'think', 'walk', 'buy', 'love', 'live', 'work'];
            const verbWords = allWords.filter(word =>
                verbKeywords.some(k => {
                    const eng = word.english.toLowerCase();
                    return eng === k || eng.startsWith('to ' + k) || eng.includes(' ' + k);
                })
            );
            return verbWords.slice(0, 15);
        }

        // 3. Vocab World-1 (100 Words)
        if (moduleId === 'vocab_world_1') {
            return allWords.slice(0, 100);
        }

        // 4. Desert Treasure 1 (20 Words)
        if (moduleId === 't3') {
            return [
                { german: 'die Wüste', english: 'the desert' },
                { german: 'der Sand', english: 'the sand' },
                { german: 'die Sonne', english: 'the sun' },
                { german: 'heiß', english: 'hot' },
                { german: 'trocken', english: 'dry' },
                { german: 'das Wasser', english: 'the water' },
                { german: 'der Durst', english: 'the thirst' },
                { german: 'trinken', english: 'to drink' },
                { german: 'das Kamel', english: 'the camel' },
                { german: 'die Oase', english: 'the oasis' },
                { german: 'die Reise', english: 'the journey' },
                { german: 'gehen', english: 'to go' },
                { german: 'suchen', english: 'to search' },
                { german: 'finden', english: 'to find' },
                { german: 'der Weg', english: 'the way' },
                { german: 'verloren', english: 'lost' },
                { german: 'die Karte', english: 'the map' },
                { german: 'der Kompass', english: 'the compass' },
                { german: 'der Tag', english: 'the day' },
                { german: 'die Nacht', english: 'the night' }
            ];
        }

        // 5. Desert Treasure 2 (25 Words)
        if (moduleId === 't4') {
            return [
                { german: 'die Stadt', english: 'the city' },
                { german: 'das Dorf', english: 'the village' },
                { german: 'das Haus', english: 'the house' },
                { german: 'die Straße', english: 'the street' },
                { german: 'der Markt', english: 'the market' },
                { german: 'kaufen', english: 'to buy' },
                { german: 'verkaufen', english: 'to sell' },
                { german: 'das Geld', english: 'the money' },
                { german: 'teuer', english: 'expensive' },
                { german: 'billig', english: 'cheap' },
                { german: 'das Essen', english: 'the food' },
                { german: 'kochen', english: 'to cook' },
                { german: 'das Zelt', english: 'the tent' },
                { german: 'schlafen', english: 'to sleep' },
                { german: 'der Traum', english: 'the dream' },
                { german: 'aufwachen', english: 'to wake up' },
                { german: 'müde', english: 'tired' },
                { german: 'stark', english: 'strong' },
                { german: 'schwach', english: 'weak' },
                { german: 'schnell', english: 'fast' },
                { german: 'langsam', english: 'slow' },
                { german: 'groß', english: 'big' },
                { german: 'klein', english: 'small' },
                { german: 'schön', english: 'beautiful' },
                { german: 'hässlich', english: 'ugly' }
            ];
        }

        // 6. Vocab World-2 (100 Words)
        if (moduleId === 'vocab_world_2') {
            return allWords.slice(100, 200);
        }

        // 7. Snow Treasure 1 (30 Words)
        if (moduleId === 'ts3') {
            return [
                { german: 'der Schnee', english: 'the snow' },
                { german: 'das Eis', english: 'the ice' },
                { german: 'kalt', english: 'cold' },
                { german: 'der Winter', english: 'the winter' },
                { german: 'der Schal', english: 'the scarf' },
                { german: 'die Mütze', english: 'the hat' },
                { german: 'die Handschuhe', english: 'the gloves' },
                { german: 'die Jacke', english: 'the jacket' },
                { german: 'die Stiefel', english: 'the boots' },
                { german: 'der Ski', english: 'the ski' },
                { german: 'der Schlitten', english: 'the sled' },
                { german: 'der Schneemann', english: 'the snowman' },
                { german: 'weiß', english: 'white' },
                { german: 'frieren', english: 'to freeze' },
                { german: 'schmelzen', english: 'to melt' },
                { german: 'der Kamin', english: 'the fireplace' },
                { german: 'der Tee', english: 'the tea' },
                { german: 'die heiße Schokolade', english: 'the hot chocolate' },
                { german: 'die Decke', english: 'the blanket' },
                { german: 'die Heizung', english: 'the heater' },
                { german: 'der Wind', english: 'the wind' },
                { german: 'der Sturm', english: 'the storm' },
                { german: 'die Schneeflocke', english: 'the snowflake' },
                { german: 'der Eiszapfen', english: 'the icicle' },
                { german: 'rutschig', english: 'slippery' },
                { german: 'gefroren', english: 'frozen' },
                { german: 'der Dezember', english: 'December' },
                { german: 'der Januar', english: 'January' },
                { german: 'der Februar', english: 'February' },
                { german: 'Weihnachten', english: 'Christmas' }
            ];
        }

        // 8. Snow Treasure 2 (35 Words)
        if (moduleId === 'ts4') {
            return [
                { german: 'der Berg', english: 'the mountain' },
                { german: 'das Tal', english: 'the valley' },
                { german: 'der Gipfel', english: 'the peak' },
                { german: 'die Piste', english: 'the slope' },
                { german: 'der Lift', english: 'the lift' },
                { german: 'die Hütte', english: 'the cabin' },
                { german: 'das Holz', english: 'the wood' },
                { german: 'der Wald', english: 'the forest' },
                { german: 'das Reh', english: 'the deer' },
                { german: 'der Wolf', english: 'the wolf' },
                { german: 'der Bär', english: 'the bear' },
                { german: 'der Winterschlaf', english: 'hibernation' },
                { german: 'die Spur', english: 'the track' },
                { german: 'der Weg', english: 'the path' },
                { german: 'wandern', english: 'to hike' },
                { german: 'klettern', english: 'to climb' },
                { german: 'fallen', english: 'to fall' },
                { german: 'springen', english: 'to jump' },
                { german: 'rennen', english: 'to run' },
                { german: 'laufen', english: 'to walk' },
                { german: 'die Aussicht', english: 'the view' },
                { german: 'die Landschaft', english: 'the landscape' },
                { german: 'die Natur', english: 'nature' },
                { german: 'ruhig', english: 'quiet' },
                { german: 'friedlich', english: 'peaceful' },
                { german: 'dunkel', english: 'dark' },
                { german: 'hell', english: 'light' },
                { german: 'die Sonne', english: 'the sun' },
                { german: 'der Mond', english: 'the moon' },
                { german: 'der Stern', english: 'the star' },
                { german: 'der Himmel', english: 'the sky' },
                { german: 'die Wolke', english: 'the cloud' },
                { german: 'der Nebel', english: 'the fog' },
                { german: 'der Dunst', english: 'the mist' },
                { german: 'kalt', english: 'cold' }
            ];
        }

        // 9. Vocab World 3 (100 Words)
        if (moduleId === 'vocab_world_3') {
            return allWords.slice(200, 300);
        }

        // 10. Vocab World 4 (Remaining Words)
        if (moduleId === 'vocab_world_4') {
            return allWords.slice(300);
        }

        // Generic Filter
        return allWords.filter(word =>
            (word.moduleId === moduleId) ||
            (word.category && word.category.toLowerCase() === moduleId.toLowerCase()) ||
            (word.tags && word.tags.includes(moduleId))
        );
    },

    getWordsByCategory: async (category) => {
        return vocabService.fetchVocabItems(category);
    },

    getRandomWords: async (count) => {
        const allWords = await vocabService.fetchData();
        const shuffled = [...allWords].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, count);
    },

    fetchQuizQuestions: async () => []
};

export default vocabService;