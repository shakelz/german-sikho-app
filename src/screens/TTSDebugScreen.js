
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';
import Tts from 'react-native-tts';

const TTSDebugScreen = () => {
    const [logs, setLogs] = useState([]);
    const [status, setStatus] = useState('initializing');
    const [voices, setVoices] = useState([]);

    const addLog = (msg) => {
        setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
        console.log(`[TTS Debug] ${msg}`);
    };

    useEffect(() => {
        const initTts = async () => {
            try {
                addLog('Starting TTS initialization...');

                // Add listeners
                Tts.addEventListener('tts-start', (event) => addLog(`tts-start: ${JSON.stringify(event)}`));
                Tts.addEventListener('tts-finish', (event) => addLog(`tts-finish: ${JSON.stringify(event)}`));
                Tts.addEventListener('tts-cancel', (event) => addLog(`tts-cancel: ${JSON.stringify(event)}`));

                const initStatus = await Tts.getInitStatus();
                addLog(`Init Status: ${initStatus}`);
                setStatus('ready');

                Tts.setDefaultLanguage('de-DE');
                addLog('Set default language to de-DE');

                const availableVoices = await Tts.voices();
                setVoices(availableVoices);
                addLog(`Found ${availableVoices.length} voices`);

                // Check for German voices
                const germanVoices = availableVoices.filter(v => v.language.includes('de'));
                addLog(`German voices found: ${germanVoices.length}`);
                if (germanVoices.length > 0) {
                    addLog(`First German voice: ${germanVoices[0].id}`);
                }

            } catch (err) {
                addLog(`Init Error: ${err.code} - ${err.message}`);
                setStatus('error');
            }
        };

        initTts();

        return () => {
            Tts.stop();
        };
    }, []);

    const speak = async () => {
        try {
            addLog('Speaking: "Hallo, wie geht es dir?"');
            Tts.speak('Hallo, wie geht es dir?');
        } catch (err) {
            addLog(`Speak Error: ${err}`);
        }
    };

    const speakEnglish = async () => {
        try {
            addLog('Speaking English: "Hello testing 1 2 3"');
            Tts.setDefaultLanguage('en-US');
            Tts.speak('Hello testing 1 2 3');
            // Switch back to German for next test
            setTimeout(() => Tts.setDefaultLanguage('de-DE'), 2000);
        } catch (err) {
            addLog(`Speak Error: ${err}`);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>TTS Debugger</Text>
            <Text style={styles.status}>Status: {status}</Text>

            <View style={styles.buttonContainer}>
                <Button title="Speak German (Hallo)" onPress={speak} />
                <View style={{ height: 10 }} />
                <Button title="Speak English (Test)" onPress={speakEnglish} />
                <View style={{ height: 10 }} />
                <Button title="List Voices to Console" onPress={() => {
                    console.log(voices);
                    addLog('Voices logged to console');
                }} />
            </View>

            <Text style={styles.subtitle}>Logs:</Text>
            <ScrollView style={styles.logContainer}>
                {logs.map((log, index) => (
                    <Text key={index} style={styles.logText}>{log}</Text>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
        color: '#333',
    },
    status: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
        color: '#666',
    },
    buttonContainer: {
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    logContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 10,
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    logText: {
        fontSize: 12,
        marginBottom: 5,
        fontFamily: 'monospace',
        color: '#333',
    },
});

export default TTSDebugScreen;
