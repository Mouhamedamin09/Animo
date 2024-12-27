import React, { useState } from 'react';
import {
    View,
    Text,
    SafeAreaView,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    StyleSheet,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import axios from 'axios';
import { ChevronLeftIcon } from 'react-native-heroicons/outline';

const { width } = Dimensions.get('window');
const ios = Platform.OS === 'ios';
const BASE_URL = 'https://animo-server-production.up.railway.app'; // Replace with your machine's IP

export default function AIChatScreen({ route, navigation }) {
    const { character } = route.params;
    const [messages, setMessages] = useState([
        { id: 1, text: `Hello! I am ${character.name}. How can I help you?`, sender: 'character' },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async () => {
        if (input.trim()) {
            const userMessage = input.trim();

            // Add user's message
            setMessages((prev) => [
                ...prev,
                { id: prev.length + 1, text: userMessage, sender: 'user' },
            ]);
            setInput('');

            const chatId = character.id || `${character.name}-${Date.now()}`;
            const characterName = character.name || 'Character';
            const biography = character.bio || 'This character has no biography.';

            try {
                // Add a placeholder for the typing animation
                setMessages((prev) => [
                    ...prev,
                    { id: prev.length + 1, text: '', sender: 'character' },
                ]);

                const response = await axios.post(`${BASE_URL}/character-chat`, {
                    chatId,
                    characterName,
                    biography,
                    userMessage,
                });

                const characterReply = response.data.response;

                // Simulate typing effect for character reply
                simulateTyping(characterReply);
            } catch (error) {
                console.error('Error communicating with the server:', error.message);
                setMessages((prev) => [
                    ...prev,
                    { id: prev.length + 1, text: "I'm having trouble understanding. Please try again.", sender: 'character' },
                ]);
                setIsTyping(false);
            }
        }
    };

    const simulateTyping = (fullText) => {
        setIsTyping(true);
        let index = 0;
        const interval = setInterval(() => {
            setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                const updatedText = lastMessage.text + fullText[index];
                const updatedMessages = [...prev];
                updatedMessages[updatedMessages.length - 1] = { ...lastMessage, text: updatedText };
                return updatedMessages;
            });
            index++;
            if (index >= fullText.length) {
                clearInterval(interval);
                setIsTyping(false);
            }
        }, 5); // Adjust typing speed as needed
    };

    const parseText = (text) => {
        const regex = /\((.*?)\)|\[([^\]]+)\]/g;
        const parts = [];
        let lastIndex = 0;

        let match;
        while ((match = regex.exec(text)) !== null) {
            // Add normal text before match
            if (lastIndex < match.index) {
                parts.push({ text: text.slice(lastIndex, match.index), type: 'normal' });
            }

            // Add matched text
            if (match[1]) {
                parts.push({ text: `(${match[1]})`, type: 'thought' });
            } else if (match[2]) {
                parts.push({ text: `[${match[2]}]`, type: 'action' });
            }

            lastIndex = regex.lastIndex;
        }

        // Add remaining text
        if (lastIndex < text.length) {
            parts.push({ text: text.slice(lastIndex), type: 'normal' });
        }

        return parts;
    };

    const renderMessage = ({ item }) => {
        const parsedText = parseText(item.text);

        return (
            <View
                style={[
                    styles.messageContainer,
                    item.sender === 'user' ? styles.userMessage : styles.characterMessage,
                ]}
            >
                {item.sender === 'character' && (
                    <Image
                        source={{ uri: character.images?.jpg?.image_url }}
                        style={styles.characterImage}
                    />
                )}
                <View
                    style={[
                        styles.messageBubble,
                        item.sender === 'user' ? styles.userBubble : styles.characterBubble,
                    ]}
                >
                    {parsedText.map((part, index) => (
                        <Text
                            key={index}
                            style={[
                                part.type === 'thought' && styles.thoughtText,
                                part.type === 'action' && styles.actionText,
                                part.type === 'normal' && styles.normalText,
                            ]}
                        >
                            {part.text}
                        </Text>
                    ))}
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <ChevronLeftIcon size={28} strokeWidth={2.5} color="white" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Chat with {character.name}</Text>
            </View>

            <FlatList
                data={messages}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderMessage}
                contentContainerStyle={styles.chatContainer}
            />

            <KeyboardAvoidingView
                behavior={ios ? 'padding' : 'height'}
                style={styles.inputContainer}
            >
                <TextInput
                    style={styles.textInput}
                    placeholder="Type your message..."
                    placeholderTextColor="#CCCCCC"
                    value={input}
                    onChangeText={setInput}
                />
                <TouchableOpacity
                    style={[styles.sendButton, isTyping && { backgroundColor: '#AAAAAA' }]}
                    onPress={sendMessage}
                    disabled={isTyping}
                >
                    <Text style={styles.sendButtonText}>{isTyping ? 'Typing...' : 'Send'}</Text>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1A1A1A',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#2A2A2A',
    },
    backButton: {
        padding: 10,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginLeft: 10,
    },
    chatContainer: {
        flexGrow: 1,
        padding: 10,
    },
    messageContainer: {
        flexDirection: 'row',
        marginVertical: 5,
        alignItems: 'flex-end',
    },
    characterMessage: {
        alignSelf: 'flex-start',
    },
    userMessage: {
        alignSelf: 'flex-end',
        flexDirection: 'row-reverse',
    },
    characterImage: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    messageBubble: {
        maxWidth: width * 0.7,
        padding: 10,
        borderRadius: 10,
    },
    characterBubble: {
        backgroundColor: '#333333',
    },
    userBubble: {
        backgroundColor: '#5abf75',
    },
    messageText: {
        color: 'white',
        fontSize: 14,
    },
    thoughtText: {
        color: '#AAAAAA',
        fontStyle: 'italic',
    },
    actionText: {
        color: 'white',
    },
    normalText: {
        color: 'white',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderTopWidth: 1,
        borderColor: '#2A2A2A',
    },
    textInput: {
        flex: 1,
        backgroundColor: '#333333',
        color: 'white',
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        marginRight: 10,
    },
    sendButton: {
        backgroundColor: '#5abf75',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15,
    },
    sendButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
