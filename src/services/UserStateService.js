import AsyncStorage from '@react-native-async-storage/async-storage';
import AppwriteProgressService from './AppwriteProgressService';
import { getAuth } from '@react-native-firebase/auth';

// Storage Keys
const USER_STATE_KEY = 'user_state';

/**
 * UserStateService - Central State Manager for User Stats
 * 
 * Manages:
 * - Coins (Integer)
 * - Lesson Progress (Object with lesson-specific stars 0-3)
 * - Learned Words (Array of IDs)
 * 
 * Automatically syncs to Appwrite on every change
 */
class UserStateService {
    constructor() {
        this.state = {
            coins: 0,
            lessonProgress: {}, // { lessonId: { stars: 0-3, completed: true/false } }
            learnedWords: [] // Array of word IDs
        };
        this.isInitialized = false;
    }

    /**
     * Initialize the service - Load from AsyncStorage
     */
    async init() {
        try {
            console.log('🔄 [UserStateService] Initializing...');
            const savedState = await AsyncStorage.getItem(USER_STATE_KEY);
            if (savedState) {
                this.state = JSON.parse(savedState);
                console.log('📊 [UserStateService] State loaded from AsyncStorage:');
                console.log('   - Coins:', this.state.coins);
                console.log('   - Lesson Progress:', Object.keys(this.state.lessonProgress || {}).length, 'lessons');
                console.log('   - Learned Words:', (this.state.learnedWords || []).length, 'words');
                console.log('📊 FULL STATE:', JSON.stringify(this.state, null, 2));
            } else {
                console.log('📊 [UserStateService] No saved state, using defaults');
                console.log('📊 DEFAULT STATE:', JSON.stringify(this.state, null, 2));
            }
            this.isInitialized = true;
        } catch (error) {
            console.error('❌ [UserStateService] Init error:', error);
            this.isInitialized = true;
        }
    }

    /**
     * Save state to AsyncStorage and sync to cloud
     * @private
     */
    async _saveAndSync() {
        try {
            // Save locally
            await AsyncStorage.setItem(USER_STATE_KEY, JSON.stringify(this.state));
            console.log('💾 [UserStateService] State saved locally');

            // Sync to cloud in background
            const user = getAuth().currentUser;
            if (user) {
                // Get progress data from old progressService for compatibility
                const progressService = require('./progressService').default;
                const progress = await progressService.loadProgress();

                // Get vocabulary SRS data
                const srsDataJson = await AsyncStorage.getItem('srs_progress_data');
                const srsData = srsDataJson ? JSON.parse(srsDataJson) : {};

                // Create FLAT structure (not nested!) with all user data
                const completeData = {
                    // User stats from UserStateService
                    coins: this.state.coins,
                    lessonProgress: this.state.lessonProgress,
                    learnedWords: this.state.learnedWords,
                    // Progress data from progressService
                    completedModules: progress.completedModules || [],
                    totalScore: progress.totalScore || 0,
                    level: progress.level || 1,
                    achievements: progress.achievements || [],
                    // Vocabulary SRS data
                    vocabularySRS: srsData
                };

                console.log('☁️ [UserStateService] Syncing complete profile to cloud...');
                console.log('📦 Cloud payload structure:', JSON.stringify(completeData, null, 2));
                await AppwriteProgressService.saveProgress(user.uid, completeData);
            }
        } catch (error) {
            console.error('❌ [UserStateService] Save failed:', error);
        }
    }

    /**
     * Add coins to user's balance
     * @param {number} amount - Amount of coins to add
     */
    async addCoins(amount) {
        if (!this.isInitialized) await this.init();

        this.state.coins += amount;
        console.log(`💰 [UserStateService] Added ${amount} coins. New balance: ${this.state.coins}`);

        await this._saveAndSync();
    }

    /**
     * Save lesson progress with star calculation and high-score logic
     * @param {string} lessonId - ID of the lesson (e.g., 'grammar_articles')
     * @param {number} scorePercentage - Score percentage (0-100)
     * @returns {Object} { stars, isNewHighScore }
     */
    async saveLessonProgress(lessonId, scorePercentage) {
        if (!this.isInitialized) await this.init();

        // Calculate stars based on percentage
        let stars = 0;
        if (scorePercentage >= 100) stars = 3;
        else if (scorePercentage >= 80) stars = 2;
        else if (scorePercentage >= 60) stars = 1;
        else stars = 0; // Failed

        // Get existing progress for this lesson
        const existingProgress = this.state.lessonProgress[lessonId];
        const oldStars = existingProgress?.stars || 0;

        // High-score logic: Only update if new stars are higher
        if (stars > oldStars) {
            this.state.lessonProgress[lessonId] = {
                stars: stars,
                completed: stars > 0 // Only mark completed if at least 1 star
            };

            console.log(`⭐ [UserStateService] New high score for ${lessonId}! ${oldStars} → ${stars} stars`);
            await this._saveAndSync();

            return { stars, isNewHighScore: true };
        } else {
            console.log(`📊 [UserStateService] ${lessonId}: ${stars} stars (not better than ${oldStars})`);
            return { stars, isNewHighScore: false };
        }
    }

    /**
     * Get total stars across all lessons
     * @returns {number}
     */
    getTotalStars() {
        if (!this.isInitialized || !this.state.lessonProgress) return 0;

        return Object.values(this.state.lessonProgress).reduce((total, lesson) => {
            return total + (lesson.stars || 0);
        }, 0);
    }

    /**
     * Mark a word as learned
     * @param {string} wordId - ID of the word (e.g., German word)
     */
    async markWordAsLearned(wordId) {
        if (!this.isInitialized) await this.init();

        // Add to set (avoid duplicates)
        if (!this.state.learnedWords.includes(wordId)) {
            this.state.learnedWords.push(wordId);
            console.log(`📚 [UserStateService] Word learned: ${wordId}. Total: ${this.state.learnedWords.length}`);

            await this._saveAndSync();
        }
    }

    /**
     * Get current coins balance
     * @returns {number}
     */
    getCoins() {
        return this.state.coins;
    }

    /**
     * Get lesson progress for a specific lesson
     * @param {string} lessonId
     * @returns {Object|null} { stars, completed }
     */
    getLessonProgress(lessonId) {
        return this.state.lessonProgress[lessonId] || null;
    }

    /**
     * Get all lesson progress
     * @returns {Object}
     */
    getAllLessonProgress() {
        return { ...this.state.lessonProgress };
    }

    /**
     * Get array of learned word IDs
     * @returns {Array<string>}
     */
    getLearnedWords() {
        return this.state.learnedWords;
    }

    /**
     * Get complete state
     * @returns {Object}
     */
    getState() {
        return { ...this.state };
    }

    /**
     * Set complete state (for sync on login)
     * @param {Object} newState
     */
    async setState(newState) {
        this.state = {
            coins: newState.coins || 0,
            lessonProgress: newState.lessonProgress || {},
            learnedWords: newState.learnedWords || []
        };
        await AsyncStorage.setItem(USER_STATE_KEY, JSON.stringify(this.state));
        console.log('✅ [UserStateService] State updated:', this.state);
    }

    /**
     * Clear all state (for logout/testing)
     */
    async clearState() {
        this.state = {
            coins: 0,
            lessonProgress: {},
            learnedWords: []
        };
        await AsyncStorage.removeItem(USER_STATE_KEY);
        console.log('🗑️ [UserStateService] State cleared');
    }
}

// Export singleton instance
const userStateServiceInstance = new UserStateService();
export default userStateServiceInstance;
