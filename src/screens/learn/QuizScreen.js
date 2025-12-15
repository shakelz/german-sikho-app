import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import sound from '../../services/sound';
import Tts from 'react-native-tts';
import AppwriteProgressService from '../../services/AppwriteProgressService';
import progressService from '../../services/progressService';
import UserStateService from '../../services/UserStateService';
import { getAuth } from '@react-native-firebase/auth';

const QuizScreen = ({ route, navigation }) => {
    const { lessonData, themeId, mode } = route.params || {};
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null); // For MCQ/TrueFalse
    const [sentenceOrder, setSentenceOrder] = useState([]); // For Sentence Order
    const [showFeedback, setShowFeedback] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Exam Mode: Store all answers to calculate score at the end
    const [examAnswers, setExamAnswers] = useState([]);

    const isExamMode = mode === 'exam';

    const playQuestionAudio = useCallback(() => {
        const question = lessonData?.quizQuestions?.[currentQuestionIndex];
        if (question?.audioText) {
            try {
                Tts.speak(question.audioText, { iosVoiceId: 'com.apple.ttsbundle.Moira-compact', rate: 0.5 });
            } catch (e) {
                console.warn("TTS not available", e);
            }
        }
    }, [lessonData, currentQuestionIndex]);

    useEffect(() => {
        // Auto-play audio for listening questions
        if (lessonData?.quizQuestions?.[currentQuestionIndex]?.type === 'listening') {
            playQuestionAudio();
        }
    }, [currentQuestionIndex, lessonData, playQuestionAudio]);

    if (!lessonData || !lessonData.quizQuestions || lessonData.quizQuestions.length === 0) {
        return (
            <View style={styles.container}>
                <View style={styles.modal}>
                    <Text style={styles.errorText}>No quiz questions available</Text>
                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.closeButtonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const currentQuestion = lessonData.quizQuestions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / lessonData.quizQuestions.length) * 100;
    const isSentenceOrder = currentQuestion.type === 'sentence_order';
    const isListening = currentQuestion.type === 'listening';

    const handleAnswer = (answer) => {
        if (showFeedback && !isExamMode) return;

        let correct = false;

        if (isSentenceOrder) {
            const userSentence = answer.join(' ').trim();
            const targetSentence = currentQuestion.correct_answer.trim();
            const normalizedUser = userSentence.replace(/\s+/g, ' ');
            const normalizedTarget = targetSentence.replace(/\s+/g, ' ');
            correct = normalizedUser === normalizedTarget;
        } else {
            setSelectedAnswer(answer);
            const userStr = String(answer).trim();
            const targetStr = String(currentQuestion.correct_answer).trim();
            if (currentQuestion.type === 'true_false') {
                correct = userStr.toLowerCase() === targetStr.toLowerCase();
            } else {
                correct = userStr === targetStr;
            }
        }

        setIsCorrect(correct);

        if (correct) {
            if (!isExamMode) sound.playCorrect();
            setScore(prevScore => prevScore + 1);
        } else {
            if (!isExamMode) sound.playWrong();
        }

        if (isExamMode) {
            setExamAnswers([...examAnswers, { questionId: currentQuestion.id, correct }]);
            setTimeout(() => handleNext(), 500);
        } else {
            setShowFeedback(true);
        }
    };

    const handleNext = async () => {
        if (currentQuestionIndex < lessonData.quizQuestions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
            setSelectedAnswer(null);
            setSentenceOrder([]);
            setShowFeedback(false);
            setIsCorrect(false);
        } else {
            sound.playFinish();

            // ==================== APPWRITE CLOUD SYNC ====================
            // Save progress to cloud (Offline-First with graceful fallback)
            try {
                const user = getAuth().currentUser;
                if (user) {
                    console.log('📊 Starting progress sync for user:', user.uid);

                    // 1. Update local progress using existing progressService
                    await progressService.markModuleComplete(lessonData.moduleId);
                    await progressService.saveQuizScore(lessonData.moduleId, score, lessonData.quizQuestions.length);

                    // 2. Calculate and award coins/stars
                    const percentage = Math.round((score / lessonData.quizQuestions.length) * 100);
                    let coinsEarned = 0;
                    let starsEarned = 0;

                    if (percentage >= 70) {
                        coinsEarned = 10; // Base reward for passing
                        starsEarned = 1;
                    }
                    if (percentage >= 90) {
                        coinsEarned = 15; // Bonus for excellent
                        starsEarned = 2;
                    }
                    if (percentage === 100) {
                        coinsEarned = 20; // Maximum reward for perfect
                        starsEarned = 3;
                    }

                    // Award coins and stars (will auto-sync to cloud)
                    if (coinsEarned > 0) {
                        await UserStateService.addCoins(coinsEarned);
                    }

                    // Save lesson-specific star progress (0-3 stars per lesson)
                    const lessonResult = await UserStateService.saveLessonProgress(
                        lessonData.moduleId,
                        percentage
                    );
                    console.log(`⭐ Lesson ${lessonData.moduleId}: ${lessonResult.stars} stars${lessonResult.isNewHighScore ? ' (NEW HIGH SCORE!)' : ''}`);

                    // 3. Get the updated progress
                    const updatedProgress = await progressService.loadProgress();

                    // 4. Sync to Appwrite cloud (saves locally first, then syncs)
                    const syncResult = await AppwriteProgressService.saveProgress(
                        user.uid,
                        updatedProgress
                    );

                    if (syncResult.cloud) {
                        console.log('✅ Progress synced to cloud successfully');
                    } else if (syncResult.local) {
                        console.log('📱 Progress saved locally (will sync when online)');
                    }
                } else {
                    console.log('ℹ️ No user authenticated, skipping cloud sync');
                }
            } catch (error) {
                // CRITICAL: Even if sync fails, continue to results screen
                console.error('⚠️ Progress sync failed (non-critical):', error.message);
                // User experience is not affected - progress is still saved locally
            }
            // ============================================================

            navigation.replace('Result', {
                score: isExamMode ? score : score,
                total: lessonData.quizQuestions.length,
                moduleId: lessonData.moduleId,
                themeId: themeId,
                isExam: isExamMode
            });
        }
    };

    const toggleWord = (word) => {
        if (showFeedback && !isExamMode) return;
        if (sentenceOrder.includes(word)) {
            setSentenceOrder(sentenceOrder.filter(w => w !== word));
        } else {
            setSentenceOrder([...sentenceOrder, word]);
        }
    };

    const getOptionStyle = (option) => {
        if (isExamMode) {
            return selectedAnswer === option ? [styles.option, styles.optionSelected] : styles.option;
        }

        if (!showFeedback) {
            return selectedAnswer === option ? styles.optionSelected : styles.option;
        }

        const optionStr = String(option).trim();
        const correctStr = String(currentQuestion.correct_answer).trim();
        const selectedStr = String(selectedAnswer).trim();

        if (optionStr === correctStr) {
            return [styles.option, styles.optionCorrect];
        }

        if (optionStr === selectedStr && optionStr !== correctStr) {
            return [styles.option, styles.optionWrong];
        }

        return [styles.option, styles.optionDisabled];
    };

    return (
        <View style={styles.container}>
            <View style={styles.modal}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Text style={styles.closeIcon}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>
                        {isExamMode ? 'Final Exam 🌋' : 'Quiz'}
                    </Text>
                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreText}>
                            {isExamMode ? `${currentQuestionIndex + 1}/${lessonData.quizQuestions.length}` : `🎯 ${score}`}
                        </Text>
                    </View>
                </View>

                {/* Progress Bar */}
                <View style={styles.progressBarContainer}>
                    <View style={[styles.progressBar, { width: `${progress}%`, backgroundColor: isExamMode ? '#EF4444' : '#FF9800' }]} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent}>
                    {/* Question */}
                    <View style={styles.questionContainer}>
                        <View style={styles.questionHeader}>
                            <Text style={styles.questionNumber}>
                                Question {currentQuestionIndex + 1}
                            </Text>
                            {currentQuestion.difficulty && !isExamMode && (
                                <View style={[styles.badge, styles[`badge_${currentQuestion.difficulty}`]]}>
                                    <Text style={styles.badgeText}>{currentQuestion.difficulty.toUpperCase()}</Text>
                                </View>
                            )}
                        </View>

                        {isListening ? (
                            <View style={{ alignItems: 'center', marginVertical: 20 }}>
                                <TouchableOpacity style={styles.audioButton} onPress={playQuestionAudio}>
                                    <Text style={{ fontSize: 40 }}>🔊</Text>
                                </TouchableOpacity>
                                <Text style={styles.questionText}>{currentQuestion.question}</Text>
                            </View>
                        ) : (
                            <Text style={styles.questionText}>{currentQuestion.question}</Text>
                        )}
                    </View>

                    {/* Options Area */}
                    {isSentenceOrder ? (
                        <View style={styles.sentenceOrderContainer}>
                            <View style={styles.sentenceBox}>
                                <Text style={styles.sentenceText}>
                                    {sentenceOrder.join(' ') || "Tap words to build sentence"}
                                </Text>
                            </View>
                            <View style={styles.wordsContainer}>
                                {currentQuestion.options.map((word, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={[
                                            styles.wordButton,
                                            sentenceOrder.includes(word) && styles.wordButtonSelected
                                        ]}
                                        onPress={() => toggleWord(word)}
                                        disabled={showFeedback && !isExamMode}
                                    >
                                        <Text style={[
                                            styles.wordText,
                                            sentenceOrder.includes(word) && styles.wordTextSelected
                                        ]}>{word}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            {(!showFeedback || isExamMode) && (
                                <TouchableOpacity
                                    style={[styles.checkButton, sentenceOrder.length === 0 && styles.checkButtonDisabled]}
                                    onPress={() => handleAnswer(sentenceOrder)}
                                    disabled={sentenceOrder.length === 0}
                                >
                                    <Text style={styles.checkButtonText}>
                                        {isExamMode ? 'Next' : 'Check Answer'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    ) : (
                        <View style={styles.optionsContainer}>
                            {currentQuestion.options.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={getOptionStyle(option)}
                                    onPress={() => (!showFeedback || isExamMode) && handleAnswer(option)}
                                    disabled={showFeedback && !isExamMode}
                                >
                                    <Text style={styles.optionText}>{option}</Text>
                                    {!isExamMode && showFeedback && String(option).trim() === String(currentQuestion.correct_answer).trim() && (
                                        <Text style={styles.checkmark}>✓</Text>
                                    )}
                                    {!isExamMode && showFeedback && String(option).trim() === String(selectedAnswer).trim() && String(option).trim() !== String(currentQuestion.correct_answer).trim() && (
                                        <Text style={styles.crossmark}>✕</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Feedback Section (Hidden in Exam Mode) */}
                    {showFeedback && !isExamMode && (
                        <View style={[styles.feedbackContainer, isCorrect ? styles.feedbackCorrect : styles.feedbackWrong]}>
                            <Text style={styles.feedbackTitle}>
                                {isCorrect ? '🎉 Correct!' : '❌ Incorrect'}
                            </Text>

                            {!isCorrect && (
                                <View>
                                    <Text style={styles.correctAnswerText}>
                                        Correct: {currentQuestion.correct_answer}
                                    </Text>
                                    {isSentenceOrder && (
                                        <Text style={styles.yourAnswerText}>
                                            Your Answer: {sentenceOrder.join(' ')}
                                        </Text>
                                    )}
                                </View>
                            )}

                            {currentQuestion.trap_explanation && !isCorrect && (
                                <View style={styles.trapBox}>
                                    <Text style={styles.trapTitle}>⚠️ Watch Out!</Text>
                                    <Text style={styles.trapText}>{currentQuestion.trap_explanation}</Text>
                                </View>
                            )}

                            {currentQuestion.explanation && (
                                <View style={styles.explanationBox}>
                                    <Text style={styles.explanationTitle}>💡 Explanation</Text>
                                    <Text style={styles.explanationText}>{currentQuestion.explanation}</Text>
                                </View>
                            )}

                            <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
                                <Text style={styles.nextButtonText}>
                                    {currentQuestionIndex < lessonData.quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </ScrollView>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modal: {
        backgroundColor: '#fff',
        borderRadius: 20,
        width: '95%',
        height: '90%',
        padding: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    closeIcon: { fontSize: 24, color: '#666' },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#333' },
    scoreContainer: { backgroundColor: '#f0f4f8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
    scoreText: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    progressBarContainer: { height: 4, backgroundColor: '#e0e0e0', borderRadius: 2, marginBottom: 20 },
    progressBar: { height: '100%', backgroundColor: '#FF9800', borderRadius: 2 },
    questionContainer: { marginBottom: 20 },
    questionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    questionNumber: { fontSize: 14, color: '#999' },
    badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
    badge_easy: { backgroundColor: '#E8F5E9' },
    badge_medium: { backgroundColor: '#FFF3E0' },
    badge_hard: { backgroundColor: '#FFEBEE' },
    badgeText: { fontSize: 10, fontWeight: 'bold', color: '#555' },
    questionText: { fontSize: 20, fontWeight: 'bold', color: '#333' },

    // Options
    optionsContainer: { gap: 10 },
    option: { backgroundColor: '#f0f4f8', padding: 15, borderRadius: 12, borderWidth: 2, borderColor: 'transparent', flexDirection: 'row', alignItems: 'center' },
    optionSelected: { borderColor: '#2196F3', backgroundColor: '#E3F2FD' },
    optionCorrect: { backgroundColor: '#E8F5E9', borderColor: '#4CAF50' },
    optionWrong: { backgroundColor: '#FFEBEE', borderColor: '#F44336' },
    optionDisabled: { opacity: 0.6 },
    optionText: { fontSize: 16, color: '#333', flex: 1 },
    checkmark: { fontSize: 20, color: '#4CAF50', fontWeight: 'bold' },
    crossmark: { fontSize: 20, color: '#F44336', fontWeight: 'bold' },

    // Sentence Order
    sentenceOrderContainer: { gap: 15 },
    sentenceBox: { minHeight: 60, backgroundColor: '#FAFAFA', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#EEE', justifyContent: 'center' },
    sentenceText: { fontSize: 18, color: '#333', textAlign: 'center' },
    wordsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
    wordButton: { backgroundColor: '#fff', paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', elevation: 2 },
    wordButtonSelected: { backgroundColor: '#e0e0e0', borderColor: '#ccc', elevation: 0 },
    wordText: { fontSize: 16, color: '#333' },
    wordTextSelected: { color: '#999' },
    checkButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
    checkButtonDisabled: { backgroundColor: '#B0BEC5' },
    checkButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    // Feedback
    feedbackContainer: { marginTop: 20, padding: 15, borderRadius: 12, borderWidth: 1 },
    feedbackCorrect: { backgroundColor: '#E8F5E9', borderColor: '#C8E6C9' },
    feedbackWrong: { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2' },
    feedbackTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 5, color: '#333' },
    correctAnswerText: { fontSize: 14, color: '#2E7D32', marginBottom: 5, fontWeight: 'bold' },
    yourAnswerText: { fontSize: 14, color: '#D32F2F', marginBottom: 10, fontStyle: 'italic' },
    trapBox: { backgroundColor: 'rgba(255, 255, 255, 0.6)', padding: 10, borderRadius: 8, marginBottom: 10 },
    trapTitle: { fontSize: 14, fontWeight: 'bold', color: '#D32F2F', marginBottom: 2 },
    trapText: { fontSize: 14, color: '#B71C1C' },
    explanationBox: { marginTop: 5 },
    explanationTitle: { fontSize: 14, fontWeight: 'bold', color: '#1565C0', marginBottom: 2 },
    explanationText: { fontSize: 14, color: '#0D47A1' },
    nextButton: { backgroundColor: '#333', padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 15 },
    nextButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

    errorText: { fontSize: 18, color: '#666', textAlign: 'center', marginBottom: 20 },
    closeButton: { backgroundColor: '#007AFF', padding: 15, borderRadius: 10 },
    closeButtonText: { color: '#fff', fontSize: 16, fontWeight: '600', textAlign: 'center' },

    // Audio Button
    audioButton: {
        width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE',
        justifyContent: 'center', alignItems: 'center', marginBottom: 15,
        elevation: 5
    }
});

export default QuizScreen;