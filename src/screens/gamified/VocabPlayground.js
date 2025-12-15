import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    FlatList,
    StatusBar,
    Dimensions,
    Platform,
    Animated,
    ScrollView,
    PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

// --- YOUR IMPORTS ---
import VocabularyService from '../../services/vocabService';
import UserStateService from '../../services/UserStateService';
import VocabularyCard from '../../components/shared/VocabularyCard';
// --------------------

const { width } = Dimensions.get('window');

// 🌈 PALETTE
const COLORS = {
    glassSurface: 'rgba(255, 255, 255, 0.75)',
    glassBorder: 'rgba(255, 255, 255, 0.8)',
    textDark: '#1C1C1E',
    textGrey: '#8E8E93',
    noun: '#007AFF', nounBg: '#E0F2FE',
    verb: '#FF2D55', verbBg: '#FFE4E9',
    adj: '#FF9500', adjBg: '#FFF1D6',
    misc: '#AF52DE', miscBg: '#F3E4FA',
    gold: '#FFD700',
    success: '#34C759',
};

// Helpers
const getTypeLabel = (shortType) => {
    if (!shortType) return 'Word';
    return shortType.charAt(0).toUpperCase() + shortType.slice(1);
};

const getTypeStyle = (shortType) => {
    const label = (shortType || '').toLowerCase();
    if (label.includes('noun') || label === 'n') return { color: COLORS.noun, bg: COLORS.nounBg };
    if (label.includes('verb') || label === 'v') return { color: COLORS.verb, bg: COLORS.verbBg };
    if (label.includes('adj')) return { color: COLORS.adj, bg: COLORS.adjBg };
    return { color: COLORS.misc, bg: COLORS.miscBg };
};

