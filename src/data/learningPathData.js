export const PHASES = [
    {
        id: 'phase_1',
        theme: 'forest',
        backgroundImage: require('../assets/icons/forest_background.png'),
        nodes: [
            {
                id: 'articles',
                type: 'level',
                title: 'Articles',
                tile: 'tile_1',
                icon: 'book',
                stars: 2,
                // Bottom start position
                top: '80%',
                left: '17%',
                scale: 0.8, // Reduced size as requested (was 1.0)
                zIndex: 10
            },
            {
                id: 'chest_river',
                type: 'treasure',
                title: '10 Words',
                wordCount: 10,
                // River Chest
                top: '78%',
                left: '66%',
                scale: 0.8,
                zIndex: 9
            },
            {
                id: 'nouns',
                type: 'level',
                title: 'Nouns',
                tile: 'tile_2',
                icon: 'chat',
                stars: 3,
                // 45% from bottom = top 55%
                // 50% from right = left 50%
                top: '70%',
                left: '36%',
                scale: 0.68,
                zIndex: 8
            },
            {
                id: 'pronouns',
                type: 'level',
                title: 'Pronouns',
                tile: 'tile_3',
                icon: 'book',
                stars: 1,
                top: '64%',
                left: '68%',
                scale: 0.6,
                zIndex: 7
            },
            {
                id: 'chest_tree',
                type: 'treasure',
                title: '15 Words',
                wordCount: 15,
                // Tree Chest
                top: '58%',
                left: '50%',
                scale: 0.5,
                zIndex: 6
            },
            {
                id: 'basic_verbs',
                type: 'level',
                title: 'Basic Verbs',
                tile: 'tile_4',
                icon: 'book',
                stars: 0,
                top: '53%',
                left: '75%',
                scale: 0.50,
                zIndex: 5
            },
            {
                id: 'sentence_structure',
                type: 'level',
                title: 'Sentence Structure',
                tile: 'tile_5',
                icon: 'book',
                stars: 0,
                top: '48%',
                left: '52%',
                scale: 0.50,
                zIndex: 4
            }
        ]
    },
    {
        id: 'phase_2',
        theme: 'desert',
        backgroundImage: require('../assets/icons/desert_background.png'),
        nodes: [
            // Applying same layout to Phase 2
            { id: 'akkusativ', type: 'level', title: 'Akkusativ', tile: 'tile_6', icon: 'book', stars: 0, top: '90%', left: '25%', scale: 0.7, zIndex: 10 },
            { id: 't3', type: 'treasure', title: '20 Words', wordCount: 20, top: '80%', left: '50%', scale: 0.8, zIndex: 9 },
            { id: 'negation', type: 'level', title: 'Negation', tile: 'tile_1', icon: 'book', stars: 0, top: '73%', left: '63%', scale: 0.60, zIndex: 8 },
            { id: 'possessive_pronouns', type: 'level', title: 'Possessive Pronouns', tile: 'tile_2', icon: 'book', stars: 0, top: '65%', left: '25%', scale: 0.55, zIndex: 7 },
            { id: 't4', type: 'treasure', title: '25 Words', wordCount: 25, top: '65%', left: '90%', scale: 0.6, zIndex: 6 },
            { id: 'modal_verbs', type: 'level', title: 'Modal Verbs', tile: 'tile_3', icon: 'book', stars: 0, top: '60%', left: '50%', scale: 0.50, zIndex: 5 },
            { id: 'w_questions', type: 'level', title: 'W-Questions', tile: 'tile_4', icon: 'book', stars: 0, top: '54%', left: '70%', scale: 0.40, zIndex: 4 },
        ]
    },
    {
        id: 'phase_3',
        theme: 'snow',
        backgroundImage: require('../assets/icons/snow_background.png'),
        nodes: [
            { id: 'time_dates', type: 'level', title: 'Time & Dates', tile: 'tile_1', icon: 'book', stars: 0, top: '85%', left: '53%', scale: 0.8, zIndex: 10 },
            { id: 'ts3', type: 'treasure', title: '30 Words', wordCount: 30, top: '75%', left: '67%', scale: 0.8, zIndex: 9 },
            { id: 'separable_verbs', type: 'level', title: 'Separable Verbs', tile: 'tile_2', icon: 'book', stars: 0, top: '75%', left: '35%', scale: 0.60, zIndex: 8 },
            { id: 'prepositions', type: 'level', title: 'Prepositions', tile: 'tile_3', icon: 'book', stars: 0, top: '68%', left: '55%', scale: 0.60, zIndex: 7 },
            { id: 'ts4', type: 'treasure', title: '35 Words', wordCount: 35, top: '60%', left: '35%', scale: 0.6, zIndex: 6 },
            { id: 'adjectives', type: 'level', title: 'Adjectives', tile: 'tile_4', icon: 'book', stars: 0, top: '55%', left: '65%', scale: 0.60, zIndex: 5 },
            { id: 'imperative', type: 'level', title: 'Imperative', tile: 'tile_5', icon: 'book', stars: 0, top: '49%', left: '30%', scale: 0.55, zIndex: 4 },
            { id: 'word_order', type: 'level', title: 'Word Order', tile: 'tile_6', icon: 'book', stars: 0, top: '40%', left: '60%', scale: 0.5, zIndex: 3 },
        ]
    },
    {
        id: 'phase_4',
        theme: 'lava',
        backgroundImage: require('../assets/icons/lava_background.png'),
        nodes: [
            { id: 'mixed_practice', type: 'level', title: 'Mixed Practice', tile: 'tile_4', icon: 'book', stars: 0, top: '85%', left: '50%', scale: 0.6, zIndex: 10 },
            { id: 'listening_practice', type: 'level', title: 'Listening', tile: 'tile_5', icon: 'book', stars: 0, top: '79%', left: '10%', scale: 0.6, zIndex: 9 },
            { id: 'reading_practice', type: 'level', title: 'Reading', tile: 'tile_6', icon: 'book', stars: 0, top: '72%', left: '35%', scale: 0.6, zIndex: 8 },
            { id: 'final_exam', type: 'level', title: 'Final Exam', tile: 'tile_1', icon: 'book', stars: 0, top: '68%', left: '82%', scale: 0.6, zIndex: 7 },
            { id: 'unlock_a2', type: 'treasure', title: 'Unlock A2', wordCount: 0, top: '75%', left: '60%', scale: 0.6, zIndex: 6 },
        ]
    }
];

export const TILES = {
    tile_1: require('../assets/icons/tile_1.png'),
    tile_2: require('../assets/icons/tile_2.png'),
    tile_3: require('../assets/icons/tile_3.png'),
    tile_4: require('../assets/icons/tile_4.png'),
    tile_5: require('../assets/icons/tile_5.png'),
    tile_6: require('../assets/icons/tile_6.png'),
};

export const ICONS = {
    book: require('../assets/icons/book.png'),
    chat: require('../assets/icons/book.png'),
    abc: require('../assets/icons/letter_A.png'),
};
