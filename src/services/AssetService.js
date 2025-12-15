import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuration
const BASE_URL = 'https://germansikho.pages.dev';
const VERSION_URL = `${BASE_URL}/version.json`;
const VERSION_STORAGE_KEY = 'asset_version';
const DEFAULT_VERSION = 'v1';

/**
 * Simple Event Emitter for React Native
 * Replaces Node.js EventEmitter which is not available in RN
 */
class SimpleEventEmitter {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    removeListener(event, callback) {
        if (this.listeners[event]) {
            this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
        }
    }
}

/**
 * AssetService - Robust Version Control System for Cloudflare Assets
 * 
 * Features:
 * - Automatic version checking on app start
 * - Background fetch from Cloudflare
 * - AsyncStorage persistence
 * - Event emission for version changes
 * - Smart URL generation with text formatting
 */
class AssetService {
    constructor() {
        this.currentVersion = DEFAULT_VERSION;
        this.isInitialized = false;
        this.eventEmitter = new SimpleEventEmitter();
    }

    /**
     * Initialize the service - Call this when the app starts
     * 1. Load last known version from AsyncStorage
     * 2. Quietly fetch version.json from server
     * 3. Update if different
     */
    async init() {
        try {
            console.log('🎨 [AssetService] Initializing...');

            // Step 1: Load cached version from AsyncStorage
            const cachedVersion = await AsyncStorage.getItem(VERSION_STORAGE_KEY);
            this.currentVersion = cachedVersion || DEFAULT_VERSION;
            console.log(`📦 [AssetService] Loaded cached version: ${this.currentVersion}`);

            this.isInitialized = true;

            // Step 2: Fetch latest version from server in background
            this._checkForUpdates();

        } catch (error) {
            console.error('❌ [AssetService] Init error:', error);
            // Fallback to default version
            this.currentVersion = DEFAULT_VERSION;
            this.isInitialized = true;
        }
    }

    /**
     * Background check for version updates
     * Private method called by init()
     */
    async _checkForUpdates() {
        try {
            console.log('☁️ [AssetService] Checking for updates...');

            // Fetch version.json with timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const response = await fetch(VERSION_URL, {
                signal: controller.signal,
                cache: 'no-cache'
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            const serverVersion = data.version;

            console.log(`🆕 [AssetService] Server version: ${serverVersion}`);

            // Check if version changed
            if (serverVersion !== this.currentVersion) {
                console.log(`🔄 [AssetService] Version changed: ${this.currentVersion} → ${serverVersion}`);

                // Update in-memory version
                const oldVersion = this.currentVersion;
                this.currentVersion = serverVersion;

                // Persist to AsyncStorage
                await AsyncStorage.setItem(VERSION_STORAGE_KEY, serverVersion);

                // Emit event for any listeners (e.g., React components)
                this.eventEmitter.emit('versionChanged', {
                    oldVersion,
                    newVersion: serverVersion
                });

                console.log('✅ [AssetService] Version updated successfully');
            } else {
                console.log('✅ [AssetService] Version is up to date');
            }

        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('⚠️ [AssetService] Version check timed out');
            } else {
                console.warn('⚠️ [AssetService] Version check failed:', error.message);
            }
            // Continue using cached version
        }
    }

    /**
     * Get the full image URL for a given filename
     * Handles text formatting: trim, replace spaces with underscores
     * 
     * @param {string} filename - The German word or filename
     * @param {string} extension - File extension (default: 'jpg')
     * @returns {string} Full URL to the image
     * 
     * @example
     * getImageUrl('das Haus') → 'https://germansikho.pages.dev/v1/das_Haus.jpg'
     */
    getImageUrl(filename, extension = 'jpg') {
        // Format the filename
        const formattedName = filename
            .trim()                    // Remove leading/trailing whitespace
            .replace(/ /g, '_');       // Replace spaces with underscores

        // Construct the full URL
        const url = `${BASE_URL}/${this.currentVersion}/${formattedName}.${extension}`;

        return url;
    }

    /**
     * Get current version
     * @returns {string} Current version (e.g., 'v1', 'v2')
     */
    getCurrentVersion() {
        return this.currentVersion;
    }

    /**
     * Manually set version (for testing)
     * @param {string} version - Version to set
     */
    async setVersion(version) {
        this.currentVersion = version;
        await AsyncStorage.setItem(VERSION_STORAGE_KEY, version);
        console.log(`🔧 [AssetService] Manually set version to: ${version}`);
    }

    /**
     * Subscribe to version change events
     * @param {Function} callback - Function to call when version changes
     * @returns {Function} Unsubscribe function
     * 
     * @example
     * const unsubscribe = AssetService.onVersionChange((data) => {
     *   console.log('Version changed:', data);
     * });
     */
    onVersionChange(callback) {
        this.eventEmitter.on('versionChanged', callback);

        // Return unsubscribe function
        return () => {
            this.eventEmitter.removeListener('versionChanged', callback);
        };
    }

    /**
     * Force refresh version from server
     * Useful for manual refresh or pull-to-refresh
     */
    async refresh() {
        console.log('🔄 [AssetService] Manual refresh triggered');
        await this._checkForUpdates();
    }

    /**
     * Clear cached version (for testing/debugging)
     */
    async clearCache() {
        await AsyncStorage.removeItem(VERSION_STORAGE_KEY);
        this.currentVersion = DEFAULT_VERSION;
        console.log('🗑️ [AssetService] Cache cleared, reset to default version');
    }
}

// Export singleton instance
const assetServiceInstance = new AssetService();
export default assetServiceInstance;
