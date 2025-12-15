import Tts from 'react-native-tts';

let isInitialized = false;

// Initialize TTS
const initTts = async () => {
    if (isInitialized) return;

    try {
        await Tts.getInitStatus();
        await Tts.setDefaultLanguage('de-DE'); // German
        await Tts.setDefaultRate(0.5); // Slower for learning
        await Tts.setDefaultPitch(1.0);
        isInitialized = true;
        console.log('✅ TTS Initialized successfully');
    } catch (err) {
        console.log('❌ TTS Init Error:', err);
        if (err.code === 'no_engine') {
            Tts.requestInstallEngine();
        }
    }
};

// Speak text
const speak = async (text) => {
    try {
        if (!isInitialized) {
            await initTts();
        }
        Tts.stop();
        Tts.speak(text);
    } catch (error) {
        console.warn('❌ TTS Speak Error:', error);
    }
};

const stop = () => {
    try {
        Tts.stop();
    } catch (error) {
        console.warn('❌ TTS Stop Error:', error);
    }
};

export default {
    initTts,
    speak,
    stop,
};
