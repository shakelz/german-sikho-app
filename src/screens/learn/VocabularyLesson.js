import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, ScrollView, StatusBar, Dimensions, ActivityIndicator, Modal, TextInput, Animated } from 'react-native';
import Sound from 'react-native-sound';
import Tts from 'react-native-tts';
import VocabularyService from '../../services/vocabService';
import progressService from '../../services/progressService';
import soundService from '../../services/sound';
import VocabularyCard from '../../components/shared/VocabularyCard';

const grammarBg = require('../../assets/icons/forest_background.jpg');
const closeButton = require('../../assets/icons/close_button.png');
const { width, height } = Dimensions.get('window');

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

const VocabularyLesson = ({ navigation, route }) => {
    const { lessonId, category, backgroundImage, themeId } = route.params || {};
    const woodTapSound = useRef(null);
    const [coinsAwarded, setCoinsAwarded] = useState(0);
    const rewardScaleAnim = useRef(new Animated.Value(0)).current;

    // Animation Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const shakeAnim = useRef(new Animated.Value(0)).current;

    // Use passed background or default to forest
    const bgImage = backgroundImage || grammarBg;

    // Modes: 'loading', 'list', 'flashcards', 'quiz'
    const [mode, setMode] = useState('loading');
    const [words, setWords] = useState([]);
    const [lessonTitle, setLessonTitle] = useState('Vocabulary Lesson');

    // Flashcard State
    const [currentCardIndex, setCurrentCardIndex] = useState(0);

    // Quiz State
    const [quizQuestions, setQuizQuestions] = useState([]);
    const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCorrect, setIsCorrect] = useState(null);

    // Quiz Selection State
    const [quizModalVisible, setQuizModalVisible] = useState(false);
    const [quizQuestionCount, setQuizQuestionCount] = useState(10);

    // Initialize and preload sound
    useEffect(() => {
        Sound.setCategory('Playback');
        woodTapSound.current = new Sound('wood_tap.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('❌ Failed to load wood tap sound:', error);
            }
        });

        loadVocabulary();

        return () => {
            if (woodTapSound.current) {
                woodTapSound.current.release();
            }
        };
    }, []);

    const loadVocabulary = async () => {
        try {
            let fetchedWords;
            if (category) {
                fetchedWords = await VocabularyService.getWordsByCategory(category);
                setLessonTitle(`${category} Vocabulary`);
            } else if (lessonId) {
                // If lessonId is provided (like 't3', 't4'), fetch by that ID
                fetchedWords = await VocabularyService.fetchVocabItems(lessonId);
                // Set a generic title or map IDs to titles if needed
                if (lessonId === 't3') setLessonTitle('Desert Treasure 1');
                else if (lessonId === 't4') setLessonTitle('Desert Treasure 2');
                else setLessonTitle('Vocabulary Chest');
            } else {
                // Default to random words if no category provided (or specific lesson logic)
                fetchedWords = await VocabularyService.getRandomWords(10);
                setLessonTitle('Daily Practice');
            }
            setWords(fetchedWords);
            // Default quiz count to min(10, total words)
            setQuizQuestionCount(Math.min(10, fetchedWords.length));
            setMode('list');
        } catch (error) {
            console.error('Error loading vocabulary:', error);
            setMode('error');
        }
    };

    const playWoodTapSound = () => {
        if (woodTapSound.current) {
            woodTapSound.current.stop(() => {
                woodTapSound.current.setVolume(1.0);
                woodTapSound.current.play();
            });
        }
    };

    const speakWord = (text) => {
        try {
            Tts.setDefaultLanguage('de-DE');
            Tts.stop();
            Tts.speak(text);
        } catch (err) {
            console.warn('TTS Error:', err);
        }
    };

    const handleClose = () => {
        playWoodTapSound();
        setTimeout(() => {
            navigation.goBack();
        }, 200);
    };

    // --- Flashcard Logic ---
    const nextCard = () => {
        playWoodTapSound();
        if (currentCardIndex < words.length - 1) {
            setCurrentCardIndex(currentCardIndex + 1);
        } else {
            setMode('list');
        }
    };

    const prevCard = () => {
        playWoodTapSound();
        if (currentCardIndex > 0) {
            setCurrentCardIndex(currentCardIndex - 1);
        }
    };

    // --- Quiz Logic ---
    const startQuiz = (count = 10) => {
        // Ensure count is within bounds
        const safeCount = Math.max(1, Math.min(count, words.length));

        // Select random words for the quiz
        const shuffledWords = [...words].sort(() => 0.5 - Math.random()).slice(0, safeCount);

        // Generate questions
        const questions = shuffledWords.map(word => {
            // Get 3 random incorrect options from the same set or global set
            const otherWords = words.filter(w => w.german !== word.german);
            const shuffledOthers = otherWords.sort(() => 0.5 - Math.random()).slice(0, 3);

            // If we don't have enough words, fill with placeholders
            while (shuffledOthers.length < 3) {
                shuffledOthers.push({ english: '...' });
            }

            const options = [...shuffledOthers, word].sort(() => 0.5 - Math.random());

            return {
                question: `What is "${word.german}"?`,
                correctAnswer: word.english,
                options: options.map(o => o.english)
            };
        });

        // Shuffle questions
        setQuizQuestions(questions.sort(() => 0.5 - Math.random()));
        setCurrentQuizIndex(0);
        setScore(0);
        setQuizFinished(false);
        setQuizModalVisible(false);
        setMode('quiz');
    };

    const handleOptionSelect = (option) => {
        if (selectedOption) return; // Prevent multiple clicks

        setSelectedOption(option);
        const correct = option === quizQuestions[currentQuizIndex].correctAnswer;
        setIsCorrect(correct);

        // Reset animations
        scaleAnim.setValue(1);
        shakeAnim.setValue(0);

        if (correct) {
            setScore(score + 1);
            soundService.playCorrect();
            // Pop animation for correct answer
            Animated.sequence([
                Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
                Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true })
            ]).start();
        } else {
            soundService.playWrong();
            // Shake animation for wrong answer
            Animated.sequence([
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
                Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
            ]).start();
        }

        setTimeout(() => {
            if (currentQuizIndex < quizQuestions.length - 1) {
                setCurrentQuizIndex(currentQuizIndex + 1);
                setSelectedOption(null);
                setIsCorrect(null);
            } else {
                soundService.playFinish();
                setQuizFinished(true);
            }
        }, 1500);
    };

    // --- Render Functions ---

    const renderQuizSelectionModal = () => {
        if (!quizModalVisible) return null;

        console.log('Rendering Quiz Modal Overlay');
        return (
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Start Quiz 📝</Text>
                    <Text style={styles.modalSubtitle}>How many questions?</Text>

                    <View style={styles.counterContainer}>
                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => setQuizQuestionCount(Math.max(10, quizQuestionCount - 5))}
                        >
                            <Text style={styles.counterButtonText}>-</Text>
                        </TouchableOpacity>

                        <Text style={styles.counterText}>{quizQuestionCount}</Text>

                        <TouchableOpacity
                            style={styles.counterButton}
                            onPress={() => setQuizQuestionCount(Math.min(words.length, quizQuestionCount + 5))}
                        >
                            <Text style={styles.counterButtonText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.limitText}>(Max: {words.length})</Text>

                    <TouchableOpacity
                        style={styles.modalStartButton}
                        onPress={() => startQuiz(quizQuestionCount)}
                    >
                        <Text style={styles.modalStartButtonText}>Start Now!</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.modalCloseButton}
                        onPress={() => setQuizModalVisible(false)}
                    >
                        <Text style={styles.modalCloseButtonText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const renderList = () => (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Premium Header Card */}
            <View style={styles.headerCard}>
                <ImageBackground
                    source={require('../../assets/icons/forest_background.jpg')}
                    style={styles.headerBackground}
                    imageStyle={{ borderRadius: 20, opacity: 0.8 }}
                >
                    <View style={styles.headerOverlay}>
                        <Text style={styles.headerTitle}>{lessonTitle}</Text>
                        <View style={styles.statsContainer}>
                            <Text style={styles.statsText}>📚 {words.length} Words</Text>
                            <Text style={styles.statsText}>🔥 {words.filter(w => w.interval > 20).length} Mastered</Text>
                        </View>
                    </View>
                </ImageBackground>
            </View>

            {/* Action Buttons Container */}
            <View style={styles.actionsContainer}>
                {/* Start Quiz Button */}
                <TouchableOpacity
                    style={[styles.quizButton, words.length === 0 && { opacity: 0.5 }]}
                    activeOpacity={0.8}
                    disabled={words.length === 0}
                    onPress={() => {
                        console.log('Start Quiz Pressed. Words:', words.length);
                        setQuizQuestionCount(Math.min(10, words.length));
                        setQuizModalVisible(true);
                    }}
                >
                    <Text style={styles.quizButtonText}>📝 Start Quiz</Text>
                    <Text style={styles.quizButtonSubtext}>Test your knowledge</Text>
                </TouchableOpacity>

                {/* Flashcards Button */}
                <TouchableOpacity
                    style={styles.flashcardsButton}
                    activeOpacity={0.8}
                    onPress={() => setMode('flashcards')}
                >
                    <Text style={styles.flashcardsButtonText}>
                        {currentCardIndex > 0 ? "⏯️ Resume" : "🃏 Flashcards"}
                    </Text>
                    <Text style={styles.flashcardsButtonSubtext}>Learn & Review</Text>
                </TouchableOpacity>
            </View>

            {currentCardIndex > 0 && (
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => {
                        setCurrentCardIndex(0);
                        setMode('flashcards');
                    }}
                >
                    <Text style={styles.resetButtonText}>🔄 Start from Beginning</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Word List</Text>

            <View style={styles.listContainer}>
                {words.map((word, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.wordCard}
                        activeOpacity={0.9}
                        onPress={() => {
                            setCurrentCardIndex(index);
                            setMode('flashcards');
                        }}
                    >
                        <View style={styles.wordCardIndex}>
                            <Text style={styles.indexText}>{index + 1}</Text>
                        </View>

                        <View style={styles.wordCardContent}>
                            <Text style={styles.wordGerman}>{word.german}</Text>
                            <Text style={styles.wordEnglish}>{word.english}</Text>
                        </View>

                        <View style={styles.wordCardAction}>
                            <Text style={styles.playIcon}>🔊</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );

    const renderFlashcards = () => (
        <View style={styles.centerContent}>
            <Text style={styles.modeTitle}>Flashcards ({currentCardIndex + 1}/{words.length})</Text>

            <VocabularyCard
                item={words[currentCardIndex]}
                onSRSAction={async (wordId, quality) => {
                    await VocabularyService.updateWordProgress(wordId, quality);
                    nextCard();
                }}
            />

            <View style={styles.controls}>
                <TouchableOpacity style={styles.controlButton} onPress={prevCard} disabled={currentCardIndex === 0}>
                    <Text style={[styles.controlText, currentCardIndex === 0 && styles.disabledText]}>⬅️ Prev</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.controlButton} onPress={nextCard}>
                    <Text style={styles.controlText}>{currentCardIndex === words.length - 1 ? "Finish" : "Next ➡️"}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.backToModeButton} onPress={() => setMode('list')}>
                <Text style={styles.backToModeText}>Back to List</Text>
            </TouchableOpacity>
        </View>
    );

    // Trigger reward when quiz finishes
    useEffect(() => {
        if (quizFinished && lessonId) {
            const awardReward = async () => {
                let reward = 10;
                if (score === quizQuestions.length) reward = 20;

                const reasonId = `vocab_${lessonId}_${Date.now()}`;
                const newBalance = await progressService.awardCoins(reward, reasonId);

                if (newBalance !== null) {
                    setCoinsAwarded(reward);
                    Animated.spring(rewardScaleAnim, {
                        toValue: 1,
                        friction: 3,
                        tension: 40,
                        useNativeDriver: true,
                    }).start();
                }
            };
            awardReward();
        }
    }, [quizFinished, lessonId, score, quizQuestions.length]);

    const renderQuiz = () => {

        if (quizFinished) {
            return (
                <View style={styles.centerContent}>
                    <View style={styles.resultCard}>
                        <Text style={styles.resultEmoji}>🏆</Text>
                        <Text style={styles.resultTitle}>Quiz Complete!</Text>
                        <Text style={styles.scoreText}>{score} / {quizQuestions.length}</Text>
                        <Text style={styles.feedbackText}>
                            {score === quizQuestions.length ? "Perfect Score! 🌟" : score > quizQuestions.length / 2 ? "Great Job! 👍" : "Keep Practicing! 💪"}
                        </Text>

                        {/* Coin Reward Animation */}
                        {coinsAwarded > 0 && (
                            <Animated.View style={[styles.rewardContainer, { transform: [{ scale: rewardScaleAnim }] }]}>
                                <Text style={styles.coinEmoji}>🪙</Text>
                                <Text style={styles.rewardText}>+{coinsAwarded} Coins!</Text>
                            </Animated.View>
                        )}

                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={async () => {
                                if (lessonId) {
                                    await progressService.markModuleComplete(lessonId);
                                    // Save score for stars
                                    await progressService.saveQuizScore(lessonId, score, quizQuestions.length);
                                }
                                setMode('list');
                                if (themeId) {
                                    navigation.reset({
                                        index: 1,
                                        routes: [
                                            { name: 'WorldSelect' },
                                            { name: 'MapScreen', params: { themeId } },
                                        ],
                                    });
                                } else {
                                    navigation.goBack();
                                }
                            }}
                        >
                            <Text style={styles.primaryButtonText}>Finish Lesson</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.secondaryButton} onPress={() => setQuizModalVisible(true)}>
                            <Text style={styles.secondaryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        const question = quizQuestions[currentQuizIndex];
        if (!question) return <View />;

        const progress = ((currentQuizIndex + 1) / quizQuestions.length) * 100;

        return (
            <View style={styles.quizContainer}>
                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBarFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>Question {currentQuizIndex + 1} of {quizQuestions.length}</Text>

                <View style={styles.quizCard}>
                    <Text style={styles.quizQuestionLabel}>What is this in English?</Text>

                    <View style={styles.quizQuestionRow}>
                        <Text style={styles.quizQuestionText}>{question.question.replace('What is "', '').replace('"?', '')}</Text>
                        <TouchableOpacity
                            style={styles.quizSpeakerButton}
                            onPress={() => speakWord(question.question.replace('What is "', '').replace('"?', ''))}
                        >
                            <Text style={styles.quizSpeakerIcon}>🔊</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.quizOptionsContainer}>
                    {question.options.map((option, index) => {
                        const isSelected = selectedOption === option;
                        const isShowCorrect = selectedOption && option === question.correctAnswer;

                        let additionalStyle = {};
                        let textStyle = styles.quizOptionText;
                        let animatedStyle = {};

                        if (isSelected) {
                            additionalStyle = isCorrect ? styles.quizOptionCorrect : styles.quizOptionWrong;
                            textStyle = styles.quizOptionTextSelected;

                            if (isCorrect) {
                                animatedStyle = { transform: [{ scale: scaleAnim }] };
                            } else {
                                animatedStyle = { transform: [{ translateX: shakeAnim }] };
                            }
                        } else if (isShowCorrect) {
                            additionalStyle = styles.quizOptionCorrect;
                            textStyle = styles.quizOptionTextSelected;
                        }

                        return (
                            <AnimatedTouchableOpacity
                                key={index}
                                style={[styles.quizOptionButton, additionalStyle, animatedStyle]}
                                onPress={() => handleOptionSelect(option)}
                                disabled={selectedOption !== null}
                                activeOpacity={0.8}
                            >
                                <Text style={textStyle}>{option}</Text>
                                {isSelected && (
                                    <Text style={styles.feedbackIcon}>{isCorrect ? '✅' : '❌'}</Text>
                                )}
                            </AnimatedTouchableOpacity>
                        );
                    })}
                </View>

                <TouchableOpacity style={styles.quitButton} onPress={() => setMode('list')}>
                    <Text style={styles.quitButtonText}>Quit Quiz</Text>
                </TouchableOpacity>
            </View>
        );
    };

    if (mode === 'loading') {
        return (
            <View style={[styles.container, styles.centerContent]}>
                <ActivityIndicator size="large" color="#58CC02" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />

            <ImageBackground
                source={bgImage}
                style={styles.background}
                resizeMode="cover"
            >
                {/* Close Button - Hide in Flashcards mode */}
                {mode !== 'flashcards' && (
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Image source={closeButton} style={styles.closeIcon} resizeMode="contain" />
                    </TouchableOpacity>
                )}

                {mode === 'list' && renderList()}
                {mode === 'flashcards' && renderFlashcards()}
                {mode === 'quiz' && renderQuiz()}

            </ImageBackground>

            {renderQuizSelectionModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    background: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 100,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeIcon: {
        width: 40,
        height: 40,
    },
    scrollContent: {
        paddingTop: 100,
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    // New Header Styles
    headerCard: {
        marginBottom: 20,
        borderRadius: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        backgroundColor: 'white',
    },
    headerBackground: {
        width: '100%',
        height: 120,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerOverlay: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    statsText: {
        color: 'white',
        fontWeight: '600',
        fontSize: 14,
        backgroundColor: 'rgba(0,0,0,0.4)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    // Action Buttons
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 25,
        gap: 15,
    },
    quizButton: {
        flex: 1,
        backgroundColor: '#FFC107',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 4,
    },
    quizButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    quizButtonSubtext: {
        fontSize: 11,
        color: '#555',
        marginTop: 2,
    },
    flashcardsButton: {
        flex: 1,
        backgroundColor: '#58CC02',
        padding: 15,
        borderRadius: 15,
        alignItems: 'center',
        elevation: 4,
    },
    flashcardsButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
    },
    flashcardsButtonSubtext: {
        fontSize: 11,
        color: '#E0F2FE',
        marginTop: 2,
    },
    resetButton: {
        alignSelf: 'center',
        marginBottom: 20,
        padding: 8,
    },
    resetButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 15,
        marginLeft: 5,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    // List Styles
    listContainer: {
        paddingBottom: 20,
    },
    wordCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    wordCardIndex: {
        backgroundColor: '#F3F4F6',
        width: 30,
        height: 30,
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    indexText: {
        color: '#6B7280',
        fontWeight: 'bold',
        fontSize: 12,
    },
    wordCardContent: {
        flex: 1,
    },
    wordGerman: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: 2,
    },
    wordEnglish: {
        fontSize: 15,
        color: '#6B7280',
    },
    wordCardAction: {
        padding: 5,
    },
    playIcon: {
        fontSize: 18,
        opacity: 0.6,
    },
    // Flashcard Styles
    modeTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: -1, height: 1 },
        textShadowRadius: 10
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '80%',
        marginTop: 10,
    },
    controlButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
    },
    controlText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    disabledText: {
        color: '#ccc',
    },
    backToModeButton: {
        marginTop: 30,
    },
    backToModeText: {
        color: 'white',
        fontSize: 16,
        textDecorationLine: 'underline',
        fontWeight: 'bold',
    },
    // Quiz Styles
    quizContainer: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    progressBarContainer: {
        width: '100%',
        height: 10,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 5,
        marginBottom: 10,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: '#FFC107',
        borderRadius: 5,
    },
    progressText: {
        color: 'white',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 20,
    },
    quizCard: {
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 30,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    quizQuestionLabel: {
        fontSize: 16,
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    quizQuestionText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
    },
    quizQuestionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    quizSpeakerButton: {
        backgroundColor: '#E0F2FE',
        padding: 8,
        borderRadius: 20,
    },
    quizSpeakerIcon: {
        fontSize: 24,
    },
    quizOptionsContainer: {
        width: '100%',
        gap: 12,
    },
    quizOptionButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 18,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        elevation: 2,
    },
    quizOptionCorrect: {
        backgroundColor: '#D1FAE5',
        borderColor: '#10B981',
    },
    quizOptionWrong: {
        backgroundColor: '#FEE2E2',
        borderColor: '#EF4444',
    },
    quizOptionText: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
    },
    quizOptionTextSelected: {
        fontSize: 18,
        color: '#333',
        fontWeight: 'bold',
    },
    feedbackIcon: {
        marginLeft: 10,
        fontSize: 18,
    },
    quitButton: {
        marginTop: 'auto',
        marginBottom: 30,
        padding: 10,
    },
    quitButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        opacity: 0.8,
    },
    // Result Styles
    resultEmoji: {
        fontSize: 60,
        marginBottom: 10,
    },
    primaryButton: {
        backgroundColor: '#58CC02',
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 30,
        width: '100%',
        alignItems: 'center',
        marginBottom: 15,
        elevation: 5,
    },
    primaryButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    resultCard: {
        backgroundColor: 'white',
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        width: '85%',
        elevation: 10,
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    scoreText: {
        fontSize: 24,
        color: '#58CC02',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    feedbackText: {
        fontSize: 18,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    secondaryButton: {
        marginTop: 15,
    },
    secondaryButtonText: {
        color: '#58CC02',
        fontSize: 16,
        fontWeight: 'bold',
    },
    // Modal Styles
    modalOverlay: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        elevation: 1000,
    },
    modalContent: {
        backgroundColor: 'white',
        width: '80%',
        padding: 25,
        borderRadius: 20,
        alignItems: 'center',
        elevation: 10,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    modalSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
    },
    counterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    counterButton: {
        backgroundColor: '#eee',
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    counterButtonText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    counterText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginHorizontal: 20,
        color: '#333',
    },
    limitText: {
        fontSize: 12,
        color: '#999',
        marginBottom: 20,
    },
    modalStartButton: {
        backgroundColor: '#58CC02',
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderRadius: 25,
        marginBottom: 10,
        width: '100%',
        alignItems: 'center',
    },
    modalStartButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalCloseButton: {
        padding: 10,
    },
    modalCloseButtonText: {
        color: '#666',
        fontSize: 16,
    }
});

export default VocabularyLesson;
