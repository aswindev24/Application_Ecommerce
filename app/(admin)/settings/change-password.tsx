import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { COLORS } from '../../../utils/constants';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useAuthStore } from '../../../store/auth.store';
import { Ionicons } from '@expo/vector-icons';

export default function ChangePasswordScreen() {
    const router = useRouter();
    const { changePassword } = useAuthStore();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!currentPassword || !newPassword || !confirmPassword) {
            Alert.alert('Error', 'Please fill all fields');
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert('Error', 'New password must be at least 6 characters long');
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword({ currentPassword, newPassword });
            Alert.alert(
                'Success',
                'Password changed successfully',
                [{ text: 'OK', onPress: () => router.back() }]
            );
        } catch (error: any) {
            const message = error.response?.data?.message || 'Failed to change password';
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ title: 'Change Password' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.iconContainer}>
                        <Ionicons name="lock-closed" size={40} color={COLORS.primary} />
                    </View>
                    <Text style={styles.title}>Update Your Password</Text>
                    <Text style={styles.subtitle}>Ensure your account is secure with a strong password.</Text>
                </View>

                <View style={styles.form}>
                    <Input
                        label="Current Password"
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        secureTextEntry
                    />

                    <Input
                        label="New Password"
                        placeholder="Enter new password"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry
                    />

                    <Input
                        label="Confirm New Password"
                        placeholder="Confirm new password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                    />

                    <View style={styles.buttonContainer}>
                        <Button
                            title="Update Password"
                            onPress={handleSubmit}
                            loading={isLoading}
                        />
                    </View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    scrollContent: {
        padding: 20,
        flexGrow: 1,
    },
    header: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginTop: 8,
        paddingHorizontal: 20,
    },
    form: {
        gap: 15,
    },
    buttonContainer: {
        marginTop: 20,
    },
});
