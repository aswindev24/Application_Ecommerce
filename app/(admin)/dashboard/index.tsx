import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';
import { useOrderStore } from '../../../store/order.store';
import { useProductStore } from '../../../store/product.store';
import { useCategoryStore } from '../../../store/category.store';
import { useSubcategoryStore } from '../../../store/subcategory.store';
import { useCarouselStore } from '../../../store/carousel.store';

export default function Dashboard() {
    const router = useRouter();
    const { orders, fetchOrders, isLoading: ordersLoading } = useOrderStore();
    const { fetchProducts, isLoading: productsLoading } = useProductStore();
    const { fetchCategories, isLoading: categoriesLoading } = useCategoryStore();
    const { fetchSubcategories, isLoading: subcategoriesLoading } = useSubcategoryStore();
    const { fetchOffers, isLoading: offersLoading } = useCarouselStore();

    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([
            fetchOrders(),
            fetchProducts(),
            fetchCategories(),
            fetchSubcategories(),
            fetchOffers(),
        ]);
        setRefreshing(false);
    };

    useEffect(() => {
        handleRefresh();
    }, []);

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const totalProducts = useProductStore.getState().products.length;
    const totalCategories = useCategoryStore.getState().categories.length;

    const latestOrders = orders.slice(0, 3);

    const isLoading = refreshing || ordersLoading || productsLoading || categoriesLoading || subcategoriesLoading || offersLoading;

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.headerContainer}>
                <View>
                    <Text style={styles.header}>Dashboard</Text>
                    <Text style={styles.subHeader}>Welcome back, Admin</Text>
                </View>
                <TouchableOpacity
                    style={styles.refreshButton}
                    onPress={handleRefresh}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <MaterialIcons name="refresh" size={24} color={COLORS.primary} />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.statsGrid}>
                <View style={[styles.statCard, { borderLeftColor: COLORS.primary }]}>
                    <Text style={styles.statLabel}>Revenue</Text>
                    <Text style={styles.statValue}>₹{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#D32F2F' }]}>
                    <Text style={styles.statLabel}>Orders</Text>
                    <Text style={styles.statValue}>{totalOrders}</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#388E3C' }]}>
                    <Text style={styles.statLabel}>Products</Text>
                    <Text style={styles.statValue}>{totalProducts}</Text>
                </View>
                <View style={[styles.statCard, { borderLeftColor: '#F57C00' }]}>
                    <Text style={styles.statLabel}>Categories</Text>
                    <Text style={styles.statValue}>{totalCategories}</Text>
                </View>
            </View>

            <Text style={styles.sectionTitle}>Quick Management</Text>
            <View style={styles.managementContainer}>
                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#E3F2FD' }]}
                    onPress={() => router.push('/(admin)/categories')}
                >
                    <MaterialIcons name="category" size={28} color={COLORS.primary} />
                    <Text style={styles.managementText}>Categories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#FFF3E0' }]}
                    onPress={() => router.push('/(admin)/subcategories')}
                >
                    <MaterialIcons name="subdirectory-arrow-right" size={28} color="#F57C00" />
                    <Text style={styles.managementText}>Sub-categories</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#E8F5E9' }]}
                    onPress={() => router.push('/(admin)/products')}
                >
                    <MaterialIcons name="shopping-bag" size={28} color="#388E3C" />
                    <Text style={styles.managementText}>Products</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#FFEBEE' }]}
                    onPress={() => router.push('/(admin)/orders')}
                >
                    <MaterialIcons name="list-alt" size={28} color="#D32F2F" />
                    <Text style={styles.managementText}>Orders</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.managementCard, { backgroundColor: '#EDE7F6', width: '100%' }]}
                    onPress={() => router.push('/(admin)/carousel' as any)}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <MaterialIcons name="photo-library" size={28} color="#5E35B1" />
                        <Text style={[styles.managementText, { marginTop: 0, marginLeft: 15 }]}>Manage Banner Advertisements</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Latest Orders</Text>
                <TouchableOpacity onPress={() => router.push('/(admin)/orders')}>
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.recentOrdersContainer}>
                {latestOrders.length > 0 ? latestOrders.map((order) => (
                    <TouchableOpacity
                        key={order._id}
                        style={styles.orderItem}
                        onPress={() => router.push('/(admin)/orders')}
                    >
                        <View style={styles.orderIcon}>
                            <MaterialIcons name="receipt" size={20} color="#666" />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                            <Text style={styles.orderCustomer}>{order.customerInfo?.name || 'Customer'}</Text>
                            <Text style={styles.orderId}>#{order._id.slice(-6).toUpperCase()}</Text>
                        </View>
                        <View style={{ alignItems: 'flex-end' }}>
                            <Text style={styles.orderAmount}>₹{order.totalPrice.toFixed(2)}</Text>
                            <Text style={[styles.orderStatus, { color: order.status === 'Delivered' ? '#388E3C' : '#F57C00' }]}>
                                {order.status}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )) : (
                    <Text style={styles.emptyText}>No orders yet</Text>
                )}
            </View>

            <Text style={styles.sectionTitle}>Account Settings</Text>
            <View style={styles.settingsContainer}>
                <TouchableOpacity
                    style={styles.settingsCard}
                    onPress={() => router.push('/(admin)/settings/change-password')}
                >
                    <View style={styles.settingsIconContainer}>
                        <MaterialIcons name="security" size={22} color={COLORS.primary} />
                    </View>
                    <View style={styles.settingsTextContainer}>
                        <Text style={styles.settingsTitle}>Security Settings</Text>
                        <Text style={styles.settingsSubtitle}>Update your admin password</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        backgroundColor: '#F8FAFC',
        paddingBottom: 40,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
        marginTop: 10,
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    subHeader: {
        fontSize: 14,
        color: '#64748B',
        marginTop: 2,
    },
    refreshButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: COLORS.white,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    statCard: {
        width: '48%',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        borderLeftWidth: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    statLabel: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
        marginTop: 5,
    },
    managementContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    managementCard: {
        width: '48%',
        padding: 15,
        borderRadius: 12,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    managementText: {
        marginTop: 8,
        fontSize: 13,
        fontWeight: 'bold',
        color: '#334155',
        textAlign: 'center',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 15,
    },
    viewAllText: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
    },
    recentOrdersContainer: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 10,
        marginBottom: 25,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    orderItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    orderIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    orderCustomer: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B',
    },
    orderId: {
        fontSize: 12,
        color: '#64748B',
    },
    orderAmount: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    orderStatus: {
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
    },
    settingsContainer: {
        marginBottom: 20,
    },
    settingsCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.white,
        padding: 15,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    settingsIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#F0F9FF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    settingsTextContainer: {
        flex: 1,
        marginLeft: 15,
    },
    settingsTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1E293B',
    },
    settingsSubtitle: {
        fontSize: 12,
        color: '#64748B',
        marginTop: 2,
    },
    emptyText: {
        textAlign: 'center',
        padding: 20,
        color: '#94A3B8',
        fontStyle: 'italic',
    },
});
