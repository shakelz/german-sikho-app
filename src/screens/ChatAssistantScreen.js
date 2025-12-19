import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    Image,
    ImageBackground,
    StatusBar,
    Animated,
    Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { Client, Functions } from 'appwrite';
import AsyncStorage from '@react-native-async-storage/async-storage';

// --- CONFIG ---
const client = new Client()
    .setEndpoint('https://fra.cloud.appwrite.io/v1')
    .setProject('692c8c1f002809245709'); // Your Project ID
const functions = new Functions(client);

// --- ASSETS ---
const homeBg = require('../assets/icons/home_bg.jpg');
const BOT_AVATAR = require('../../assets/chatBotIcon.png');

// --- STORAGE KEY ---
const CHAT_STORAGE_KEY = 'professor_bar_chat_history';

const ChatAssistantScreen = ({ navigation }) => {
    // Default welcome message
    const defaultWelcome = {
        id: '1',
        text: 'Willkommen! 🐻 I am Professor Bär, your German tutor. Ready to master some vocabulary?',
        isBot: true,
        timestamp: new Date(),
    };

    const [messages, setMessages] = useState([defaultWelcome]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const [isHistoryLoaded, setIsHistoryLoaded] = useState(false);
    const flatListRef = useRef(null);
    const inputRef = useRef(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // ==================== PERSISTENCE: LOAD ON STARTUP ====================
    useEffect(() => {
        const loadChatHistory = async () => {
            try {
                const saved = await AsyncStorage.getItem(CHAT_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed && parsed.length > 0) {
                        // Convert timestamp strings back to Date objects for display
                        const restored = parsed.map(msg => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp)
                        }));
                        setMessages(restored);
                        console.log('📂 Loaded', restored.length, 'messages from storage');
                    }
                }
            } catch (error) {
                console.error('Failed to load chat history:', error);
            } finally {
                setIsHistoryLoaded(true);
            }
        };
        loadChatHistory();
    }, []);

    // ==================== PERSISTENCE: SAVE HELPER ====================
    const saveChatHistory = useCallback(async (messageList) => {
        try {
            // Save timestamps as ISO strings for proper JSON serialization
            const toSave = messageList.map(msg => ({
                ...msg,
                timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
            }));
            await AsyncStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(toSave));
            console.log('💾 Saved', toSave.length, 'messages to storage');
        } catch (error) {
            console.error('Failed to save chat history:', error);
        }
    }, []);

    // Handle keyboard show/hide for Android
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                setKeyboardHeight(e.endCoordinates.height);
                setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                setKeyboardHeight(0);
            }
        );

        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, []);

    // Fade in effect on mount
    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // --- MAIN SEND FUNCTION (Context Aware + Persistent) ---
    const sendMessage = async () => {
        // 1. Validation
        if (!inputText.trim() || isLoading) return;

        const currentText = inputText.trim();
        const userMessage = {
            id: Date.now().toString(),
            text: currentText,
            isBot: false,
            timestamp: new Date(),
        };

        // 2. Update UI Immediately & Save
        const updatedWithUser = [...messages, userMessage];
        setMessages(updatedWithUser);
        setInputText('');
        setIsLoading(true);
        await saveChatHistory(updatedWithUser); // 💾 SAVE after user message

        // Keep keyboard open
        setTimeout(() => inputRef.current?.focus(), 50);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

        // 3. Prepare History Context for AI (Last 10 messages only)
        const historyContext = updatedWithUser.slice(-10).map(msg => ({
            role: msg.isBot ? 'assistant' : 'user',
            content: msg.text
        }));

        try {
            // 4. Send to Appwrite with userStats
            const execution = await functions.createExecution(
                '694129dd000963fdd432',
                JSON.stringify({
                    history: historyContext,
                    userStats: {
                        level: 'A1',
                        vocabCount: 50,
                        weakTopics: [],
                        interests: 'General'
                    }
                })
            );

            if (execution.status === 'failed') throw new Error('Failed');

            const response = JSON.parse(execution.responseBody);

            if (response.reply) {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.reply,
                    isBot: true,
                    timestamp: new Date(),
                };
                const finalList = [...updatedWithUser, botMessage];
                setMessages(finalList);
                await saveChatHistory(finalList); // 💾 SAVE after bot reply
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Verbindungsprobleme... ⚠️ I lost the connection. Please try again.',
                isBot: true,
                timestamp: new Date(),
            };
            const errorList = [...updatedWithUser, errorMessage];
            setMessages(errorList);
            await saveChatHistory(errorList); // 💾 SAVE error message too
        } finally {
            setIsLoading(false);
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    };

    // Helper to format time - handles both Date objects and ISO strings
    const formatTime = (date) => {
        const d = date instanceof Date ? date : new Date(date);
        return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const renderMessage = ({ item }) => (
        <Animated.View style={[
            styles.messageRow,
            item.isBot ? styles.botRow : styles.userRow,
            { opacity: fadeAnim }
        ]}>
            {item.isBot && (
                <View style={styles.botAvatarContainer}>
                    <Image source={BOT_AVATAR} style={styles.avatarImage} />
                    <View style={styles.avatarGlow} />
                </View>
            )}

            <View style={[
                styles.bubbleContainer,
                item.isBot ? styles.botBubbleAlign : styles.userBubbleAlign
            ]}>
                {item.isBot ? (
                    // BOT MESSAGE: Glassmorphism Style
                    <View style={styles.botBubbleGlass}>
                        <Text style={styles.botText}>{item.text}</Text>
                        <Text style={styles.botTimestamp}>{formatTime(item.timestamp)}</Text>
                    </View>
                ) : (
                    // USER MESSAGE: Premium Gradient
                    <LinearGradient
                        colors={['#3B82F6', '#2563EB']} // Electric Blue
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.userBubbleGradient}
                    >
                        <Text style={styles.userText}>{item.text}</Text>
                        <Text style={styles.userTimestamp}>{formatTime(item.timestamp)}</Text>
                    </LinearGradient>
                )}
            </View>
        </Animated.View>
    );

    // Auto-scroll when messages change
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 200);
        }
    }, [messages, isLoading]);

    return (
        <View style={styles.mainContainer}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            {/* 1. BACKGROUND LAYERS */}
            <ImageBackground source={homeBg} style={StyleSheet.absoluteFillObject} resizeMode="cover" blurRadius={50}>
                <LinearGradient
                    colors={['rgba(2, 6, 23, 0.9)', 'rgba(15, 23, 42, 0.8)', 'rgba(2, 6, 23, 0.95)']}
                    style={StyleSheet.absoluteFillObject}
                />
            </ImageBackground>

            <View style={[styles.keyboardContainer, { paddingBottom: keyboardHeight }]}>
                {/* MESSAGES */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                />

                {/* 4. TYPING INDICATOR */}
                {isLoading && (
                    <View style={styles.typingContainer}>
                        <View style={styles.typingGlass}>
                            <ActivityIndicator size="small" color="#3B82F6" />
                            <Text style={styles.typingText}>AI is thinking...</Text>
                        </View>
                    </View>
                )}

                {/* 5. FLOATING INPUT BAR */}
                <View style={styles.inputWrapper}>
                    <View style={styles.inputGlassContainer}>
                        <TextInput
                            ref={inputRef}
                            style={styles.textInput}
                            value={inputText}
                            onChangeText={setInputText}
                            placeholder="Ask about German..."
                            placeholderTextColor="#64748B"
                            multiline
                            maxLength={500}
                            blurOnSubmit={false}
                            returnKeyType="send"
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, (!inputText.trim() || isLoading) && styles.sendButtonDisabled]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isLoading}
                            activeOpacity={0.8}
                        >
                            <LinearGradient
                                colors={inputText.trim() ? ['#3B82F6', '#1D4ED8'] : ['#334155', '#1e293b']}
                                style={styles.sendGradient}
                            >
                                <Text style={styles.sendIcon}>↑</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                </View>

            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    mainContainer: { flex: 1, backgroundColor: '#020617' },
    safeArea: { flex: 1 },
    keyboardContainer: { flex: 1 },

    // --- HEADER ---
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 20,
        paddingTop: 10,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    backArrow: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    headerTitle: { color: 'white', fontSize: 18, fontWeight: '700', textAlign: 'center' },
    statusContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#4ADE80', marginRight: 6 },
    statusText: { color: '#94A3B8', fontSize: 12, fontWeight: '500' },

    // --- MESSAGES LIST ---
    messagesList: { paddingHorizontal: 16, paddingBottom: 20, paddingTop: 20 },
    messageRow: { flexDirection: 'row', marginBottom: 24, alignItems: 'flex-end' },
    botRow: { justifyContent: 'flex-start' },
    userRow: { justifyContent: 'flex-end' },

    // --- AVATAR ORB ---
    botAvatarContainer: { marginRight: 12, position: 'relative' },
    avatarImage: { width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
    avatarGlow: {
        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
        borderRadius: 20,
        shadowColor: '#3B82F6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10, elevation: 5,
    },

    // --- BUBBLES ---
    bubbleContainer: { maxWidth: '75%' },

    // Bot Bubble (Glass)
    botBubbleGlass: {
        backgroundColor: '#1E293B',
        padding: 16,
        borderTopLeftRadius: 4,
        borderTopRightRadius: 20,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    botText: { color: '#E2E8F0', fontSize: 16, lineHeight: 24 },
    botTimestamp: { color: '#64748B', fontSize: 10, marginTop: 6, fontWeight: '600' },

    // User Bubble (Gradient)
    userBubbleGradient: {
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 4,
        borderBottomRightRadius: 20,
        borderBottomLeftRadius: 20,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    userText: { color: '#FFFFFF', fontSize: 16, lineHeight: 24 },
    userTimestamp: { color: 'rgba(255,255,255,0.7)', fontSize: 10, marginTop: 6, textAlign: 'right', fontWeight: '600' },

    // --- TYPING INDICATOR ---
    typingContainer: { marginLeft: 60, marginBottom: 20 },
    typingGlass: {
        flexDirection: 'row', alignItems: 'center',
        backgroundColor: 'rgba(30, 41, 59, 0.7)',
        paddingHorizontal: 16, paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
    },
    typingText: { marginLeft: 10, color: '#94A3B8', fontSize: 12, fontStyle: 'italic' },

    // --- INPUT AREA ---
    inputWrapper: {
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 10,
    },
    inputGlassContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        backgroundColor: '#1E293B',
        borderRadius: 30,
        padding: 6,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        // Glow effect for input bar
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 10,
    },
    textInput: {
        flex: 1,
        minHeight: 44,
        maxHeight: 120,
        color: '#F1F5F9',
        fontSize: 16,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    sendButton: {
        width: 44, height: 44,
        borderRadius: 22,
        overflow: 'hidden',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendIcon: { color: 'white', fontSize: 20, fontWeight: 'bold' },
});

export default ChatAssistantScreen;