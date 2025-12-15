import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { getAuth, EmailAuthProvider } from '@react-native-firebase/auth';

const ChangePassword = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        if (!oldPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            Alert.alert('Error', 'Password must be at least 8 characters');
            return;
        }

        setLoading(true);
        try {
            const user = getAuth().currentUser;
            if (!user) {
                Alert.alert('Error', 'User not authenticated');
                return;
            }

            // Re-authenticate user
            const credential = auth.EmailAuthProvider.credential(user.email, oldPassword);
            await user.reauthenticateWithCredential(credential);

            // Update password
            await user.updatePassword(newPassword);

            Alert.alert('Success', 'Password changed successfully!');
            navigation.goBack();
        } catch (error) {
            console.error('Error changing password:', error);
            Alert.alert('Error', error.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backButton}>← Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Password</Text>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.content}>
                <Text style={styles.label}>Current Password</Text>
                <TextInput
                    style={styles.input}
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    secureTextEntry
                    placeholder="Enter current password"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>New Password</Text>
                <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry
                    placeholder="Enter new password (min 8 characters)"
                    autoCapitalize="none"
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                    placeholder="Confirm new password"
                    autoCapitalize="none"
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleChangePassword}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Changing...' : 'Change Password'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f0f4f8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        fontSize: 16,
        color: '#007AFF',
        width: 60,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    content: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginTop: 15,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 10,
        marginTop: 30,
        alignItems: 'center',
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

export default ChangePassword;
