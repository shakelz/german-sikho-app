import AsyncStorage from '@react-native-async-storage/async-storage';
import { Client, Databases, ID } from 'appwrite';

// Appwrite Configuration
const APPWRITE_ENDPOINT = 'https://fra.cloud.appwrite.io/v1';
const APPWRITE_PROJECT_ID = '692c8c1f002809245709';
const APPWRITE_DATABASE_ID = '6939c855002a66284b09';
const APPWRITE_COLLECTION_ID = 'userprogress';

// AsyncStorage Key
const LOCAL_PROGRESS_KEY = 'user_progress';

class AppwriteProgressService {
    /**
     * Initialize Appwrite Client and Databases
     * @returns {Object} { client, databases }
     */
    static initializeAppwrite() {
        const client = new Client();
        client
            .setEndpoint(APPWRITE_ENDPOINT)
            .setProject(APPWRITE_PROJECT_ID);

        const databases = new Databases(client);

        return { client, databases };
    }

    /**
     * Save progress data (Offline-First)
     * Step 1: Save to local AsyncStorage immediately
     * Step 2: Sync to Appwrite cloud
     * 
     * @param {string} userId - The user's ID
     * @param {Object} progressData - The progress data to save
     * @returns {Promise<Object>} Result with local and cloud status
     */
    static async saveProgress(userId, progressData) {
        try {
            // STEP 1: Save to local storage immediately (Offline-First)
            console.log('📱 [AppwriteProgressService] Saving to local storage...');
            await AsyncStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(progressData));
            console.log('✅ [AppwriteProgressService] Local save successful');

            // STEP 2: Sync to cloud (if online)
            try {
                console.log('☁️ [AppwriteProgressService] Syncing to Appwrite cloud...');
                const { databases } = this.initializeAppwrite();

                // Prepare payload
                const payload = {
                    userId: userId, // Required attribute in Appwrite schema
                    progressJson: JSON.stringify(progressData),
                    lastUpdated: new Date().toISOString()
                };

                // 🔍 VERIFICATION LOG - Print exact JSON payload
                console.log('📦 [AppwriteProgressService] Payload being sent to cloud:');
                console.log(JSON.stringify(progressData, null, 2));

                try {
                    // Try to update existing document
                    await databases.updateDocument(
                        APPWRITE_DATABASE_ID,
                        APPWRITE_COLLECTION_ID,
                        userId, // Use userId as document ID
                        payload
                    );
                    console.log('✅ [AppwriteProgressService] Cloud sync successful (updated)');

                    return {
                        success: true,
                        local: true,
                        cloud: true,
                        operation: 'update'
                    };
                } catch (updateError) {
                    // If document doesn't exist (404), create it
                    if (updateError.code === 404 || updateError.type === 'document_not_found') {
                        console.log('📄 [AppwriteProgressService] Document not found, creating new...');

                        await databases.createDocument(
                            APPWRITE_DATABASE_ID,
                            APPWRITE_COLLECTION_ID,
                            userId, // Explicitly use userId as document ID
                            payload
                        );
                        console.log('✅ [AppwriteProgressService] Cloud sync successful (created)');

                        return {
                            success: true,
                            local: true,
                            cloud: true,
                            operation: 'create'
                        };
                    } else {
                        throw updateError;
                    }
                }
            } catch (cloudError) {
                // Cloud sync failed, but local save succeeded
                console.error('❌ [AppwriteProgressService] Cloud sync failed:', cloudError);

                return {
                    success: true,
                    local: true,
                    cloud: false,
                    error: cloudError.message,
                    note: 'Data saved locally. Will sync when online.'
                };
            }
        } catch (localError) {
            // Local save failed (critical error)
            console.error('❌ [AppwriteProgressService] Local save failed:', localError);

            return {
                success: false,
                local: false,
                cloud: false,
                error: localError.message
            };
        }
    }

    /**
     * Sync progress on login
     * Fetches data from cloud and merges with local data
     * 
     * @param {string} userId - The user's ID
     * @returns {Promise<Object>} Merged progress data
     */
    static async syncOnLogin(userId) {
        try {
            console.log('🔄 [AppwriteProgressService] Syncing on login for user:', userId);

            // Validate userId
            if (!userId) {
                throw new Error('userId is required for syncing progress');
            }

            const { databases } = this.initializeAppwrite();

            try {
                // Fetch from cloud
                console.log('☁️ [AppwriteProgressService] Fetching from cloud...');
                const document = await databases.getDocument(
                    APPWRITE_DATABASE_ID,
                    APPWRITE_COLLECTION_ID,
                    userId
                );

                // Parse cloud data
                const cloudProgress = JSON.parse(document.progressJson);
                console.log('✅ [AppwriteProgressService] Cloud data fetched successfully');
                console.log('📊 CLOUD DATA:', JSON.stringify(cloudProgress, null, 2));

                // Get local data
                const localData = await this.getLocalProgress();
                console.log('📱 [AppwriteProgressService] Local data fetched');
                console.log('📊 LOCAL DATA:', JSON.stringify(localData, null, 2));

                // Merge logic: Cloud data takes precedence for most fields
                // But we can merge arrays (like completedModules) to avoid data loss
                const mergedProgress = {
                    ...localData,
                    ...cloudProgress,
                    // Merge completed modules (unique values)
                    completedModules: [
                        ...new Set([
                            ...(localData.completedModules || []),
                            ...(cloudProgress.completedModules || [])
                        ])
                    ],
                    // Keep the higher score
                    totalScore: Math.max(
                        localData.totalScore || 0,
                        cloudProgress.totalScore || 0
                    ),
                    // Keep the higher level
                    level: Math.max(
                        localData.level || 1,
                        cloudProgress.level || 1
                    )
                };

                console.log('🔀 MERGED DATA:', JSON.stringify(mergedProgress, null, 2));

                // Save merged data back to local storage
                await AsyncStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(mergedProgress));
                console.log('✅ [AppwriteProgressService] Data merged and saved locally to key:', LOCAL_PROGRESS_KEY);

                return {
                    success: true,
                    data: mergedProgress,
                    source: 'merged'
                };
            } catch (cloudError) {
                // Cloud fetch failed, use local data
                console.warn('⚠️ [AppwriteProgressService] Cloud fetch failed, using local data:', cloudError.message);

                const localData = await this.getLocalProgress();

                return {
                    success: true,
                    data: localData,
                    source: 'local',
                    note: 'Using local data. Could not sync from cloud.'
                };
            }
        } catch (error) {
            console.error('❌ [AppwriteProgressService] Sync on login failed:', error);

            return {
                success: false,
                data: null,
                error: error.message
            };
        }
    }

    /**
     * Get local progress data from AsyncStorage
     * 
     * @returns {Promise<Object>} Local progress data
     */
    static async getLocalProgress() {
        try {
            const data = await AsyncStorage.getItem(LOCAL_PROGRESS_KEY);

            if (data) {
                return JSON.parse(data);
            } else {
                // Return default progress structure
                console.log('ℹ️ [AppwriteProgressService] No local data found, returning default');
                return {
                    completedModules: [],
                    totalScore: 0,
                    level: 1,
                    achievements: [],
                    coins: 0
                };
            }
        } catch (error) {
            console.error('❌ [AppwriteProgressService] Get local progress failed:', error);

            // Return default on error
            return {
                completedModules: [],
                totalScore: 0,
                level: 1,
                achievements: [],
                coins: 0
            };
        }
    }

    /**
     * Clear all progress data (for testing or logout)
     */
    static async clearProgress() {
        try {
            await AsyncStorage.removeItem(LOCAL_PROGRESS_KEY);
            console.log('✅ [AppwriteProgressService] Progress cleared');
            return { success: true };
        } catch (error) {
            console.error('❌ [AppwriteProgressService] Clear progress failed:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Merge local and cloud data intelligently
     * Coins and stars are additive, arrays are merged, scores take max values
     * 
     * @param {Object} localData - Local user data
     * @param {Object} cloudData - Cloud user data
     * @returns {Object} Merged data
     */
    static mergeData(localData, cloudData) {
        // Handle stats merging (additive for coins/stars)
        const mergedStats = {
            coins: (localData.stats?.coins || 0) + (cloudData.stats?.coins || 0),
            stars: (localData.stats?.stars || 0) + (cloudData.stats?.stars || 0),
            learnedWords: [
                ...new Set([
                    ...(localData.stats?.learnedWords || []),
                    ...(cloudData.stats?.learnedWords || [])
                ])
            ]
        };

        // Handle progress merging
        const mergedProgress = {
            ...(localData.progress || {}),
            ...(cloudData.progress || {}),
            completedModules: [
                ...new Set([
                    ...(localData.progress?.completedModules || []),
                    ...(cloudData.progress?.completedModules || [])
                ])
            ],
            totalScore: Math.max(
                localData.progress?.totalScore || 0,
                cloudData.progress?.totalScore || 0
            ),
            level: Math.max(
                localData.progress?.level || 1,
                cloudData.progress?.level || 1
            )
        };

        console.log('🔀 [AppwriteProgressService] Data merged successfully');
        console.log(`   Coins: ${localData.stats?.coins || 0} + ${cloudData.stats?.coins || 0} = ${mergedStats.coins}`);
        console.log(`   Stars: ${localData.stats?.stars || 0} + ${cloudData.stats?.stars || 0} = ${mergedStats.stars}`);
        console.log(`   Learned Words: ${mergedStats.learnedWords.length}`);

        return {
            stats: mergedStats,
            progress: mergedProgress
        };
    }
}

export default AppwriteProgressService;
