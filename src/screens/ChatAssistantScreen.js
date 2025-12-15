import React, { useState, useRef, useEffect } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Client, Functions } from 'appwrite';

// Init Appwrite
const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject('692c8c1f002809245709');
const functions = new Functions(client);

const ChatAssistantScreen = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hallo! I am your AI German tutor. Ask me anything about grammar or vocabulary! 🇩🇪',
            isBot: true,
            timestamp: new Date(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const flatListRef = useRef(null);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            isBot: false,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            const execution = await functions.createExecution(
                '693ff74500065eaf74e1', // Function ID from Appwrite Functions list
                JSON.stringify({ userMessage: inputText.trim() })
            );

            // Debug: Log the execution response
            console.log('Execution status:', execution.status);
            console.log('Response body:', execution.responseBody);
            console.log('Response errors:', execution.errors);

            // Check for execution errors
            if (execution.status === 'failed' || execution.errors) {
                throw new Error(execution.errors || 'Function execution failed');
            }

            // Handle empty response
            if (!execution.responseBody) {
                throw new Error('Empty response from function');
            }

            const response = JSON.parse(execution.responseBody);

            if (response.error) {
                throw new Error(response.error);
            }

            if (response.reply) {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: response.reply,
                    isBot: true,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
            } else {
                throw new Error('No reply in response');
            }
        } catch (error) {
            console.error("Chat Error:", error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: "Entschuldigung! I'm having trouble connecting. Please try again. 🔄",
                isBot: true,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderMessage = ({ item }) => (
        <View style={[
            styles.messageBubble,
            item.isBot ? styles.botBubble : styles.userBubble
        ]}>
            <Text style={[
                styles.messageText,
                item.isBot ? styles.botText : styles.userText
            ]}>
                {item.text}
            </Text>
        </View>
    );

    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                {/* Messages List */}
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={item => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                />

                {/* Typing Indicator */}
                {isLoading && (
                    <View style={styles.typingIndicator}>
                        <ActivityIndicator size="small" color="#58CC02" />
                        <Text style={styles.typingText}>Bot is typing...</Text>
                    </View>
                )}

                {/* Input Bar */}
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.textInput}
                        value={inputText}
                        onChangeText={setInputText}
                        placeholder="Ask about grammar, vocabulary..."
                        placeholderTextColor="#9CA3AF"
                        multiline
                        maxLength={500}
                        editable={!isLoading}
                    />
                    <TouchableOpacity
                        style={[
                            styles.sendButton,
                            (!inputText.trim() || isLoading) && styles.sendButtonDisabled
                        ]}
                        onPress={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                    >
                        <Text style={styles.sendButtonText}>➤</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageBubble: {
        maxWidth: '80%',
        padding: 12,
        borderRadius: 16,
        marginBottom: 8,
    },
    botBubble: {
        backgroundColor: '#E5E5EA',
        alignSelf: 'flex-start',
        borderBottomLeftRadius: 4,
    },
    userBubble: {
        backgroundColor: '#58CC02',
        alignSelf: 'flex-end',
        borderBottomRightRadius: 4,
    },
    messageText: {
        fontSize: 16,
        lineHeight: 22,
    },
    botText: {
        color: '#1C1C1E',
    },
    userText: {
        color: '#FFFFFF',
    },
    typingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    typingText: {
        marginLeft: 8,
        color: '#6B7280',
        fontSize: 14,
        fontStyle: 'italic',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 12,
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E5EA',
    },
    textInput: {
        flex: 1,
        minHeight: 44,
        maxHeight: 100,
        backgroundColor: '#F3F4F6',
        borderRadius: 22,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 16,
        color: '#1C1C1E',
    },
    sendButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#58CC02',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    sendButtonDisabled: {
        backgroundColor: '#D1D5DB',
    },
    sendButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
    },
});

export default ChatAssistantScreen;
