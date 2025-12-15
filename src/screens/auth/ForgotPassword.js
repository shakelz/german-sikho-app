import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from '@react-native-firebase/auth';

const ForgotPassword = ({ navigation }) => {
    const [email, setEmail] = useState('');

    const handleSendCode = async () => {
        if (!email) {
            Alert.alert('Error', 'Please enter your email.');
            return;
        }
        try {
            await sendPasswordResetEmail(getAuth(), email);
            Alert.alert('Email Sent', 'Check your email for the password reset link.');
            navigation.navigate('Login');
        } catch (error) {
            Alert.alert('Error', error.message);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Reset Password</Text>

            <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                style={styles.input}
            />
            <Button title="Send Reset Link" onPress={handleSendCode} />

            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginBottom: 15,
        borderRadius: 5,
    },
});

export default ForgotPassword;
