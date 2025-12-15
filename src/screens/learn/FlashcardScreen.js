import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import tts from '../../services/tts';

const { width } = Dimensions.get('window');

const FlashcardScreen = ({ route, navigation }) => {
    const { lessonData } = route.params || {};
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showTranslation, setShowTranslation] = useState(false);

    useEffect(() => {
        // Initialize TTS
        tts.initTts();
    }, []);

    if (!lessonData || !lessonData.items || lessonData.items.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>No content available</Text>
            </View>
        );
    }

    const currentItem = lessonData.items[currentIndex];
    const progress = ((currentIndex + 1) / lessonData.items.length) * 100;

    const handleSpeak = () => {
        tts.speak(currentItem.german);
    };

    const handleNext = () => {
        if (currentIndex < lessonData.items.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setShowTranslation(false);
        } else {
            // Finished all cards
            navigation.goBack();
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
            setShowTranslation(false);
        }
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Learn Mode</Text>
                <Text style={styles.counter}>{currentIndex + 1}/{lessonData.items.length}</Text>
            </View>

            {/* Progress Bar */}
            <View style={styles.progressBarContainer}>
                <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>

            {/* Flashcard */}
            <View style={styles.cardContainer}>
                <TouchableOpacity
                    style={styles.card}
                    activeOpacity={0.9}
                    onPress={() => setShowTranslation(!showTranslation)}
                >
                    <Text style={styles.cardGerman}>{currentItem.german}</Text>

                    {showTranslation && (
                        <View style={styles.translationContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.cardEnglish}>{currentItem.english}</Text>
                            {currentItem.gender && (
                                <Text style={styles.cardGender}>({currentItem.gender})</Text>
                            )}
                        </View>
                    )}

                    {!showTranslation && (
                        <Text style={styles.tapHint}>Tap to reveal translation</Text>
                    )}
                </TouchableOpacity>

                {/* TTS Button */}
                <TouchableOpacity
                    style={styles.ttsButton}
                    onPress={handleSpeak}
                >
                    <Text style={styles.ttsIcon}>🔊</Text>
                    <Text style={styles.ttsText}>Pronounce</Text>
                </TouchableOpacity>
            </View>

            {/* Navigation Buttons */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
                    onPress={handlePrevious}
                    disabled={currentIndex === 0}
                >
                    <Text style={styles.navButtonText}>← Previous</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navButton}
                    onPress={handleNext}
                >
                    <Text style={styles.navButtonText}>
                        {currentIndex === lessonData.items.length - 1 ? 'Finish' : 'Next →'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
    },
    closeButton: {
        fontSize: 24,
        color: '#666',
        width: 40,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    counter: {
        fontSize: 16,
        color: '#666',
        width: 40,
        textAlign: 'right',
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: '#e0e0e0',
    },
    progressBar: {
        height: '100%',
        backgroundColor: '#4CAF50',
    },
    cardContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        width: width - 40,
        minHeight: 300,
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 30,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    cardGerman: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    translationContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    divider: {
        width: 60,
        height: 2,
        backgroundColor: '#ddd',
        marginVertical: 15,
    },
    cardEnglish: {
        fontSize: 24,
        color: '#666',
        textAlign: 'center',
    },
    cardGender: {
        fontSize: 16,
        color: '#999',
        marginTop: 10,
        fontStyle: 'italic',
    },
    tapHint: {
        fontSize: 14,
        color: '#999',
        marginTop: 30,
        fontStyle: 'italic',
    },
    ttsButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    ttsIcon: {
        fontSize: 24,
        marginRight: 10,
    },
    ttsText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 20,
        paddingBottom: 30,
    },
    navButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 10,
        minWidth: 120,
    },
    navButtonDisabled: {
        backgroundColor: '#ccc',
    },
    navButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    errorText: {
        fontSize: 18,
        color: '#666',
        textAlign: 'center',
        marginTop: 50,
    },
});

export default FlashcardScreen;
