import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { COLORS } from '../../../utils/constants';
import { useCarouselStore, CarouselOffer } from '../../../store/carousel.store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

export default function CarouselScreen() {
    const router = useRouter();
    const { offers, isLoading, fetchOffers, deleteOffer } = useCarouselStore();

    useFocusEffect(
        useCallback(() => {
            fetchOffers();
        }, [])
    );

    const handleDelete = (id: string, name: string) => {
        Alert.alert(
            'Delete Offer',
            `Are you sure you want to delete "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deleteOffer(id),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: CarouselOffer }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.offerName}</Text>
                <Text style={styles.title}>{item.title}</Text>
                <View style={styles.statusRow}>
                    <Text style={item.status === 'active' ? styles.statusActive : styles.statusInactive}>
                        {item.status.toUpperCase()}
                    </Text>
                    <Text style={styles.priority}>Priority: {item.priority}</Text>
                </View>
                <Text style={styles.dates}>
                    {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(admin)/carousel/manage', params: { id: item._id, mode: 'edit' } })}
                    style={[styles.actionButton, styles.editButton]}
                >
                    <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item._id, item.offerName)}
                    style={[styles.actionButton, styles.deleteButton]}
                >
                    <MaterialIcons name="delete" size={20} color={COLORS.red} />
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading && offers.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={offers}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchOffers} colors={[COLORS.primary]} />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="image-outline" size={60} color="#ddd" />
                            <Text style={styles.emptyText}>No offers found</Text>
                            <Text style={styles.emptySubtext}>Create a new carousel offer to get started</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: '/(admin)/carousel/manage', params: { mode: 'add' } })}
            >
                <Ionicons name="add" size={30} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
        paddingBottom: 80,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 12,
        marginBottom: 12,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        backgroundColor: '#eee',
    },
    infoContainer: {
        flex: 1,
        marginLeft: 15,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    title: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusActive: {
        fontSize: 11,
        color: COLORS.green,
        fontWeight: 'bold',
    },
    statusInactive: {
        fontSize: 11,
        color: COLORS.red,
        fontWeight: 'bold',
    },
    priority: {
        fontSize: 11,
        color: '#888',
        marginLeft: 10,
    },
    dates: {
        fontSize: 10,
        color: '#999',
        marginTop: 4,
    },
    actions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: 8,
        marginLeft: 5,
    },
    editButton: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
    },
    deleteButton: {
        backgroundColor: '#FFEBEE',
        borderRadius: 8,
    },
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
});
