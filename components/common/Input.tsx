import React from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { COLORS } from '../../utils/constants';

interface InputProps extends TextInputProps {
    label: string;
    error?: string;
}

const Input: React.FC<InputProps> = ({ label, error, style, ...props }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error ? styles.inputError : null, style]}
                placeholderTextColor="#999"
                {...props}
            />
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 15,
        width: '100%',
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 5,
        fontWeight: '600',
    },
    input: {
        backgroundColor: COLORS.gray,
        padding: 15,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'transparent',
        fontSize: 16,
    },
    inputError: {
        borderColor: COLORS.red,
    },
    error: {
        color: COLORS.red,
        fontSize: 12,
        marginTop: 5,
    },
});

export default Input;
