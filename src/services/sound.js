import Sound from 'react-native-sound';
import { Platform } from 'react-native';

// Enable playback in silence mode
Sound.setCategory('Playback');

const sounds = {
    correct: null,
    incorrect: null,
    finished: null,
};

const loadSound = (filename) => {
    return new Promise((resolve, reject) => {
        // On Android, raw resources shouldn't have extension
        // On iOS, they usually do (or it doesn't matter as much if in bundle)
        // Let's try to be smart or just use the name without extension if it works for both, 
        // but usually iOS needs extension if it's a file.
        // However, if we use the same file for both, we might need platform check.

        // For now, let's trust the file structure and the comment.
        // If files are in 'raw', 'correct' should work on Android.
        // For iOS, if they are in bundle, 'correct.mp3' is needed.

        const name = Platform.OS === 'android' ? filename.replace('.mp3', '') : filename;

        const sound = new Sound(name, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log(`Failed to load sound ${name}`, error);
                resolve(null);
            } else {
                console.log(`Sound ${name} loaded successfully`);
                resolve(sound);
            }
        });
    });
};

const initSounds = async () => {
    if (!sounds.correct) sounds.correct = await loadSound('correct.mp3');
    if (!sounds.incorrect) sounds.incorrect = await loadSound('incorrect.mp3');
    if (!sounds.finished) sounds.finished = await loadSound('finished.mp3');
};

// Initialize on load
initSounds();

const playSound = (soundKey) => {
    const sound = sounds[soundKey];
    if (!sound) {
        console.log(`${soundKey} sound not loaded, trying to load...`);
        // Try to load and play? Async issue. 
        // For now just log.
        initSounds();
        return;
    }

    sound.stop(() => {
        sound.setVolume(1.0);
        sound.play((success) => {
            if (success) {
                console.log(`${soundKey} played successfully`);
            } else {
                console.log(`${soundKey} playback failed`);
                sound.reset();
            }
        });
    });
};

export default {
    playCorrect: () => playSound('correct'),
    playWrong: () => playSound('incorrect'),
    playFinish: () => playSound('finished'),
};

