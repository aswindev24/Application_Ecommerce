import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { COLORS } from '../../utils/constants';
import { useAuthStore, AuthState } from '../../store/auth.store';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const login = useAuthStore((state: AuthState) => state.login);
    const router = useRouter();

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        try {
            await login({ email, password });
            // Navigation is handled by _layout.tsx based on token state
        } catch (error: any) {
            console.error('Login error:', error);
            if (error.response) {
                console.error('Error response:', error.response.data);
                console.error('Error status:', error.response.status);
            } else if (error.request) {
                console.error('Error request:', error.request);
            } else {
                console.error('Error message:', error.message);
            }
            Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <Text style={styles.title}>Lestora</Text>
                <Text style={styles.subtitle}>Admin Portal</Text>
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.welcomeText}>Welcome Back!</Text>
                <Text style={styles.instructionText}>Login to manage your store</Text>

                <Input
                    label="Email Address"
                    placeholder="admin@lestora.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />

                <Input
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Button
                    title="Login"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.loginButton}
                />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: COLORS.secondary,
        marginTop: 5,
        fontWeight: '600',
        letterSpacing: 2,
    },
    formContainer: {
        backgroundColor: COLORS.white,
        padding: 20,
        borderRadius: 16,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    welcomeText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginBottom: 5,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 25,
    },
    loginButton: {
        marginTop: 10,
    },
});
