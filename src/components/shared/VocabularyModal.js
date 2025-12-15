import React, { useEffect, useState } from 'react';
import {
    Modal,
    View,
    Text,
    ActivityIndicator,
    FlatList,
    RefreshControl,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
// 1. IMPORT TTS
import Tts from 'react-native-tts';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import vocabService from '../../services/vocabService';

export default function VocabularyModal({ visible, onClose, moduleId, moduleTitle }) {
    const insets = useSafeAreaInsets();
    const [loading, setLoading] = useState(true);
    const [vocab, setVocab] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    // 2. INITIALIZE TTS ON MOUNT
    useEffect(() => {
        const setupTts = async () => {
            try {
                // Determine if engine is ready
                await Tts.getInitStatus();
                // Set default language to German
                Tts.setDefaultLanguage('de-DE');
                // IOS: Play sound even if silent switch is on
                Tts.setIgnoreSilentSwitch("ignore");
            } catch (err) {
                console.log("TTS Init error", err);
            }
        };

        if (visible) {
            setupTts();
        }

        // Cleanup: Stop speaking when Modal closes
        return () => {
            Tts.stop();
        };
    }, [visible]);

    // 3. ADD PLAY FUNCTION
    const playWord = (text) => {
        // Stop any previous word immediately
        Tts.stop();
        // Speak the new word
        Tts.speak(text);
    };

    const loadData = async (force = false) => {
        if (!moduleId) return;
        setLoading(!refreshing);
        try {
            const result = await vocabService.fetchVocabItems(moduleId);
            setVocab(result || []);
        } catch (error) {
            console.error('Error loading vocab:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (visible && moduleId) {
            loadData();
        }
    }, [visible, moduleId]);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadData(true);
    };

    // 4. UPDATE UI TO INCLUDE SPEAKER BUTTON
    const renderVocabItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.wordRow}>
                <View>
                    <Text style={styles.germanWord}>{item.german}</Text>
                    <Text style={styles.englishWord}>{item.english}</Text>
                </View>

                {/* Speaker Icon Button */}
                <TouchableOpacity
                    style={styles.speakerButton}
                    onPress={() => playWord(item.german)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Easier to tap
                >
                    <Text style={{ fontSize: 24 }}>🔊</Text>
                </TouchableOpacity>
            </View>

            {item.example ? (
                <Text style={styles.exampleText}>{item.example}</Text>
            ) : null}
        </View>
    );

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>{moduleTitle || 'Vocabulary'}</Text>
                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#007AFF" />
                        <Text style={styles.loadingText}>Loading words...</Text>
                    </View>
                ) : (
                    <FlatList
                        data={vocab}
                        keyExtractor={(item) => item.id || item.german} // Fallback key
                        contentContainerStyle={styles.listContent}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                        ListEmptyComponent={
                            <View style={styles.center}>
                                <Text style={styles.emptyText}>No vocabulary found for this module.</Text>
                            </View>
                        }
                        renderItem={renderVocabItem}
                    />
                )}
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F2F2F7',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E5EA',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#000000',
    },
    closeButton: {
        padding: 8,
    },
    closeButtonText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        color: '#8E8E93',
    },
    emptyText: {
        color: '#8E8E93',
        fontSize: 16,
    },
    listContent: {
        padding: 16,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    wordRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    germanWord: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000000',
    },
    englishWord: {
        fontSize: 18,
        color: '#666666',
    },
    exampleText: {
        fontSize: 14,
        color: '#8E8E93',
        fontStyle: 'italic',
        marginTop: 4,
    },
    // New Style for the button
    speakerButton: {
        padding: 8,
        backgroundColor: '#f0f0f0',
        borderRadius: 20,
        marginLeft: 10,
    }
});