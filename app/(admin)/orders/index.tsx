import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../utils/constants';

export default function OrdersScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Orders Management</Text>
            <Text style={styles.subtext}>Coming Soon...</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.white,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    subtext: {
        fontSize: 16,
        color: COLORS.darkGray,
        marginTop: 10,
    },
});
