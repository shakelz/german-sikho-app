import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    TextInput,
    ActivityIndicator,
    TouchableOpacity,
    Dimensions,
    Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VocabularyService from '../../services/vocabService';
import VocabularyCard from '../../components/shared/VocabularyCard';

const { width } = Dimensions.get('window');

const VocabularyDeckScreen = () => {
    const insets = useSafeAreaInsets();
    const [vocabData, setVocabData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // View Mode: 'list' | 'flashcards'
    const [viewMode, setViewMode] = useState('list');

    // Filter Mode: 'all' | 'learnt' | 'unlearnt'
    const [filterMode, setFilterMode] = useState('all');

    // Flashcard State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    useEffect(() => {
        loadVocabulary();
    }, []);

    const loadVocabulary = async () => {
        setLoading(true);
        try {
            // This fetches data merged with SRS progress
            const data = await VocabularyService.fetchData();
            setVocabData(data);
        } catch (error) {
            console.error('Failed to load vocabulary:', error);
        } finally {
            setLoading(false);
        }
    };

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        return vocabData.filter((item) => {
            // 1. Search Filter
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                item.german.toLowerCase().includes(query) ||
                item.english.toLowerCase().includes(query);

            if (!matchesSearch) return false;

            // 2. Status Filter
            // "Learnt" = interval > 1 day
            // "Unlearnt" = interval <= 1 day (or undefined)
            const interval = item.interval || 0;
            const isLearnt = interval > 1;

            if (filterMode === 'learnt') return isLearnt;
            if (filterMode === 'unlearnt') return !isLearnt;

            return true; // 'all'
        });
    }, [vocabData, searchQuery, filterMode]);

    // Reset card index when filter changes
    useEffect(() => {
        setCurrentCardIndex(0);
    }, [filterMode, viewMode, searchQuery]);

    // --- SRS ACTION HANDLER ---
    const handleSRSAction = async (wordId, quality) => {
        await VocabularyService.updateWordProgress(wordId, quality);

        // Refresh local data to reflect new interval
        // Optimization: Update local state directly instead of full reload
        setVocabData(prevData => prevData.map(item => {
            if (item.german === wordId) {
                // Calculate new interval roughly for immediate UI feedback
                let newInterval = item.interval || 1;
                if (quality === 'again') newInterval = 1;
                else if (quality === 'hard') newInterval = Math.max(1, Math.floor(newInterval * 1.2));
                else if (quality === 'good') newInterval = Math.max(1, Math.floor(newInterval * 2.5));

                return { ...item, interval: newInterval };
            }
            return item;
        }));

        // Move to next card
        if (currentCardIndex < filteredData.length - 1) {
            setCurrentCardIndex(prev => prev + 1);
        } else {
            // End of deck
            // Optional: Show completion message or loop
        }
    };

    // --- RENDERERS ---

    const renderFilterTabs = () => (
        <View style={styles.filterContainer}>
            {['all', 'learnt', 'unlearnt'].map(mode => (
                <TouchableOpacity
                    key={mode}
                    style={[styles.filterTab, filterMode === mode && styles.activeFilterTab]}
                    onPress={() => setFilterMode(mode)}
                >
                    <Text style={[styles.filterText, filterMode === mode && styles.activeFilterText]}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const renderViewToggle = () => (
        <View style={styles.toggleContainer}>
            <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'list' && styles.activeToggle]}
                onPress={() => setViewMode('list')}
            >
                <Text style={[styles.toggleText, viewMode === 'list' && styles.activeToggleText]}>📋 List</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.toggleButton, viewMode === 'flashcards' && styles.activeToggle]}
                onPress={() => setViewMode('flashcards')}
            >
                <Text style={[styles.toggleText, viewMode === 'flashcards' && styles.activeToggleText]}>🃏 Cards</Text>
            </TouchableOpacity>
        </View>
    );

    const renderListItem = ({ item }) => {
        const isLearnt = (item.interval || 0) > 1;
        return (
            <View style={styles.listItem}>
                <View style={styles.listItemContent}>
                    <Text style={styles.germanWord}>{item.german}</Text>
                    <Text style={styles.englishWord}>{item.english}</Text>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>
                        {isLearnt ? `✅ ${item.interval}d` : '🆕 New'}
                    </Text>
                </View>
            </View>
        );
    };

    const renderFlashcardView = () => {
        if (filteredData.length === 0) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No cards match your filter!</Text>
                </View>
            );
        }

        const currentItem = filteredData[currentCardIndex];

        return (
            <View style={styles.flashcardContainer}>
                <Text style={styles.counterText}>
                    {currentCardIndex + 1} / {filteredData.length}
                </Text>

                <VocabularyCard
                    item={currentItem}
                    onSRSAction={handleSRSAction}
                />

                <View style={styles.navigationControls}>
                    <TouchableOpacity
                        style={[styles.navButton, currentCardIndex === 0 && styles.disabledNav]}
                        disabled={currentCardIndex === 0}
                        onPress={() => setCurrentCardIndex(prev => prev - 1)}
                    >
                        <Text style={styles.navText}>⬅️ Prev</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.navButton, currentCardIndex === filteredData.length - 1 && styles.disabledNav]}
                        disabled={currentCardIndex === filteredData.length - 1}
                        onPress={() => setCurrentCardIndex(prev => prev + 1)}
                    >
                        <Text style={styles.navText}>Next ➡️</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#58CC02" />
                <Text style={styles.loadingText}>Loading Playground...</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <Text style={styles.title}>Vocabulary Playground 🎡</Text>

                {/* Search */}
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search words..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#999"
                />

                {/* Controls Row */}
                <View style={styles.controlsRow}>
                    {renderViewToggle()}
                    {renderFilterTabs()}
                </View>
            </View>

            <View style={styles.contentArea}>
                {viewMode === 'list' ? (
                    <FlatList
                        data={filteredData}
                        renderItem={renderListItem}
                        keyExtractor={(item) => item.german}
                        contentContainerStyle={styles.listContent}
                        ListEmptyComponent={
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No words found.</Text>
                            </View>
                        }
                    />
                ) : (
                    renderFlashcardView()
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    header: {
        backgroundColor: 'white',
        padding: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        zIndex: 10,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        textAlign: 'center',
    },
    searchInput: {
        backgroundColor: '#F3F4F6',
        padding: 12,
        borderRadius: 12,
        fontSize: 16,
        color: '#333',
        marginBottom: 15,
    },
    controlsRow: {
        gap: 15,
    },
    // View Toggle
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F3F4F6',
        borderRadius: 10,
        padding: 4,
    },
    toggleButton: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 8,
    },
    activeToggle: {
        backgroundColor: 'white',
        elevation: 2,
    },
    toggleText: {
        fontWeight: '600',
        color: '#666',
    },
    activeToggleText: {
        color: '#58CC02',
        fontWeight: 'bold',
    },
    // Filter Tabs
    filterContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 10,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 8,
        alignItems: 'center',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    activeFilterTab: {
        backgroundColor: '#58CC02',
        borderColor: '#58CC02',
    },
    filterText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#666',
    },
    activeFilterText: {
        color: 'white',
    },
    // Content
    contentArea: {
        flex: 1,
    },
    listContent: {
        padding: 15,
    },
    listItem: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 1,
    },
    listItemContent: {
        flex: 1,
    },
    germanWord: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    englishWord: {
        fontSize: 14,
        color: '#666',
    },
    statusBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#555',
    },
    // Flashcard View
    flashcardContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 20,
    },
    counterText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#666',
        marginBottom: 10,
    },
    navigationControls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 20,
    },
    navButton: {
        padding: 10,
    },
    navText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#58CC02',
    },
    disabledNav: {
        opacity: 0.3,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
});

export default VocabularyDeckScreen;
