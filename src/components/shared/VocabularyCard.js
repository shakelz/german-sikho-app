import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView
} from 'react-native';
import Tts from 'react-native-tts';
import AssetService from '../../services/AssetService';
import UserStateService from '../../services/UserStateService';

const { width } = Dimensions.get('window');

const VocabularyCard = ({ item, onSRSAction }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // 1. Reset card to front when the word changes
    useEffect(() => {
        setIsFlipped(false);
    }, [item]);

    // 2. Audio Handler
    const playSound = async () => {
        try {
            Tts.setDefaultLanguage('de-DE'); // Set German pronunciation
            Tts.stop();
            Tts.speak(item.german);
        } catch (err) {
            console.warn('TTS Error:', err);
        }
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // 3. Image Logic - Using AssetService for automatic version control
    const imageUrl = AssetService.getImageUrl(item.german);

    // 4. Dynamic Grammar Renderer
    const renderGrammarDetails = () => {
        if (!item.details) return null;

        // New Rule: Hide for adverbs/prepositions if details are empty
        if (['adverb', 'preposition', 'conjunction', 'phrase'].includes(item.type)) {
            return null;
        }

        return (
            <View style={styles.grammarBox}>
                <Text style={styles.sectionTitle}>GRAMMAR</Text>
                <View style={styles.grammarContent}>
                    {/* LOGIC FOR NOUNS */}
                    {item.type === 'noun' && (
                        <>
                            <View style={styles.grammarItem}>
                                <Text style={styles.grammarLabel}>Article</Text>
                                <Text style={styles.grammarValue}>{item.details.article || '-'}</Text>
                            </View>
                            <View style={styles.grammarItem}>
                                <Text style={styles.grammarLabel}>Plural</Text>
                                <Text style={styles.grammarValue}>{item.details.plural || '-'}</Text>
                            </View>
                        </>
                    )}
                    {/* LOGIC FOR VERBS - Enhanced with Partizip II */}
                    {item.type === 'verb' && (
                        <View style={{ width: '100%' }}>
                            {/* Row 1: Present Tense */}
                            <View style={styles.verbRow}>
                                <Text style={styles.verbLabel}>Present:</Text>
                                <Text style={styles.verbConjugation}>
                                    {item.details.conjugation_present || '-'}
                                </Text>
                            </View>

                            {/* Row 2: Simple Past (Präteritum) */}
                            {item.details.conjugation_past && (
                                <View style={styles.verbRow}>
                                    <Text style={styles.verbLabel}>Simple Past:</Text>
                                    <Text style={styles.verbConjugation}>
                                        {item.details.conjugation_past}
                                    </Text>
                                </View>
                            )}

                            {/* Row 3: Perfect (Partizip II) - Highlighted */}
                            {item.details.partizip_2 && (
                                <View style={[styles.verbRow, styles.perfectRow]}>
                                    <Text style={[styles.verbLabel, { color: '#059669' }]}>Perfect:</Text>
                                    <Text style={styles.perfectText}>
                                        {item.details.helper_verb || 'hat'} ... <Text style={{ fontWeight: '900' }}>{item.details.partizip_2}</Text>
                                    </Text>
                                </View>
                            )}

                            {/* Helper Verb Badge */}
                            <View style={styles.helperBadge}>
                                <Text style={styles.helperBadgeText}>
                                    {item.details.helper_verb === 'sein' ? '🏃 + sein' : '✋ + haben'}
                                </Text>
                            </View>
                        </View>
                    )}
                    {/* LOGIC FOR ADJECTIVES */}
                    {item.type === 'adjective' && (
                        <>
                            <View style={styles.grammarItem}>
                                <Text style={styles.grammarLabel}>Comparative</Text>
                                <Text style={styles.grammarValue}>{item.details.comparative || '-'}</Text>
                            </View>
                            <View style={styles.grammarItem}>
                                <Text style={styles.grammarLabel}>Superlative</Text>
                                <Text style={styles.grammarValue}>{item.details.superlative || '-'}</Text>
                            </View>
                        </>
                    )}
                    {/* Fallback for other types if they slip through */}
                    {!['noun', 'verb', 'adjective'].includes(item.type) && (
                        <Text style={styles.grammarSentence}>No specific grammar rules.</Text>
                    )}
                </View>
            </View>
        );
    };

    // --- FRONT SIDE UI ---
    if (!isFlipped) {
        return (
            <TouchableOpacity style={styles.cardContainer} activeOpacity={0.95} onPress={handleFlip}>
                <Image
                    source={{ uri: imageUrl }}
                    style={styles.frontImage}
                    resizeMode="contain"
                />
                {/* Speaker Overlay */}
                <TouchableOpacity style={styles.speakerButton} onPress={playSound}>
                    <Text style={{ fontSize: 24 }}>🔊</Text>
                </TouchableOpacity>

                {/* Hint */}
                <View style={styles.tapHintContainer}>
                    <Text style={styles.tapHintText}>Tap to Flip 👆</Text>
                </View>
            </TouchableOpacity>
        );
    }

    // --- BACK SIDE UI ---
    return (
        <View style={styles.cardContainer}>
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                <TouchableOpacity activeOpacity={1} onPress={handleFlip}>

                    {/* HEADER: English & Hindi + Badges */}
                    <View style={styles.header}>
                        <View style={styles.badgesRow}>
                            {item.level && <View style={styles.badge}><Text style={styles.badgeText}>{item.level}</Text></View>}
                            {item.category && <View style={[styles.badge, styles.badgeBlue]}><Text style={styles.badgeText}>{item.category}</Text></View>}
                        </View>

                        <Text style={styles.mainWord}>{item.english}</Text>
                        <Text style={styles.hindiWord}>{item.roman_hindi}</Text>
                        <Text style={styles.syllables}>{item.syllables}</Text>

                        {/* Tags */}
                        {item.tags && item.tags.length > 0 && (
                            <View style={styles.tagsContainer}>
                                {item.tags.map((tag, idx) => (
                                    <View key={idx} style={styles.tagPill}>
                                        <Text style={styles.tagText}>{tag}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* SECTION 1: Grammar Details */}
                    {renderGrammarDetails()}

                    {/* SECTION 1.5: Cognates */}
                    {item.cognates?.has_match && (
                        <View style={styles.cognateBox}>
                            <Text style={styles.cognateText}>
                                🔔 Sounds like: <Text style={{ fontWeight: 'bold' }}>{item.cognates.english_match}</Text> ({item.cognates.similarity_score})
                            </Text>
                        </View>
                    )}

                    {/* SECTION 2: Mnemonic */}
                    {item.mnemonic && (
                        <View style={styles.mnemonicBox}>
                            <Text style={styles.mnemonicTitle}>💡 MEMORY HOOK</Text>
                            <Text style={styles.mnemonicText}>{item.mnemonic}</Text>
                        </View>
                    )}

                    {/* SECTION 3: Examples */}
                    {item.examples && item.examples.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>EXAMPLES</Text>
                            {item.examples.map((ex, index) => (
                                <View key={index} style={styles.exampleItem}>
                                    <Text style={styles.exampleLabel}>{ex.meaning_label}</Text>
                                    <Text style={styles.germanSentence}>{ex.german}</Text>
                                    <Text style={styles.englishSentence}>{ex.english}</Text>
                                    <Text style={styles.englishSentence}>{ex.hindi_sentence}</Text>
                                    <Text style={styles.exampleLabel}>Grammar Explanation</Text>
                                    <Text style={styles.englishSentence}>English: {ex.english_explanation}</Text>
                                    <Text style={styles.englishSentence}>Hindi: {ex.hindi_explanation}</Text>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* SECTION 4: Related Words (Moved above SRS) */}
                    <View style={styles.footerSection}>
                        {(item.related?.synonyms?.length > 0 || item.related?.antonyms?.length > 0) && (
                            <Text style={styles.relatedText}>
                                {item.related?.synonyms?.length > 0 && (
                                    <>
                                        <Text style={{ fontWeight: 'bold' }}>Synonyms:</Text> {item.related.synonyms.join(', ')}
                                    </>
                                )}
                                {item.related?.synonyms?.length > 0 && item.related?.antonyms?.length > 0 && ' | '}
                                {item.related?.antonyms?.length > 0 && (
                                    <>
                                        <Text style={{ fontWeight: 'bold' }}>Antonyms:</Text> {item.related.antonyms.join(', ')}
                                    </>
                                )}
                            </Text>
                        )}
                    </View>

                    <View style={{ height: 20 }} />
                </TouchableOpacity>
            </ScrollView>

            {/* SRS ACTIONS */}
            <View style={styles.srsBar}>
                <TouchableOpacity style={[styles.srsButton, { backgroundColor: '#FECACA' }]} onPress={() => onSRSAction(item.german, 'again')}>
                    <Text style={styles.srsText}>Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.srsButton, { backgroundColor: '#FDE68A' }]} onPress={() => onSRSAction(item.german, 'hard')}>
                    <Text style={styles.srsText}>Hard</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.srsButton, { backgroundColor: '#BBF7D0' }]}
                    onPress={async () => {
                        // Mark word as learned in UserStateService (auto-syncs to cloud)
                        await UserStateService.markWordAsLearned(item.german);
                        // Then call the original SRS action
                        onSRSAction(item.german, 'good');
                    }}
                >
                    <Text style={styles.srsText}>Learned</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: width * 0.9,
        height: 550,
        backgroundColor: '#fff',
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 3 },
        alignSelf: 'center',
        marginTop: 20,
        overflow: 'hidden',
    },
    frontImage: {
        width: '100%',
        height: '100%',
    },
    speakerButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        backgroundColor: 'rgba(255,255,255,0.85)',
        padding: 8,
        borderRadius: 50,
        zIndex: 10,
    },
    tapHintContainer: {
        position: 'absolute',
        bottom: 10,
        alignSelf: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    tapHintText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 12
    },

    // Back Side Styles
    header: {
        alignItems: 'center',
        marginBottom: 15
    },
    badgesRow: {
        flexDirection: 'row',
        marginBottom: 8,
        gap: 8,
    },
    badge: {
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    badgeBlue: {
        backgroundColor: '#DBEAFE',
    },
    badgeText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#374151',
        textTransform: 'uppercase',
    },
    mainWord: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1F2937',
        textAlign: 'center'
    },
    hindiWord: {
        fontSize: 18,
        color: '#6B7280',
        fontStyle: 'italic',
        marginBottom: 4
    },
    syllables: {
        fontSize: 14,
        color: '#9CA3AF',
        fontFamily: 'monospace'
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 6,
        marginTop: 8,
    },
    tagPill: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    tagText: {
        fontSize: 10,
        color: '#6B7280',
    },
    sectionTitle: {
        fontSize: 11,
        fontWeight: '900',
        color: '#9CA3AF',
        marginBottom: 8,
        textTransform: 'uppercase'
    },
    grammarBox: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 12,
        marginBottom: 15,
    },
    grammarContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap'
    },
    grammarItem: {
        alignItems: 'center',
        minWidth: '45%',
        marginBottom: 5
    },
    grammarLabel: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 2
    },
    grammarValue: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#111827'
    },
    grammarSentence: {
        fontSize: 14,
        color: '#374151',
        fontStyle: 'italic'
    },
    // Verb Forms Styles
    verbRow: {
        marginBottom: 8,
    },
    verbLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: '#6B7280',
        textTransform: 'uppercase',
        marginBottom: 2,
    },
    verbConjugation: {
        fontSize: 13,
        color: '#374151',
        fontStyle: 'italic',
        lineHeight: 18,
    },
    perfectRow: {
        backgroundColor: '#ECFDF5',
        padding: 10,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#10B981',
        marginTop: 4,
    },
    perfectText: {
        fontSize: 15,
        color: '#065F46',
        fontWeight: '600',
    },
    helperBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    helperBadgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4B5563',
    },
    cognateBox: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 15,
        alignItems: 'center',
    },
    cognateText: {
        fontSize: 13,
        color: '#1E40AF',
    },
    mnemonicBox: {
        backgroundColor: '#FEF3C7',
        borderColor: '#F59E0B',
        borderLeftWidth: 4,
        borderRadius: 8,
        padding: 12,
        marginBottom: 15,
    },
    mnemonicTitle: {
        color: '#B45309',
        fontWeight: 'bold',
        fontSize: 12,
        marginBottom: 4
    },
    mnemonicText: {
        color: '#78350F',
        fontSize: 14,
        lineHeight: 20
    },
    section: {
        marginBottom: 15
    },
    exampleItem: {
        marginBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
        paddingBottom: 8
    },
    exampleLabel: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#059669',
        marginBottom: 2
    },
    germanSentence: {
        fontSize: 15,
        color: '#111827',
        marginBottom: 2
    },
    englishSentence: {
        fontSize: 14,
        color: '#6B7280',
        fontStyle: 'italic'
    },
    footerSection: {
        marginTop: 5,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    relatedText: {
        fontSize: 13,
        color: '#4B5563',
        marginBottom: 4,
        textAlign: 'center',
    },
    srsBar: {
        flexDirection: 'row',
        height: 60
    },
    srsButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    srsText: {
        fontWeight: 'bold',
        color: '#333'
    },
});

export default VocabularyCard;