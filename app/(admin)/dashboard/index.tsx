import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { COLORS } from '../../utils/constants';

export default function Dashboard() {
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Dashboard Overview</Text>

            <View style={styles.statsContainer}>
                <View style={[styles.card, { backgroundColor: '#E3F2FD' }]}>
                    <Text style={styles.cardTitle}>Total Orders</Text>
                    <Text style={styles.cardValue}>1,234</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#FFF3E0' }]}>
                    <Text style={styles.cardTitle}>Revenue</Text>
                    <Text style={styles.cardValue}>$45k</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#E8F5E9' }]}>
                    <Text style={styles.cardTitle}>Products</Text>
                    <Text style={styles.cardValue}>56</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#FFEBEE' }]}>
                    <Text style={styles.cardTitle}>Pending</Text>
                    <Text style={styles.cardValue}>12</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.placeholderChart}>
                <Text style={{ color: '#999' }}>Chart Placeholder</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.white,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.darkGray,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        width: '48%',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 14,
        color: '#555',
        marginBottom: 5,
    },
    cardValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 15,
        color: COLORS.darkGray,
    },
    placeholderChart: {
        height: 200,
        backgroundColor: COLORS.gray,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