const VocabPlayground = () => {
    // --- STATE ---
    const [activeTab, setActiveTab] = useState('dictionary');
    const [searchQuery, setSearchQuery] = useState('');

    // Dictionary Filter State
    const [dictFilter, setDictFilter] = useState('all');
    const [selectedCategory, setSelectedCategory] = useState('all'); // Category filter
    const [selectedLetter, setSelectedLetter] = useState('all'); // A-Z filter
    const [showLetterOverlay, setShowLetterOverlay] = useState(false); // Show letter popup while sliding

    const [dueWords, setDueWords] = useState([]);
    const [allWords, setAllWords] = useState([]);
    const [studyList, setStudyList] = useState([]);

    const [isSRSMode, setIsSRSMode] = useState(true);
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // --- ANIMATIONS ---
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const stackScale = useRef(new Animated.Value(1)).current;
    const tabSlideAnim = useRef(new Animated.Value(0)).current;
    const letterOverlayAnim = useRef(new Animated.Value(0)).current; // For letter popup animation
    const listScaleAnim = useRef(new Animated.Value(1)).current; // For list bounce on letter tap
    const flatListRef = useRef(null); // For scrolling to letter position

    useFocusEffect(
        useCallback(() => {
            loadData();
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
        }, [])
    );

    const loadData = async () => {
        const due = await VocabularyService.getDueWords();
        const all = await VocabularyService.getAllWords();
        setDueWords(due);
        setAllWords(all);
        // Default study list is due words
        if (isSRSMode) {
            setStudyList(due);
        }
    };

    const switchTab = (tab, shouldReset = true) => {
        // 1. Trigger Animation
        Animated.spring(tabSlideAnim, {
            toValue: tab === 'dictionary' ? 0 : 1,
            useNativeDriver: false,
            friction: 8,
            tension: 40
        }).start();

        // 2. Logic to reset SRS mode if switching to study manually
        if (tab === 'study' && activeTab !== 'study' && shouldReset) {
            setIsSRSMode(true);
            setStudyList(dueWords);
            setCurrentCardIndex(0);
        }

        // 3. Update State
        setActiveTab(tab);
    };

    const handleNext = () => {
        if (currentCardIndex < studyList.length - 1) {
            triggerStackAnimation();
            setCurrentCardIndex(prev => prev + 1);
        } else {
            if (isSRSMode) {
                // Refresh data if in SRS mode
                loadData();
                alert("Session complete! Refreshing...");
            } else {
                alert("End of list");
            }
        }
    };

    const handlePrev = () => {
        if (currentCardIndex > 0) {
            triggerStackAnimation();
            setCurrentCardIndex(prev => prev - 1);
        }
    };

    const triggerStackAnimation = () => {
        Animated.sequence([
            Animated.timing(stackScale, { toValue: 0.95, duration: 100, useNativeDriver: true }),
            Animated.spring(stackScale, { toValue: 1, friction: 5, useNativeDriver: true })
        ]).start();
    };

    const onSRSAction = async (german, quality) => {
        await VocabularyService.updateWordProgress(german, quality);
        const all = await VocabularyService.getAllWords();
        setAllWords(all);
        handleNext();
    };

    // UPDATED: Extract categories AND word types
    const getUniqueCategories = () => {
        const topicCategories = new Set();
        allWords.forEach(word => {
            if (word.category) {
                topicCategories.add(word.category);
            }
        });

        // Combine: All, Word Types (Nouns/Verbs/Adj), then Topic Categories
        return [
            'all',
            '🔤 Nouns',
            '⚡ Verbs',
            '🎨 Adjectives',
            '---', // Separator
            ...Array.from(topicCategories).sort()
        ];
    };

    // Smart A-Z: Only shows letters that have words in current filter
    const getAvailableLetters = (filteredData) => {
        const letters = new Set();
        filteredData.forEach(word => {
            // Get first letter of the German word (skip articles)
            const cleanWord = word.clean_word || word.german.replace(/^(der|die|das|ein|eine)\s+/i, '');
            if (cleanWord && cleanWord.length > 0) {
                letters.add(cleanWord.charAt(0).toUpperCase());
            }
        });
        return ['all', ...Array.from(letters).sort()];
    };

    const renderBackground = () => (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
            <View style={{ flex: 1, backgroundColor: '#F2F2F7' }}>
                <View style={[styles.blob, { backgroundColor: '#A7C7E7', top: -100, left: -50 }]} />
                <View style={[styles.blob, { backgroundColor: '#FFB7B2', top: 100, right: -100 }]} />
                <View style={[styles.blob, { backgroundColor: '#E2C2FF', bottom: -50, left: 50 }]} />
            </View>
            <View style={{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255,255,255,0.45)' }} />
        </View>
    );

    const renderHeader = () => {
        const pillLeft = tabSlideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['1%', '49.5%']
        });

        return (
            <Animated.View style={[styles.headerContainer, { opacity: fadeAnim }]}>
                <View>
                    <Text style={styles.headerGreeting}>Welcome Back</Text>
                    <Text style={styles.headerTitle}>Vocabulary.</Text>
                </View>

                {/* 🌟 TABS */}
                <View style={styles.islandTrack}>
                    <Animated.View style={[styles.slidingPill, { left: pillLeft }]} />

                    {/* TAB 1: LIBRARY (Left) */}
                    <TouchableOpacity style={styles.islandButton} onPress={() => switchTab('dictionary')} activeOpacity={1}>
                        <Text style={[styles.islandText, activeTab === 'dictionary' ? styles.textActive : styles.textInactive]}>
                            Library
                        </Text>
                    </TouchableOpacity>

                    {/* TAB 2: FLASHCARD (Right) */}
                    <TouchableOpacity style={styles.islandButton} onPress={() => switchTab('study')} activeOpacity={1}>
                        <Text style={[styles.islandText, activeTab === 'study' ? styles.textActive : styles.textInactive]}>
                            Flashcard ⚡️
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    const renderStudyMode = () => {
        // Fallback if list is empty
        if (!studyList || studyList.length === 0) {
            return (
                <View style={styles.center}>
                    <Text style={{ fontSize: 50 }}>🎉</Text>
                    <Text style={{ color: COLORS.textGrey, marginTop: 10 }}>No cards due right now!</Text>
                    <TouchableOpacity onPress={loadData} style={{ marginTop: 20 }}>
                        <Text style={{ color: COLORS.noun, fontWeight: 'bold' }}>Refresh</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        const currentWord = studyList[currentCardIndex];
        // Safety check if index goes out of bounds
        if (!currentWord) return <View style={styles.center}><Text>Loading...</Text></View>;

        const progress = ((currentCardIndex + 1) / studyList.length) * 100;

        return (
            <View style={styles.contentArea}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressTrack}>
                        <Animated.View style={[styles.progressFill, { width: `${progress}%` }]} />
                    </View>
                    <Text style={styles.progressLabel}>{currentCardIndex + 1} / {studyList.length}</Text>
                </View>

                <View style={styles.cardStage}>
                    <View style={[styles.cardLayer, styles.layer2]} />
                    <View style={[styles.cardLayer, styles.layer1]} />
                    <Animated.View style={[styles.mainCardWrapper, { transform: [{ scale: stackScale }] }]}>
                        <VocabularyCard
                            item={currentWord}
                            onSRSAction={onSRSAction}
                            onNext={handleNext}
                            style={{ height: '100%' }}
                        />
                    </Animated.View>
                </View>

                <View style={styles.navRow}>
                    <TouchableOpacity style={[styles.navBtn, currentCardIndex === 0 && styles.navBtnDisabled]} onPress={handlePrev} disabled={currentCardIndex === 0}>
                        <Text style={styles.navArrow}>←</Text>
                    </TouchableOpacity>

                    {!isSRSMode && (
                        <TouchableOpacity style={styles.exitBtn} onPress={() => {
                            // Return to dictionary
                            setIsSRSMode(true);
                            setStudyList(dueWords);
                            switchTab('dictionary');
                        }}>
                            <Text style={styles.exitText}>Exit Browse</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={handleNext}>
                        <Text style={[styles.navArrow, { color: '#FFF' }]}>→</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderDictionaryMode = () => {
        // Use UserStateService for learned count (matches cloud sync)
        const learnedWordsFromState = UserStateService.getLearnedWords();
        // Filter allWords to only show words that are in learnedWords
        const learnedList = allWords.filter(w => learnedWordsFromState.includes(w.german));

        let displayData = allWords;
        if (dictFilter === 'learned') {
            displayData = learnedList;
        } else if (dictFilter === 'all') {
            displayData = allWords.filter(w => (w.interval || 0) <= 1);
        }

        // UPDATED: Apply category OR type filter
        if (selectedCategory !== 'all' && selectedCategory !== '---') {
            if (selectedCategory === '🔤 Nouns') {
                displayData = displayData.filter(w => w.type && w.type.toLowerCase().includes('noun'));
            } else if (selectedCategory === '⚡ Verbs') {
                displayData = displayData.filter(w => w.type && w.type.toLowerCase().includes('verb'));
            } else if (selectedCategory === '🎨 Adjectives') {
                displayData = displayData.filter(w => w.type && w.type.toLowerCase().includes('adj'));
            } else {
                // Regular topical category
                displayData = displayData.filter(w => w.category === selectedCategory);
            }
        }

        // Get available letters for slider UI
        const availableLetters = getAvailableLetters(displayData);

        // Apply A-Z letter filter (simple filter, not scroll)
        if (selectedLetter !== 'all') {
            displayData = displayData.filter(w => {
                const cleanWord = w.clean_word || w.german.replace(/^(der|die|das|ein|eine)\s+/i, '');
                return cleanWord && cleanWord.charAt(0).toUpperCase() === selectedLetter;
            });
        }

        // Apply search filter
        const data = displayData.filter(w =>
            w.german.toLowerCase().includes(searchQuery.toLowerCase()) ||
            w.english.toLowerCase().includes(searchQuery.toLowerCase())
        );

        // Calculate category-specific counts for mastery widget
        let categoryTotal = allWords;
        let categoryLearned = learnedList;
        let categoryLabel = 'TOTAL MASTERED';

        if (selectedCategory !== 'all' && selectedCategory !== '---') {
            if (selectedCategory === '🔤 Nouns') {
                categoryTotal = allWords.filter(w => w.type && w.type.toLowerCase().includes('noun'));
                categoryLearned = learnedList.filter(w => w.type && w.type.toLowerCase().includes('noun'));
                categoryLabel = 'NOUNS MASTERED';
            } else if (selectedCategory === '⚡ Verbs') {
                categoryTotal = allWords.filter(w => w.type && w.type.toLowerCase().includes('verb'));
                categoryLearned = learnedList.filter(w => w.type && w.type.toLowerCase().includes('verb'));
                categoryLabel = 'VERBS MASTERED';
            } else if (selectedCategory === '🎨 Adjectives') {
                categoryTotal = allWords.filter(w => w.type && w.type.toLowerCase().includes('adj'));
                categoryLearned = learnedList.filter(w => w.type && w.type.toLowerCase().includes('adj'));
                categoryLabel = 'ADJECTIVES MASTERED';
            } else {
                categoryTotal = allWords.filter(w => w.category === selectedCategory);
                categoryLearned = learnedList.filter(w => w.category === selectedCategory);
                categoryLabel = `${selectedCategory.toUpperCase()} MASTERED`;
            }
        }

        return (
            <View style={styles.contentArea}>
                <Animated.View style={{ flex: 1, transform: [{ scale: listScaleAnim }] }}>
                    <FlatList
                        ref={flatListRef}
                        data={data}
                        keyExtractor={(item, index) => item.german + index}
                        contentContainerStyle={{ paddingBottom: 100 }}
                        showsVerticalScrollIndicator={false}
                        onScrollToIndexFailed={(info) => {
                            // Handle scroll failure gracefully
                            setTimeout(() => {
                                if (flatListRef.current && info.index < data.length) {
                                    flatListRef.current.scrollToIndex({ index: info.index, animated: true });
                                }
                            }, 100);
                        }}
                        ListHeaderComponent={
                            <View>
                                {searchQuery === '' && (
                                    <View style={styles.masteryWidget}>
                                        <View style={styles.masteryLeft}>
                                            <Text style={styles.masteryLabel}>{categoryLabel}</Text>
                                            <Text style={styles.masteryCount}>{categoryLearned.length} / {categoryTotal.length}</Text>
                                        </View>
                                        <View style={styles.masteryIconCircle}>
                                            <Text style={{ fontSize: 24 }}>🏆</Text>
                                        </View>
                                    </View>
                                )}

                                <View style={styles.glassSearch}>
                                    <Text style={{ fontSize: 18, marginRight: 10 }}>🔍</Text>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder={dictFilter === 'learned' ? "Search learned words..." : "Search words to learn..."}
                                        placeholderTextColor="rgba(0,0,0,0.4)"
                                        value={searchQuery}
                                        onChangeText={setSearchQuery}
                                    />
                                </View>

                                {/* NEW: Category Filter Pills */}
                                <ScrollView
                                    horizontal
                                    showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={styles.categoryScrollContainer}
                                    style={{ marginBottom: 16 }}
                                >
                                    {getUniqueCategories().map(category => {
                                        // Render separator as non-clickable divider
                                        if (category === '---') {
                                            return (
                                                <View key={category} style={styles.categorySeparator}>
                                                    <Text style={styles.separatorText}>•</Text>
                                                </View>
                                            );
                                        }

                                        return (
                                            <TouchableOpacity
                                                key={category}
                                                style={[
                                                    styles.categoryPill,
                                                    selectedCategory === category && styles.categoryPillActive
                                                ]}
                                                onPress={() => setSelectedCategory(category)}
                                            >
                                                <Text style={[
                                                    styles.categoryPillText,
                                                    selectedCategory === category && styles.categoryPillTextActive
                                                ]}>
                                                    {category === 'all' ? '📚 All' : category}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>

                                <View style={styles.filterRow}>
                                    <TouchableOpacity
                                        style={[styles.filterChip, dictFilter === 'all' && styles.filterChipActive]}
                                        onPress={() => setDictFilter('all')}
                                    >
                                        <Text style={[styles.filterText, dictFilter === 'all' && styles.filterTextActive]}>To Learn</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.filterChip, dictFilter === 'learned' && styles.filterChipActive]}
                                        onPress={() => setDictFilter('learned')}
                                    >
                                        <Text style={[styles.filterText, dictFilter === 'learned' && styles.filterTextActive]}>Learned</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        }
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={{ fontSize: 40, marginBottom: 10 }}>📭</Text>
                                <Text style={{ color: COLORS.textGrey }}>No words found here.</Text>
                            </View>
                        }
                        renderItem={({ item, index }) => {
                            const typeStyle = getTypeStyle(item.type);
                            const isLearned = (item.interval || 0) > 1;

                            return (
                                <TouchableOpacity
                                    style={styles.colorfulRow}
                                    onPress={() => {
                                        // 1. Set the study list to current filter
                                        setStudyList(data);
                                        // 2. Point to this specific card
                                        setCurrentCardIndex(index);
                                        // 3. Disable SRS logic (browse mode)
                                        setIsSRSMode(false);
                                        // 4. Trigger switch
                                        switchTab('study', false);
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            <Text style={styles.germanWord}>{item.german}</Text>
                                            {dictFilter === 'all' && isLearned && (
                                                <Text style={styles.miniCheck}>✓</Text>
                                            )}
                                        </View>
                                        <Text style={styles.englishWord}>{item.english}</Text>
                                    </View>
                                    <View style={[styles.badge, { backgroundColor: typeStyle.bg }]}>
                                        <Text style={[styles.badgeText, { color: typeStyle.color }]}>
                                            {getTypeLabel(item.type).substring(0, 3)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            );
                        }}
                    />
                </Animated.View>

                {/* Vertical A-Z Slider */}
                <View
                    style={styles.alphabetSlider}
                    onStartShouldSetResponder={() => true}
                    onMoveShouldSetResponder={() => true}
                    onResponderGrant={(evt) => {
                        setShowLetterOverlay(true);
                        Animated.spring(letterOverlayAnim, {
                            toValue: 1,
                            friction: 6,
                            tension: 100,
                            useNativeDriver: true,
                        }).start();
                        handleSliderTouch(evt, availableLetters);
                    }}
                    onResponderMove={(evt) => {
                        handleSliderTouch(evt, availableLetters);
                    }}
                    onResponderRelease={() => {
                        Animated.timing(letterOverlayAnim, {
                            toValue: 0,
                            duration: 150,
                            useNativeDriver: true,
                        }).start(() => setShowLetterOverlay(false));
                    }}
                >
                    {availableLetters.filter(l => l !== 'all').map(letter => (
                        <TouchableOpacity
                            key={letter}
                            style={[
                                styles.sliderLetter,
                                selectedLetter === letter && styles.sliderLetterActive
                            ]}
                            onPress={() => setSelectedLetter(letter)}
                        >
                            <Text style={[
                                styles.sliderLetterText,
                                selectedLetter === letter && styles.sliderLetterTextActive
                            ]}>
                                {letter}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Letter Popup Overlay with Animation */}
                {showLetterOverlay && selectedLetter !== 'all' && (
                    <Animated.View style={[
                        styles.letterOverlay,
                        {
                            opacity: letterOverlayAnim,
                            transform: [{
                                scale: letterOverlayAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0.5, 1]
                                })
                            }]
                        }
                    ]}>
                        <Text style={styles.letterOverlayText}>{selectedLetter}</Text>
                    </Animated.View>
                )}
            </View>
        );
    };

    // Handle touch on vertical slider - simple filter approach
    const handleSliderTouch = (evt, letters) => {
        const { locationY } = evt.nativeEvent;
        const filteredLetters = letters.filter(l => l !== 'all');
        const letterHeight = 14; // Match sliderLetter height
        const sliderHeight = filteredLetters.length * letterHeight;
        const letterIndex = Math.max(0, Math.min(
            Math.floor((locationY / sliderHeight) * filteredLetters.length),
            filteredLetters.length - 1
        ));
        const letter = filteredLetters[letterIndex];
        if (letter) {
            setSelectedLetter(letter);
        }
    };

    return (
        <View style={styles.container}>
            {renderBackground()}
            <SafeAreaView style={styles.safeArea}>
                <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
                {renderHeader()}

                {/* FIX: Explicit separation of views. 
                   We ensure only one view is rendered at a time based on activeTab.
                */}
                <View style={{ flex: 1 }}>
                    {activeTab === 'study' ? (
                        <View style={{ flex: 1 }}>
                            {renderStudyMode()}
                        </View>
                    ) : (
                        <View style={{ flex: 1 }}>
                            {renderDictionaryMode()}
                        </View>
                    )}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F2F2F7' },
    safeArea: { flex: 1 },
    blob: { position: 'absolute', width: 400, height: 400, borderRadius: 999, opacity: 0.6, transform: [{ scale: 1.2 }] },
    headerContainer: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
    headerGreeting: { fontSize: 14, fontWeight: '600', color: COLORS.textGrey, textTransform: 'uppercase', letterSpacing: 1 },
    headerTitle: { fontSize: 40, fontWeight: '900', color: COLORS.textDark, letterSpacing: -1.5 },

    // Island Track
    islandTrack: { flexDirection: 'row', backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 24, padding: 4, marginTop: 15, height: 54, position: 'relative', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', zIndex: 10 },

    // Sliding Pill
    slidingPill: { position: 'absolute', top: 4, bottom: 4, width: '49.5%', backgroundColor: '#FFF', borderRadius: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

    islandButton: { flex: 1, justifyContent: 'center', alignItems: 'center', zIndex: 1 },
    islandText: { fontSize: 15, fontWeight: '600' },
    textActive: { color: COLORS.textDark, fontWeight: '800' },
    textInactive: { color: COLORS.textGrey },

    contentArea: { flex: 1, paddingLeft: 20, paddingRight: 16 },
    progressContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 10 },
    progressTrack: { flex: 1, height: 8, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 4, marginRight: 15 },
    progressFill: { height: '100%', backgroundColor: COLORS.noun, borderRadius: 4 },
    progressLabel: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },

    // Card Stage
    cardStage: { flex: 1, marginBottom: 20, position: 'relative', justifyContent: 'center' },
    cardLayer: { position: 'absolute', backgroundColor: '#FFF', borderRadius: 30, alignSelf: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 },
    layer2: { width: width - 80, height: '92%', top: 20, opacity: 0.4, zIndex: 1 },
    layer1: { width: width - 60, height: '96%', top: 10, opacity: 0.6, zIndex: 2 },
    mainCardWrapper: { width: '100%', height: '100%', zIndex: 3 },

    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingHorizontal: 10 },
    navBtn: { width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(255,255,255,0.6)', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFF', shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10 },
    navBtnPrimary: { backgroundColor: COLORS.textDark, borderColor: COLORS.textDark },
    navBtnDisabled: { opacity: 0.3 },
    navArrow: { fontSize: 28, color: COLORS.textDark, fontWeight: '300' },
    exitBtn: { padding: 10 },
    exitText: { color: COLORS.textGrey, fontWeight: '600', textTransform: 'uppercase', fontSize: 12 },

    glassSearch: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.glassSurface, height: 56, borderRadius: 18, paddingHorizontal: 16, marginBottom: 20, borderWidth: 1, borderColor: COLORS.glassBorder },
    searchInput: { flex: 1, fontSize: 17, fontWeight: '500', color: COLORS.textDark },
    colorfulRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: COLORS.glassSurface, padding: 18, borderRadius: 22, marginBottom: 12, borderWidth: 1, borderColor: COLORS.glassBorder },
    germanWord: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
    englishWord: { fontSize: 15, fontWeight: '500', color: COLORS.textGrey },
    badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
    badgeText: { fontSize: 12, fontWeight: '800' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 50 },

    // Mastery & Filters
    masteryWidget: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: COLORS.noun,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        shadowColor: COLORS.noun,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    masteryLeft: { flexDirection: 'column' },
    masteryLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
    masteryCount: { color: '#FFF', fontSize: 32, fontWeight: '900' },
    masteryIconCircle: {
        width: 50, height: 50, borderRadius: 25,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center', justifyContent: 'center'
    },
    filterRow: {
        flexDirection: 'row',
        marginBottom: 15,
    },
    filterChip: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: 'rgba(0,0,0,0.05)',
    },
    filterChipActive: {
        backgroundColor: COLORS.textDark,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textGrey,
    },
    filterTextActive: {
        color: '#FFF',
    },
    // NEW: Category Pills Styles
    categoryScrollContainer: {
        paddingRight: 20,
    },
    categoryPill: {
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 20,
        marginRight: 10,
        backgroundColor: 'rgba(255,255,255,0.8)',
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    categoryPillActive: {
        backgroundColor: COLORS.noun,
        borderColor: COLORS.noun,
    },
    categoryPillText: {
        fontSize: 14,
        fontWeight: '600',
        color: COLORS.textDark,
    },
    categoryPillTextActive: {
        color: '#FFF',
        fontWeight: '700',
    },
    categorySeparator: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    separatorText: {
        fontSize: 18,
        color: COLORS.textGrey,
        fontWeight: '300',
    },
    // A-Z Letter Pills
    letterPill: {
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 16,
        marginRight: 8,
        backgroundColor: 'rgba(0,0,0,0.05)',
        minWidth: 40,
        alignItems: 'center',
    },
    letterPillActive: {
        backgroundColor: COLORS.verb,
    },
    letterPillText: {
        fontSize: 14,
        fontWeight: '700',
        color: COLORS.textGrey,
    },
    letterPillTextActive: {
        color: '#FFF',
    },
    alphabetSlider: {
        position: 'absolute',
        right: 0,
        top: 140,
        bottom: 80,
        width: 16,
        backgroundColor: 'transparent',
        paddingVertical: 4,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    sliderLetter: {
        width: 14,
        height: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderLetterActive: {
        backgroundColor: COLORS.verb,
        borderRadius: 7,
    },
    sliderLetterText: {
        fontSize: 9,
        fontWeight: '600',
        color: COLORS.textGrey,
    },
    sliderLetterTextActive: {
        color: '#FFF',
        fontWeight: '800',
    },
    letterOverlay: {
        position: 'absolute',
        top: '40%',
        left: '50%',
        marginLeft: -45,
        width: 90,
        height: 90,
        backgroundColor: 'rgba(0,0,0,0.85)',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100,
    },
    letterOverlayText: {
        fontSize: 48,
        fontWeight: '900',
        color: '#FFF',
    },
    miniCheck: {
        color: COLORS.success,
        fontSize: 14,
        fontWeight: 'bold',
        marginLeft: 6,
    }
});

export default VocabPlayground;