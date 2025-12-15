import storage from './storage';

// Progress data structure
const PROGRESS_KEY = 'user_progress';

// Initialize default progress
const defaultProgress = {
    completedModules: [],
    quizScores: {},
    totalScore: 0,
    level: 'A1',
    achievements: [],
    coins: 0,
    rewardsClaimed: [],
};

// Load user progress
const loadProgress = async () => {
    try {
        const localProgress = await storage.load(PROGRESS_KEY);
        return localProgress || defaultProgress;
    } catch (error) {
        console.error('Error loading progress:', error);
        return defaultProgress;
    }
};

// Save user progress
const saveProgress = async (progress) => {
    try {
        await storage.save(PROGRESS_KEY, progress);
        return true;
    } catch (error) {
        console.error('Error saving progress:', error);
        return false;
    }
};

// Mark a module as complete
const markModuleComplete = async (moduleId) => {
    try {
        const progress = await loadProgress();

        // Ensure completedModules exists
        if (!progress.completedModules) {
            progress.completedModules = [];
        }

        if (!progress.completedModules.includes(moduleId)) {
            progress.completedModules.push(moduleId);
            await saveProgress(progress);
        }
        return progress;
    } catch (error) {
        console.error('Error marking module complete:', error);
        return null;
    }
};

// Save quiz score
const saveQuizScore = async (moduleId, score, total) => {
    try {
        const progress = await loadProgress();

        // Ensure quizScores and achievements exist
        if (!progress.quizScores) {
            progress.quizScores = {};
        }
        if (!progress.achievements) {
            progress.achievements = [];
        }
        if (!progress.completedModules) {
            progress.completedModules = [];
        }

        progress.quizScores[moduleId] = {
            score,
            total,
            date: Date.now(),
        };

        // Update total score
        progress.totalScore = Object.values(progress.quizScores).reduce(
            (sum, quiz) => sum + quiz.score,
            0
        );

        // Check for achievements
        if (score === total) {
            if (!progress.achievements.includes('perfect_quiz')) {
                progress.achievements.push('perfect_quiz');
            }
        }

        if (progress.completedModules.length === 1 && !progress.achievements.includes('first_lesson')) {
            progress.achievements.push('first_lesson');
        }

        await saveProgress(progress);
        return progress;
    } catch (error) {
        console.error('Error saving quiz score:', error);
        return null;
    }
};

// Award coins to the user
const awardCoins = async (amount, reasonId) => {
    try {
        const progress = await loadProgress();

        // Check if reward already claimed for this reason
        if (reasonId && progress.rewardsClaimed && progress.rewardsClaimed.includes(reasonId)) {
            console.log(`⚠️ Reward '${reasonId}' already claimed.`);
            return null; // Already claimed
        }

        // Add coins
        progress.coins = (progress.coins || 0) + amount;

        // Mark as claimed
        if (reasonId) {
            if (!progress.rewardsClaimed) progress.rewardsClaimed = [];
            progress.rewardsClaimed.push(reasonId);
        }

        await saveProgress(progress);
        console.log(`💰 Awarded ${amount} coins! New Balance: ${progress.coins}`);
        return progress.coins;
    } catch (error) {
        console.error('Error awarding coins:', error);
        return null;
    }
};

// Get module status (locked, unlocked, completed)
const getModuleStatus = (moduleId, progress) => {
    if (!progress || !progress.completedModules) return 'locked';

    // Check if completed
    if (progress.completedModules.includes(moduleId)) {
        return 'completed';
    }

    // Simple unlock logic: Phase 1 modules are always unlocked
    if (moduleId.startsWith('p1-')) {
        return 'unlocked';
    }

    // For other phases, check if previous phase is completed
    const [phase, module] = moduleId.split('-');
    const phaseNum = parseInt(phase.substring(1));

    if (phaseNum === 1) return 'unlocked';

    // Check if all modules from previous phase are completed
    const prevPhase = `p${phaseNum - 1}`;
    const prevPhaseModules = progress.completedModules.filter(id => id.startsWith(prevPhase));

    // Assume 5 modules per phase (this could be dynamic based on learningPath data)
    if (prevPhaseModules.length >= 3) {
        return 'unlocked';
    }

    return 'locked';
};

// Get overall progress percentage
const getOverallProgress = (progress) => {
    if (!progress || !progress.completedModules) return 0;

    // Total modules across all phases (adjust based on your learningPath)
    const totalModules = 30; // Approximate
    const completed = progress.completedModules.length;

    return Math.round((completed / totalModules) * 100);
};

// Reset progress (for testing)
const resetProgress = async () => {
    try {
        await storage.remove(PROGRESS_KEY);
        return defaultProgress;
    } catch (error) {
        console.error('Error resetting progress:', error);
        return null;
    }
};

// Get progress (alias for compatibility)
const getProgress = async () => {
    return await loadProgress();
};

export default {
    loadProgress,
    saveProgress,
    markModuleComplete,
    saveQuizScore,
    getModuleStatus,
    getOverallProgress,
    resetProgress,
    getProgress,
    awardCoins,
};
