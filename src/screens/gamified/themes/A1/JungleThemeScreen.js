import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, StatusBar, TouchableOpacity, Text, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Sound from 'react-native-sound';

// ✅ Correct Imports (Going UP 4 levels to find components)
import PhaseSection from '../../../../components/gamified/PhaseSection';
import Header from '../../../../components/gamified/Header';
import CloudTransition from '../../../../components/animations/CloudTransition';
import { PHASES } from '../../../../data/learningPathData';
import progressService from '../../../../services/progressService';
import Footer from '../../../../components/gamified/Footer';
import PhaseCompleteModal from '../../../../components/gamified/PhaseCompleteModal';
import { useIsFocused } from '@react-navigation/native';
import { useProgress } from '../../../../context/ProgressContext';
import { getLessonProgress, isTileComplete, getTileStars, calculateStars } from '../../../../services/GrammarService';

const JungleThemeScreen = ({ navigation }) => {
    console.log('🌴 JungleThemeScreen: Mounted');
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [completedNodes, setCompletedNodes] = useState([]);
    const [showCompleteModal, setShowCompleteModal] = useState(false);
    const [rewardAmount, setRewardAmount] = useState(0);
    const musicRef = useRef(null);
    const isFocused = useIsFocused();
    const { updateProgress } = useProgress();

    const currentPhase = PHASES[currentPhaseIndex];
    const isLastPhase = currentPhaseIndex === PHASES.length - 1;

    // Check for Phase Completion
    useEffect(() => {
        if (isFocused && completedNodes.length > 0) {
            checkPhaseCompletion();
        }
    }, [isFocused, completedNodes]);

    const checkPhaseCompletion = async () => {
        // 1. Get all node IDs for current phase
        const phaseNodeIds = currentPhase.nodes.map(n => n.id);

        // 2. Check if all are in completedNodes
        const allCompleted = phaseNodeIds.every(id => completedNodes.includes(id));

        if (allCompleted) {
            // 3. Try to award coins (unique reason ID prevents double reward)
            const reasonId = `phase_complete_${currentPhase.id}`;
            const reward = 100; // 100 Coins for finishing a phase!

            const newBalance = await progressService.awardCoins(reward, reasonId);

            if (newBalance !== null) {
                // Coins were awarded (meaning not previously claimed)
                setRewardAmount(reward);
                setShowCompleteModal(true);
                // Play success sound if you have one
            }
        }
    };

    // ... (Your Sound Logic Here) ...
    useFocusEffect(
        useCallback(() => {
            // 1. Load Progress
            const loadProgress = async () => {
                // Update global context for Header (Coins/Vocab)
                await updateProgress();

                // 1. Get Grammar Progress (for Tiles)
                const grammarProgress = await getLessonProgress();
                const completedTileIds = [];

                // 2. Get General Progress (for Chests/Modules)
                const progress = await progressService.getProgress();
                let completedModuleIds = [];
                if (progress && progress.completedModules) {
                    completedModuleIds = progress.completedModules;
                }

                // Check each node in the current phase
                currentPhase.nodes.forEach(node => {
                    if (node.type === 'level') {
                        if (isTileComplete(node.id, grammarProgress)) {
                            completedTileIds.push(node.id);
                        }
                        // Update stars
                        node.stars = getTileStars(node.id, grammarProgress);
                    } else if (node.type === 'treasure') {
                        // Check if treasure is completed (module ID matches node ID)
                        // And calculate stars from quizScores if available
                        if (progress && progress.quizScores && progress.quizScores[node.id]) {
                            const scoreData = progress.quizScores[node.id];
                            node.stars = calculateStars(scoreData.score, scoreData.total);
                        }
                    }
                });

                // 3. Merge and Set
                setCompletedNodes([...new Set([...completedTileIds, ...completedModuleIds])]);
            };
            loadProgress();

            // 2. Play Sound
            Sound.setCategory('Playback', true);

            // Handle Android raw resource name (no extension)
            const soundFile = Platform.OS === 'android' ? 'jungle_background_sound' : 'jungle_background_sound.mp3';

            const music = new Sound(soundFile, Sound.MAIN_BUNDLE, (error) => {
                if (error) {
                    console.log('Failed to load jungle sound', error);
                    return;
                }
                musicRef.current = music;
                music.setVolume(0.5); // Lower volume for background music
                music.setNumberOfLoops(-1);
                music.play();
            });

            return () => {
                // Fix: Capture the current value in a local variable
                const sound = musicRef.current;
                if (sound) {
                    sound.stop(() => sound.release());
                }
                musicRef.current = null;
            };
        }, [])
    );

    const handleNodePress = (node) => {
        if (['articles', 'nouns', 'pronouns', 'basic_verbs', 'sentence_structure'].includes(node.id)) {
            navigation.navigate('GrammarListScreen', {
                tileId: node.id,
                title: node.title,
                themeId: 'jungle'
            });
        } else if (node.id === 'chest_river') {
            navigation.navigate('VocabularyLesson', {
                lessonId: node.id,
                category: 'family_members',
                backgroundImage: require('../../../../assets/icons/forest_background.png'),
                themeId: 'jungle'
            });
        } else if (node.id === 'chest_tree') {
            navigation.navigate('VocabularyLesson', {
                lessonId: node.id,
                category: 'easy_verbs',
                backgroundImage: require('../../../../assets/icons/forest_background.png'),
                themeId: 'jungle'
            });
        }
    };

    const handleNextPhase = () => {
        if (isLastPhase) return;
        setIsTransitioning(true);
    };

    const handleTransitionComplete = () => {
        setCurrentPhaseIndex(prev => prev + 1);
        setIsTransitioning(false);
    };

    return (
        <View style={styles.container}>
            <StatusBar hidden={true} translucent={true} backgroundColor="transparent" />
            <Header
                showBack={false}
            />
            <CloudTransition
                visible={isTransitioning}
                onAnimationComplete={handleTransitionComplete}
            />
            <View style={styles.mapContainer}>
                <PhaseSection
                    phase={currentPhase}
                    onNodePress={handleNodePress}
                    completedNodes={completedNodes}
                />
            </View>

            {/* Footer added here */}
            <Footer onVocabularyPress={() => navigation.navigate('VocabPlayground')} />

            <PhaseCompleteModal
                visible={showCompleteModal}
                rewardAmount={rewardAmount}
                onClose={() => setShowCompleteModal(false)}
            />

        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#87CEEB' },
    mapContainer: { flex: 1 },
    footerOverlay: { position: 'absolute', bottom: 30, left: 0, right: 0, alignItems: 'center', zIndex: 200 },
    nextButton: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 30, borderWidth: 3, borderColor: '#87CEEB', elevation: 5 },
    nextButtonText: { fontSize: 18, fontWeight: 'bold', color: '#0E8AC9' },
});

export default JungleThemeScreen;
