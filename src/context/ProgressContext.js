import React, { createContext, useState, useEffect, useContext } from 'react';
import progressService from '../services/progressService';
import UserStateService from '../services/UserStateService';

// Define thresholds here or import from config
const A1_TOTAL_NODES = 30;

const ProgressContext = createContext();

export const ProgressProvider = ({ children }) => {
    const [progressPercent, setProgressPercent] = useState(0);
    const [currentLevel, setCurrentLevel] = useState('A1');
    const [completedCount, setCompletedCount] = useState(0);
    const [coins, setCoins] = useState(0);
    const [learnedVocabCount, setLearnedVocabCount] = useState(0);

    const updateProgress = async () => {
        try {
            const progress = await progressService.getProgress();
            const completedModules = progress?.completedModules || [];

            // Count unique completed modules
            const uniqueCompleted = [...new Set(completedModules)].length;
            setCompletedCount(uniqueCompleted);

            // Calculate percentage (0 to 1)
            // Cap at 1 (100%)
            const percent = Math.min(uniqueCompleted / A1_TOTAL_NODES, 1);
            setProgressPercent(percent);

            // Determine Level
            if (percent >= 1) {
                setCurrentLevel('A2');
            } else {
                setCurrentLevel('A1');
            }

            // Get Coins from UserStateService (real-time source of truth)
            await UserStateService.init(); // Ensure initialized
            const currentCoins = UserStateService.getCoins();
            setCoins(currentCoins);

            // Get Learned Vocab Count from UserStateService (matches cloud sync)
            const learnedWords = UserStateService.getLearnedWords();
            setLearnedVocabCount(learnedWords.length);
            console.log('📊 [ProgressContext] Updated vocab count:', learnedWords.length);

        } catch (error) {
            console.error("Failed to update progress:", error);
        }
    };

    useEffect(() => {
        updateProgress();
    }, []);

    return (
        <ProgressContext.Provider value={{
            progressPercent,
            currentLevel,
            completedCount,
            coins,
            learnedVocabCount,
            updateProgress
        }}>
            {children}
        </ProgressContext.Provider>
    );
};

export const useProgress = () => useContext(ProgressContext);
