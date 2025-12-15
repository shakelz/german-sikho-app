export const LESSON_CONTENT = {
    articles: {
        title: 'German Articles',
        subtitle: 'Der, Die, Das',
        intro: 'In German, there are three definite articles: Der (Masculine), Die (Feminine), and Das (Neuter).',
        sections: [
            {
                title: 'The Three Genders',
                content: [
                    { de: 'Der Mann', en: 'The Man (Masculine)' },
                    { de: 'Die Frau', en: 'The Woman (Feminine)' },
                    { de: 'Das Kind', en: 'The Child (Neuter)' },
                ]
            }
        ],
        tips: [
            'Memorize the article with the noun.',
            'Plural nouns always use "Die".'
        ],
        quizQuestions: [
            {
                question: 'What is the article for "Mann"?',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Der'
            },
            {
                question: 'Which article is for feminine nouns?',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Die'
            },
            {
                question: 'What is the article for "Kind"?',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Das'
            }
        ]
    },
    nouns: {
        title: 'German Nouns',
        subtitle: 'Substantive',
        intro: 'In German, every noun has a gender: Masculine, Feminine, or Neuter. Also, all nouns are capitalized!',
        sections: [
            {
                title: '🔵 Masculine (Der)',
                content: [
                    { de: 'der Mann', en: 'the man' },
                    { de: 'der Hund', en: 'the dog' },
                    { de: 'der Apfel', en: 'the apple' },
                ]
            },
            {
                title: '🔴 Feminine (Die)',
                content: [
                    { de: 'die Frau', en: 'the woman' },
                    { de: 'die Katze', en: 'the cat' },
                    { de: 'die Blume', en: 'the flower' },
                ]
            },
            {
                title: '🟢 Neuter (Das)',
                content: [
                    { de: 'das Kind', en: 'the child' },
                    { de: 'das Buch', en: 'the book' },
                    { de: 'das Auto', en: 'the car' },
                ]
            }
        ],
        tips: [
            'Always capitalize nouns in German.',
            'Learn the article (der/die/das) together with the word.',
            'Words ending in -ung, -heit, -keit are usually feminine.'
        ],
        quizQuestions: [
            {
                question: 'Which word is capitalized correctly?',
                options: ['apfel', 'Apfel', 'APFEL'],
                correctAnswer: 'Apfel'
            },
            {
                question: 'What is the gender of "Frau"?',
                options: ['Masculine', 'Feminine', 'Neuter'],
                correctAnswer: 'Feminine'
            },
            {
                question: 'What is the article for "Buch"?',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Das'
            }
        ]
    },
    pronouns: {
        title: 'Personal Pronouns',
        subtitle: 'Personalpronomen',
        intro: 'Pronouns replace nouns. Here are the most common ones you need to know.',
        sections: [
            {
                title: 'Singular',
                content: [
                    { de: 'ich', en: 'I' },
                    { de: 'du', en: 'you (informal)' },
                    { de: 'er / sie / es', en: 'he / she / it' },
                ]
            },
            {
                title: 'Plural',
                content: [
                    { de: 'wir', en: 'we' },
                    { de: 'ihr', en: 'you (plural)' },
                    { de: 'sie / Sie', en: 'they / You (formal)' },
                ]
            }
        ],
        tips: [
            'Use "du" for friends and family.',
            'Use "Sie" (capitalized) for strangers and formal situations.',
            '"es" is used for neuter nouns like "das Kind".'
        ],
        quizQuestions: [
            {
                question: 'How do you say "I" in German?',
                options: ['du', 'ich', 'wir'],
                correctAnswer: 'ich'
            },
            {
                question: 'Which pronoun is formal?',
                options: ['du', 'ihr', 'Sie'],
                correctAnswer: 'Sie'
            },
            {
                question: 'Translate "we".',
                options: ['wir', 'ihr', 'sie'],
                correctAnswer: 'wir'
            }
        ]
    },
    basic_verbs: {
        title: 'Basic Verbs',
        subtitle: 'Verben',
        intro: 'Verbs describe actions. In German, the verb ending changes depending on who is doing the action.',
        sections: [
            {
                title: 'sein (to be)',
                content: [
                    { de: 'ich bin', en: 'I am' },
                    { de: 'du bist', en: 'you are' },
                    { de: 'er ist', en: 'he is' },
                ]
            },
            {
                title: 'haben (to have)',
                content: [
                    { de: 'ich habe', en: 'I have' },
                    { de: 'du hast', en: 'you have' },
                    { de: 'er hat', en: 'he has' },
                ]
            },
            {
                title: 'kommen (to come)',
                content: [
                    { de: 'ich komme', en: 'I come' },
                    { de: 'du kommst', en: 'you come' },
                    { de: 'er kommt', en: 'he comes' },
                ]
            }
        ],
        tips: [
            'Most verbs end in -en (e.g., machen, gehen).',
            'The "ich" form usually ends in -e.',
            'The "du" form usually ends in -st.'
        ],
        quizQuestions: [
            {
                question: 'Conjugate "sein" for "ich".',
                options: ['bin', 'bist', 'ist'],
                correctAnswer: 'bin'
            },
            {
                question: 'Translate "du hast".',
                options: ['I have', 'you have', 'he has'],
                correctAnswer: 'you have'
            },
            {
                question: 'What is the ending for "ich" verbs?',
                options: ['-st', '-en', '-e'],
                correctAnswer: '-e'
            }
        ]
    },
    sentence_structure: {
        title: 'Sentence Structure',
        subtitle: 'Satzbau',
        intro: 'German sentence structure is a bit different from English. The most important rule is about the verb.',
        sections: [
            {
                title: 'Main Rule: Verb Position 2',
                content: [
                    { de: 'Ich [bin] müde.', en: 'I [am] tired.' },
                    { de: 'Er [spielt] Fußball.', en: 'He [plays] soccer.' },
                    { de: 'Wir [gehen] nach Hause.', en: 'We [go] home.' },
                ]
            },
            {
                title: 'Questions: Verb Position 1',
                content: [
                    { de: '[Bist] du müde?', en: '[Are] you tired?' },
                    { de: '[Spielt] er Fußball?', en: '[Does] he play soccer?' },
                ]
            }
        ],
        tips: [
            'In a normal sentence, the verb is always the second element.',
            'The subject (ich, du, der Mann) is usually first, but can be third.',
            'Time expressions often come before place expressions.'
        ],
        quizQuestions: [
            {
                question: 'Where does the verb go in a normal sentence?',
                options: ['Position 1', 'Position 2', 'Last'],
                correctAnswer: 'Position 2'
            },
            {
                question: 'Translate: "I am tired."',
                options: ['Ich müde bin.', 'Ich bin müde.', 'Bin ich müde.'],
                correctAnswer: 'Ich bin müde.'
            },
            {
                question: 'Where does the verb go in a question?',
                options: ['Position 1', 'Position 2', 'Last'],
                correctAnswer: 'Position 1'
            }
        ]
    },
    chest_river: {
        title: '10 Common Words',
        subtitle: 'Wortschatz',
        words: [
            { de: 'Hallo', en: 'Hello' },
            { de: 'Tschüss', en: 'Bye' },
            { de: 'Ja', en: 'Yes' },
            { de: 'Nein', en: 'No' },
            { de: 'Danke', en: 'Thanks' },
            { de: 'Bitte', en: 'Please' },
            { de: 'Entschuldigung', en: 'Sorry' },
            { de: 'Guten Morgen', en: 'Good morning' },
            { de: 'Gute Nacht', en: 'Good night' },
            { de: 'Wie geht\'s?', en: 'How are you?' },
        ]
    },
    chest_tree: {
        title: '15 Nature Words',
        subtitle: 'Natur',
        words: [
            { de: 'der Baum', en: 'the tree' },
            { de: 'die Blume', en: 'the flower' },
            { de: 'der Wald', en: 'the forest' },
            { de: 'der Fluss', en: 'the river' },
            { de: 'der Berg', en: 'the mountain' },
            { de: 'die Sonne', en: 'the sun' },
            { de: 'der Mond', en: 'the moon' },
            { de: 'der Stern', en: 'the star' },
            { de: 'das Wasser', en: 'the water' },
            { de: 'das Feuer', en: 'the fire' },
            { de: 'der Stein', en: 'the stone' },
            { de: 'der Vogel', en: 'the bird' },
            { de: 'der Fisch', en: 'the fish' },
            { de: 'das Tier', en: 'the animal' },
            { de: 'die Natur', en: 'nature' },
        ]
    },
    akkusativ: {
        title: 'The Accusative Case',
        subtitle: 'Der Akkusativ',
        intro: 'In German, the direct object of a sentence is in the Accusative case. This mainly affects masculine nouns.',
        sections: [
            {
                title: 'Definite Articles',
                content: [
                    { de: 'Der Mann -> Den Mann', en: 'The man (Subject -> Object)' },
                    { de: 'Die Frau -> Die Frau', en: 'The woman (No change)' },
                    { de: 'Das Kind -> Das Kind', en: 'The child (No change)' },
                ]
            },
            {
                title: 'Indefinite Articles',
                content: [
                    { de: 'Ein Mann -> Einen Mann', en: 'A man (Subject -> Object)' },
                    { de: 'Eine Frau -> Eine Frau', en: 'A woman (No change)' },
                    { de: 'Ein Kind -> Ein Kind', en: 'A child (No change)' },
                ]
            }
        ],
        tips: [
            'Only "Der" changes to "Den".',
            'Only "Ein" (masculine) changes to "Einen".',
            'Feminine and Neuter stay the same!'
        ],
        quizQuestions: [
            {
                question: 'I see the man. -> Ich sehe ___ Mann.',
                options: ['der', 'den', 'dem'],
                correctAnswer: 'den'
            },
            {
                question: 'He has a dog. -> Er hat ___ Hund (m).',
                options: ['ein', 'einen', 'eine'],
                correctAnswer: 'einen'
            },
            {
                question: 'Does "Die" change in Akkusativ?',
                options: ['Yes', 'No', 'Sometimes'],
                correctAnswer: 'No'
            }
        ]
    },
    negation: {
        title: 'Negation',
        subtitle: 'Nicht & Kein',
        intro: 'There are two main ways to say "not" or "no" in German: "nicht" and "kein".',
        sections: [
            {
                title: 'Kein / Keine',
                content: [
                    { de: 'Ich habe keinen Hunger.', en: 'I have no hunger.' },
                    { de: 'Das ist kein Apfel.', en: 'That is not an apple.' },
                    { de: 'Used for nouns without "the".', en: '(Like "no" or "not a")' },
                ]
            },
            {
                title: 'Nicht',
                content: [
                    { de: 'Ich bin nicht müde.', en: 'I am not tired.' },
                    { de: 'Das ist nicht gut.', en: 'That is not good.' },
                    { de: 'Used for adjectives and verbs.', en: '(Like "not")' },
                ]
            }
        ],
        tips: [
            'Use "kein" for nouns (like "I have no time").',
            'Use "nicht" for everything else (adjectives, verbs, specific nouns with "the").'
        ],
        quizQuestions: [
            {
                question: 'I am ___ sad.',
                options: ['kein', 'nicht', 'nein'],
                correctAnswer: 'nicht'
            },
            {
                question: 'I have ___ time (Zeit - f).',
                options: ['keine', 'nicht', 'kein'],
                correctAnswer: 'keine'
            },
            {
                question: 'That is not my car.',
                options: ['Das ist nicht mein Auto.', 'Das ist kein mein Auto.', 'Das ist nein mein Auto.'],
                correctAnswer: 'Das ist nicht mein Auto.'
            }
        ]
    },
    possessive_pronouns: {
        title: 'Possessive Pronouns',
        subtitle: 'Mein, Dein, Sein...',
        intro: 'These words show ownership, like "my", "your", "his".',
        sections: [
            {
                title: 'My & Your',
                content: [
                    { de: 'mein / meine', en: 'my (masc/neut / fem/pl)' },
                    { de: 'dein / deine', en: 'your (informal)' },
                ]
            },
            {
                title: 'His, Her, Its',
                content: [
                    { de: 'sein / seine', en: 'his / its' },
                    { de: 'ihr / ihre', en: 'her' },
                ]
            }
        ],
        tips: [
            'Add "-e" if the owned word is Feminine or Plural (meine Katze).',
            'No ending for Masculine/Neuter in Nominative (mein Hund, mein Buch).'
        ],
        quizQuestions: [
            {
                question: '___ (My) Name ist Max.',
                options: ['Mein', 'Meine', 'Meinen'],
                correctAnswer: 'Mein'
            },
            {
                question: 'Das ist ___ (her) Katze.',
                options: ['ihr', 'ihre', 'sein'],
                correctAnswer: 'ihre'
            },
            {
                question: 'Ist das ___ (your) Auto?',
                options: ['dein', 'deine', 'deinen'],
                correctAnswer: 'dein'
            }
        ]
    },
    modal_verbs: {
        title: 'Modal Verbs',
        subtitle: 'Können, Müssen, Wollen',
        intro: 'Modal verbs change the mood of a sentence. They are usually combined with another verb at the end.',
        sections: [
            {
                title: 'Können (Can)',
                content: [
                    { de: 'ich kann', en: 'I can' },
                    { de: 'du kannst', en: 'you can' },
                    { de: 'er kann', en: 'he can' },
                ]
            },
            {
                title: 'Müssen (Must)',
                content: [
                    { de: 'ich muss', en: 'I must' },
                    { de: 'du musst', en: 'you must' },
                    { de: 'er muss', en: 'he must' },
                ]
            },
            {
                title: 'Wollen (Want)',
                content: [
                    { de: 'ich will', en: 'I want' },
                    { de: 'du willst', en: 'you want' },
                    { de: 'er will', en: 'he wants' },
                ]
            }
        ],
        tips: [
            'The second verb goes to the very end of the sentence!',
            'Example: Ich [kann] gut Fußball [spielen].',
            'Notice the vowel change in singular (können -> kann).'
        ],
        quizQuestions: [
            {
                question: 'Ich ___ schwimmen. (can)',
                options: ['kann', 'können', 'kannst'],
                correctAnswer: 'kann'
            },
            {
                question: 'Du ___ lernen. (must)',
                options: ['muss', 'musst', 'müssen'],
                correctAnswer: 'musst'
            },
            {
                question: 'Where does the main verb go?',
                options: ['Position 2', 'The End', 'Start'],
                correctAnswer: 'The End'
            }
        ]
    },
    w_questions: {
        title: 'W-Questions',
        subtitle: 'Wer, Was, Wo...',
        intro: 'Question words in German usually start with "W".',
        sections: [
            {
                title: 'The Basics',
                content: [
                    { de: 'Wer?', en: 'Who?' },
                    { de: 'Was?', en: 'What?' },
                    { de: 'Wo?', en: 'Where?' },
                    { de: 'Wann?', en: 'When?' },
                    { de: 'Wie?', en: 'How?' },
                    { de: 'Warum?', en: 'Why?' },
                ]
            },
            {
                title: 'Examples',
                content: [
                    { de: 'Wer bist du?', en: 'Who are you?' },
                    { de: 'Was machst du?', en: 'What are you doing?' },
                    { de: 'Wo wohnst du?', en: 'Where do you live?' },
                ]
            }
        ],
        tips: [
            'The verb comes immediately after the W-word.',
            'Woher = Where from, Wohin = Where to.'
        ],
        quizQuestions: [
            {
                question: '___ heißt du?',
                options: ['Wie', 'Was', 'Wo'],
                correctAnswer: 'Wie'
            },
            {
                question: '___ wohnst du?',
                options: ['Wer', 'Wo', 'Was'],
                correctAnswer: 'Wo'
            },
            {
                question: '___ ist das?',
                options: ['Was', 'Wo', 'Wie'],
                correctAnswer: 'Was'
            }
        ]
    },
    time_dates: {
        title: 'Time & Dates',
        subtitle: 'Zeit & Datum',
        intro: 'Learn how to tell time and talk about dates in German.',
        sections: [
            {
                title: 'Asking for Time',
                content: [
                    { de: 'Wie spät ist es?', en: 'What time is it?' },
                    { de: 'Es ist zwei Uhr.', en: 'It is two o\'clock.' },
                    { de: 'Es ist halb drei.', en: 'It is half past two (2:30).' },
                ]
            },
            {
                title: 'Days of the Week',
                content: [
                    { de: 'Montag', en: 'Monday' },
                    { de: 'Dienstag', en: 'Tuesday' },
                    { de: 'Mittwoch', en: 'Wednesday' },
                    { de: 'Donnerstag', en: 'Thursday' },
                    { de: 'Freitag', en: 'Friday' },
                    { de: 'Samstag', en: 'Saturday' },
                    { de: 'Sonntag', en: 'Sunday' },
                ]
            }
        ],
        tips: [
            'German uses "halb" + the NEXT hour (halb drei = 2:30).',
            'Days of the week are masculine (der Montag).'
        ],
        quizQuestions: [
            {
                question: 'Translate: "It is 2:30."',
                options: ['Es ist halb zwei.', 'Es ist halb drei.', 'Es ist zwei Uhr.'],
                correctAnswer: 'Es ist halb drei.'
            },
            {
                question: 'Which day comes after Montag?',
                options: ['Dienstag', 'Mittwoch', 'Sonntag'],
                correctAnswer: 'Dienstag'
            },
            {
                question: 'What gender are days of the week?',
                options: ['Der (Masculine)', 'Die (Feminine)', 'Das (Neuter)'],
                correctAnswer: 'Der (Masculine)'
            }
        ]
    },
    separable_verbs: {
        title: 'Separable Verbs',
        subtitle: 'Trennbare Verben',
        intro: 'Some German verbs have a prefix that separates and moves to the end of the sentence.',
        sections: [
            {
                title: 'Common Prefixes',
                content: [
                    { de: 'an-', en: 'on/at (anrufen - to call)' },
                    { de: 'auf-', en: 'up (aufstehen - to get up)' },
                    { de: 'ein-', en: 'in (einkaufen - to shop)' },
                ]
            },
            {
                title: 'Sentence Structure',
                content: [
                    { de: 'Ich [rufe] dich [an].', en: 'I call you.' },
                    { de: 'Er [steht] früh [auf].', en: 'He gets up early.' },
                    { de: 'Wir [kaufen] im Supermarkt [ein].', en: 'We shop in the supermarket.' },
                ]
            }
        ],
        tips: [
            'The prefix goes to the VERY end of the sentence.',
            'In questions: Stehst du auf? (Do you get up?)'
        ],
        quizQuestions: [
            {
                question: 'Ich ___ meine Mutter an. (call)',
                options: ['rufe', 'rufen', 'anrufe'],
                correctAnswer: 'rufe'
            },
            {
                question: 'Where does the prefix go?',
                options: ['Position 2', 'The End', 'Start'],
                correctAnswer: 'The End'
            },
            {
                question: 'Translate: "He gets up."',
                options: ['Er steht auf.', 'Er aufsteht.', 'Er steht an.'],
                correctAnswer: 'Er steht auf.'
            }
        ]
    },
    prepositions: {
        title: 'Prepositions',
        subtitle: 'Präpositionen',
        intro: 'Prepositions link words together. In German, they often determine the case (Accusative or Dative).',
        sections: [
            {
                title: 'Accusative Prepositions',
                content: [
                    { de: 'für', en: 'for' },
                    { de: 'ohne', en: 'without' },
                    { de: 'gegen', en: 'against' },
                ]
            },
            {
                title: 'Dative Prepositions',
                content: [
                    { de: 'mit', en: 'with' },
                    { de: 'aus', en: 'from/out of' },
                    { de: 'zu', en: 'to' },
                ]
            },
            {
                title: 'Examples',
                content: [
                    { de: 'Das ist [für] dich.', en: 'This is for you.' },
                    { de: 'Ich komme [mit] dir.', en: 'I come with you.' },
                ]
            }
        ],
        tips: [
            '"für" always takes Accusative (für mich, für dich).',
            '"mit" always takes Dative (mit mir, mit dir).'
        ],
        quizQuestions: [
            {
                question: 'Das Geschenk ist ___ dich.',
                options: ['für', 'mit', 'aus'],
                correctAnswer: 'für'
            },
            {
                question: 'Ich gehe ___ meiner Freundin.',
                options: ['ohne', 'mit', 'gegen'],
                correctAnswer: 'mit'
            },
            {
                question: 'Which case does "für" take?',
                options: ['Accusative', 'Dative', 'Nominative'],
                correctAnswer: 'Accusative'
            }
        ]
    },
    adjectives: {
        title: 'Adjectives',
        subtitle: 'Adjektive',
        intro: 'Adjectives describe nouns. They can come before the noun (with endings) or after (no endings).',
        sections: [
            {
                title: 'Predicative (After Noun)',
                content: [
                    { de: 'Der Mann ist [alt].', en: 'The man is old.' },
                    { de: 'Das Auto ist [schnell].', en: 'The car is fast.' },
                    { de: 'Die Frau ist [schön].', en: 'The woman is beautiful.' },
                ]
            },
            {
                title: 'Attributive (Before Noun)',
                content: [
                    { de: 'Der [alte] Mann', en: 'The old man' },
                    { de: 'Das [schnelle] Auto', en: 'The fast car' },
                    { de: 'Die [schöne] Frau', en: 'The beautiful woman' },
                ]
            }
        ],
        tips: [
            'If the adjective is after "is/are", it doesn\'t change!',
            'If it is before the noun, it needs an ending (usually -e for definite articles).'
        ],
        quizQuestions: [
            {
                question: 'Das Haus ist ___. (big)',
                options: ['groß', 'große', 'großes'],
                correctAnswer: 'groß'
            },
            {
                question: 'Der ___ Hund. (small)',
                options: ['klein', 'kleine', 'kleines'],
                correctAnswer: 'kleine'
            },
            {
                question: 'Die Katze ist ___. (black)',
                options: ['schwarz', 'schwarze', 'schwarzes'],
                correctAnswer: 'schwarz'
            }
        ]
    },
    imperative: {
        title: 'Imperative',
        subtitle: 'Befehlsform',
        intro: 'Use the Imperative to give commands or orders.',
        sections: [
            {
                title: 'Du-Form (Informal)',
                content: [
                    { de: 'Mach das!', en: 'Do that!' },
                    { de: 'Geh nach Hause!', en: 'Go home!' },
                    { de: 'Komm her!', en: 'Come here!' },
                ]
            },
            {
                title: 'Sie-Form (Formal)',
                content: [
                    { de: 'Machen Sie das!', en: 'Do that!' },
                    { de: 'Gehen Sie nach Hause!', en: 'Go home!' },
                    { de: 'Kommen Sie her!', en: 'Come here!' },
                ]
            }
        ],
        tips: [
            'For "Du", remove the "-st" ending and the pronoun "du".',
            'For "Sie", keep the verb in infinitive + "Sie".',
            'Add "bitte" to be polite!'
        ],
        quizQuestions: [
            {
                question: '___ (Go) nach Hause! (Du-form)',
                options: ['Geh', 'Gehst', 'Gehen'],
                correctAnswer: 'Geh'
            },
            {
                question: '___ (Come) Sie bitte her!',
                options: ['Komm', 'Kommen', 'Kommst'],
                correctAnswer: 'Kommen'
            },
            {
                question: '___ (Learn) Deutsch! (Du-form)',
                options: ['Lern', 'Lernst', 'Lernen'],
                correctAnswer: 'Lern'
            }
        ]
    },
    word_order: {
        title: 'Word Order Basics',
        subtitle: 'Wortstellung',
        intro: 'Reviewing the golden rules of German sentence structure.',
        sections: [
            {
                title: 'Rule 1: Verb Position 2',
                content: [
                    { de: 'Ich [esse] heute Pizza.', en: 'I eat pizza today.' },
                    { de: 'Heute [esse] ich Pizza.', en: 'Today I eat pizza.' },
                ]
            },
            {
                title: 'Rule 2: Time before Place',
                content: [
                    { de: 'Ich gehe [heute] [ins Kino].', en: 'I go [today] [to the cinema].' },
                    { de: 'Wir fahren [am Wochenende] [nach Berlin].', en: 'We drive [on the weekend] [to Berlin].' },
                ]
            }
        ],
        tips: [
            'The verb stays in position 2, even if you start with "Today".',
            'Remember "TeKaMoLo" (Time, Cause, Manner, Place) - but mainly Time before Place.'
        ],
        quizQuestions: [
            {
                question: 'Heute ___ ich ins Kino.',
                options: ['gehe', 'gehen', 'gehst'],
                correctAnswer: 'gehe'
            },
            {
                question: 'Which order is correct?',
                options: ['Time before Place', 'Place before Time', 'Random'],
                correctAnswer: 'Time before Place'
            },
            {
                question: 'Translate: "I play soccer today."',
                options: ['Ich spiele heute Fußball.', 'Ich heute spiele Fußball.', 'Heute spiele ich Fußball.'],
                correctAnswer: 'Ich spiele heute Fußball.'
            }
        ]
    },
    mixed_practice: {
        title: 'Mixed Practice',
        subtitle: 'Gemischte Übungen',
        intro: 'Let\'s review everything you have learned so far! Articles, Verbs, Sentence Structure, and Cases.',
        sections: [
            {
                title: 'Quick Review',
                content: [
                    { de: 'Der/Die/Das', en: 'Articles' },
                    { de: 'Ich bin / Du bist', en: 'Verbs' },
                    { de: 'Verb Position 2', en: 'Sentence Structure' },
                    { de: 'Den / Einen', en: 'Accusative' },
                ]
            }
        ],
        tips: [
            'Take your time.',
            'Think about the gender of nouns.',
            'Remember verb endings (-e, -st, -t, -en).',
            'Watch out for Accusative changes (Der -> Den).'
        ],
        quizQuestions: [
            {
                question: '___ (The) Mann ist groß.',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Der'
            },
            {
                question: 'Ich ___ (have) einen Hund.',
                options: ['habe', 'hast', 'hat'],
                correctAnswer: 'habe'
            },
            {
                question: 'Wir ___ (go) nach Hause.',
                options: ['gehen', 'gehst', 'geht'],
                correctAnswer: 'gehen'
            },
            {
                question: 'Translate: "He is tired."',
                options: ['Er ist müde.', 'Er müde ist.', 'Ist er müde.'],
                correctAnswer: 'Er ist müde.'
            },
            {
                question: 'Ich sehe ___ (the) Ball (m).',
                options: ['den', 'der', 'dem'],
                correctAnswer: 'den'
            },
            {
                question: 'Das ist ___ (my) Katze (f).',
                options: ['meine', 'mein', 'meinen'],
                correctAnswer: 'meine'
            },
            {
                question: '___ (Can) du schwimmen?',
                options: ['Kannst', 'Kann', 'Können'],
                correctAnswer: 'Kannst'
            },
            {
                question: 'Er ___ (must) lernen.',
                options: ['muss', 'musst', 'müssen'],
                correctAnswer: 'muss'
            }
        ]
    },
    listening_practice: {
        title: 'Listening Practice',
        subtitle: 'Hörverstehen',
        intro: 'Read the dialogue carefully. Imagine hearing it in a busy café.',
        sections: [
            {
                title: 'Conversation: Im Café',
                content: [
                    { de: 'Kellner: Guten Tag! Was darf es sein?', en: 'Waiter: Good day! What can I get you?' },
                    { de: 'Lisa: Hallo! Ich nehme einen Cappuccino, bitte.', en: 'Lisa: Hello! I\'ll take a cappuccino, please.' },
                    { de: 'Kellner: Gerne. Möchten Sie auch etwas essen?', en: 'Waiter: Gladly. Would you like to eat something too?' },
                    { de: 'Lisa: Ja, ein Stück Apfelkuchen.', en: 'Lisa: Yes, a piece of apple cake.' },
                    { de: 'Kellner: Mit Sahne?', en: 'Waiter: With cream?' },
                    { de: 'Lisa: Nein, ohne Sahne, danke. Wie viel kostet das?', en: 'Lisa: No, without cream, thanks. How much is that?' },
                    { de: 'Kellner: Das macht 6 Euro.', en: 'Waiter: That makes 6 Euro.' },
                ]
            }
        ],
        tips: [
            'Pay attention to details: What does she drink? What does she eat?',
            '"Nehmen" (to take) is often used for ordering.',
            '"Möchten" (would like) is polite.'
        ],
        quizQuestions: [
            {
                question: 'What does Lisa order to drink?',
                options: ['Cappuccino', 'Tea', 'Water'],
                correctAnswer: 'Cappuccino'
            },
            {
                question: 'Does she want cream on her cake?',
                options: ['No', 'Yes', 'Maybe'],
                correctAnswer: 'No'
            },
            {
                question: 'How much does she have to pay?',
                options: ['6 Euro', '5 Euro', '7 Euro'],
                correctAnswer: '6 Euro'
            },
            {
                question: 'What does she eat?',
                options: ['Apple cake', 'Chocolate cake', 'Sandwich'],
                correctAnswer: 'Apple cake'
            },
            {
                question: 'Who is she talking to?',
                options: ['A waiter', 'Her friend', 'Her brother'],
                correctAnswer: 'A waiter'
            }
        ]
    },
    reading_practice: {
        title: 'Reading Practice',
        subtitle: 'Leseverstehen',
        intro: 'Read the short story about Lukas and his weekend.',
        sections: [
            {
                title: 'Mein Wochenende (My Weekend)',
                content: [
                    { de: 'Hallo, ich bin Lukas.', en: 'Hello, I am Lukas.' },
                    { de: 'Am Samstag schlafe ich lange.', en: 'On Saturday I sleep late.' },
                    { de: 'Um 10 Uhr frühstücke ich mit meiner Familie.', en: 'At 10 o\'clock I eat breakfast with my family.' },
                    { de: 'Dann gehe ich in den Park und spiele Fußball.', en: 'Then I go to the park and play soccer.' },
                    { de: 'Am Sonntag besuche ich meine Oma.', en: 'On Sunday I visit my grandma.' },
                    { de: 'Wir essen Kuchen und trinken Tee.', en: 'We eat cake and drink tea.' },
                    { de: 'Das Wochenende ist immer schön.', en: 'The weekend is always nice.' },
                ]
            }
        ],
        tips: [
            'Look for time words (Am Samstag, Um 10 Uhr).',
            'Identify the activities (schlafe, frühstücke, spiele, besuche).'
        ],
        quizQuestions: [
            {
                question: 'When does Lukas sleep late?',
                options: ['On Saturday', 'On Sunday', 'Every day'],
                correctAnswer: 'On Saturday'
            },
            {
                question: 'Who does he eat breakfast with?',
                options: ['His family', 'His friends', 'Alone'],
                correctAnswer: 'His family'
            },
            {
                question: 'What does he do in the park?',
                options: ['Play soccer', 'Read a book', 'Sleep'],
                correctAnswer: 'Play soccer'
            },
            {
                question: 'Who does he visit on Sunday?',
                options: ['His grandma', 'His uncle', 'His teacher'],
                correctAnswer: 'His grandma'
            },
            {
                question: 'What do they drink on Sunday?',
                options: ['Tea', 'Coffee', 'Juice'],
                correctAnswer: 'Tea'
            }
        ]
    },
    final_exam: {
        title: 'Final A1 Exam',
        subtitle: 'Abschlussprüfung',
        intro: 'This is the final challenge for Level A1. It covers everything you have learned. Good luck!',
        sections: [
            {
                title: 'Instructions',
                content: [
                    { de: 'Beantworte alle Fragen.', en: 'Answer all questions.' },
                    { de: 'Nimm dir Zeit.', en: 'Take your time.' },
                    { de: 'Du schaffst das!', en: 'You can do it!' },
                ]
            }
        ],
        tips: [
            'Review all topics before starting.',
            'Trust your instincts.',
            'Pay attention to grammar rules (endings, word order, cases).'
        ],
        quizQuestions: [
            {
                question: 'What is the article for "Apfel"?',
                options: ['Der', 'Die', 'Das'],
                correctAnswer: 'Der'
            },
            {
                question: 'Conjugate "sein" (to be) for "wir".',
                options: ['sind', 'seid', 'ist'],
                correctAnswer: 'sind'
            },
            {
                question: 'Translate: "I do not have a car."',
                options: ['Ich habe kein Auto.', 'Ich habe nicht Auto.', 'Ich habe nein Auto.'],
                correctAnswer: 'Ich habe kein Auto.'
            },
            {
                question: 'What is "The Table" in Accusative?',
                options: ['Den Tisch', 'Der Tisch', 'Dem Tisch'],
                correctAnswer: 'Den Tisch'
            },
            {
                question: '___ (Where) wohnst du?',
                options: ['Wo', 'Wer', 'Was'],
                correctAnswer: 'Wo'
            },
            {
                question: 'Translate: "She goes to school."',
                options: ['Sie geht zur Schule.', 'Sie zur Schule geht.', 'Geht sie zur Schule.'],
                correctAnswer: 'Sie geht zur Schule.'
            },
            {
                question: 'Plural of "das Buch"?',
                options: ['die Bücher', 'die Buche', 'die Buchs'],
                correctAnswer: 'die Bücher'
            },
            {
                question: 'Formal "You" pronoun?',
                options: ['Sie', 'du', 'ihr'],
                correctAnswer: 'Sie'
            },
            {
                question: 'Ich ___ (call) dich an.',
                options: ['rufe', 'rufen', 'anrufe'],
                correctAnswer: 'rufe'
            },
            {
                question: 'Das Geschenk ist ___ (for) dich.',
                options: ['für', 'mit', 'ohne'],
                correctAnswer: 'für'
            },
            {
                question: 'Der ___ (old) Mann.',
                options: ['alte', 'alt', 'altes'],
                correctAnswer: 'alte'
            },
            {
                question: '___ (Go) nach Hause! (Du-form)',
                options: ['Geh', 'Gehst', 'Gehen'],
                correctAnswer: 'Geh'
            },
            {
                question: 'Heute ___ (play) ich Fußball.',
                options: ['spiele', 'spielen', 'spielst'],
                correctAnswer: 'spiele'
            },
            {
                question: 'Translate: "I eat an apple."',
                options: ['Ich esse einen Apfel.', 'Ich esse ein Apfel.', 'Ich esse den Apfel.'],
                correctAnswer: 'Ich esse einen Apfel.'
            },
            {
                question: 'Wie ___ (is) dein Name?',
                options: ['ist', 'bist', 'sind'],
                correctAnswer: 'ist'
            }
        ]
    }
};
