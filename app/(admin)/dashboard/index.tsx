import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';

export default function Dashboard() {
    const router = useRouter();
    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.header}>Dashboard Overview</Text>

            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.managementContainer}>
                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#E3F2FD' }]}
                    onPress={() => router.push('/(admin)/categories')}
                >
                    <MaterialIcons name="category" size={32} color={COLORS.primary} />
                    <Text style={styles.managementText}>Manage Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#FFF3E0' }]}
                    onPress={() => router.push('/(admin)/subcategories')}
                >
                    <MaterialIcons name="subdirectory-arrow-right" size={32} color="#F57C00" />
                    <Text style={styles.managementText}>Manage Subcategories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#E8F5E9' }]}
                    onPress={() => router.push('/(admin)/products')}
                >
                    <MaterialIcons name="shopping-bag" size={32} color="#388E3C" />
                    <Text style={styles.managementText}>Manage Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#FFEBEE' }]}
                    onPress={() => router.push('/(admin)/orders')}
                >
                    <MaterialIcons name="list-alt" size={32} color="#D32F2F" />
                    <Text style={styles.managementText}>Manage Orders</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsContainer}>
                <View style={[styles.card, { backgroundColor: '#F5F5F5' }]}>
                    <Text style={styles.cardTitle}>Total Orders</Text>
                    <Text style={styles.cardValue}>1,234</Text>
                </View>
                <View style={[styles.card, { backgroundColor: '#F5F5F5' }]}>
                    <Text style={styles.cardTitle}>Revenue</Text>
                    <Text style={styles.cardValue}>$45k</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <View style={styles.placeholderChart}>
                <Text style={{ color: '#999' }}>Chart Placeholder</Text>
            </View>

            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.settingsContainer}>
                <TouchableOpacity
                    style={styles.settingsCard}
                    onPress={() => router.push('/(admin)/settings/change-password')}
                >
                    <View style={styles.settingsIconContainer}>
                        <MaterialIcons name="security" size={24} color={COLORS.primary} />
                    </View>
                    <View style={styles.settingsTextContainer}>
                        <Text style={styles.settingsTitle}>Change Password</Text>
                        <Text style={styles.settingsSubtitle}>Update your account password</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#999" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: COLORS.white,
        paddingBottom: 40,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        color: COLORS.darkGray,
    },
    managementContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    managementCard: {
        width: '48%',
        padding: 20,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    managementText: {
        marginTop: 10,
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        textAlign: 'center',
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
    settingsContainer: {
        marginBottom: 20,
    },
    settingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        padding: 15,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#eee',
    },
    settingsIconContainer: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    settingsSubtitle: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
