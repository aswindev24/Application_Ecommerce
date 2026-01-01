import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, TextInput, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Make sure this is installed
import { COLORS } from '../../../utils/constants';
import { useOrderStore, Order } from '../../../store/order.store';
// import { format } from 'date-fns'; // Removed dependency

// Helper to format date if date-fns is not available
const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ORDER_STATUSES = ['Pending', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'];

export default function OrdersScreen() {
    const router = useRouter();
    const { orders, isLoading, fetchOrders, updateOrderStatus } = useOrderStore();

    const [filterStatus, setFilterStatus] = useState<string>('All');
    const [sortOrder, setSortOrder] = useState<'Newest' | 'Oldest'>('Newest');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [statusModalVisible, setStatusModalVisible] = useState(false);
    const [newStatus, setNewStatus] = useState<string>('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const filteredOrders = useMemo(() => {
        let result = [...orders];

        // 1. Filter by Status
        if (filterStatus !== 'All') {
            result = result.filter(o => o.status === filterStatus);
        }

        // 2. Search (ID or Customer Name)
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(o =>
                o._id.toLowerCase().includes(query) ||
                o.customerInfo?.name?.toLowerCase().includes(query)
            );
        }

        // 3. Sort
        result.sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'Newest' ? dateB - dateA : dateA - dateB;
        });

        return result;
    }, [orders, filterStatus, sortOrder, searchQuery]);

    const handleUpdateStatus = async () => {
        if (selectedOrder && newStatus && newStatus !== selectedOrder.status) {
            await updateOrderStatus(selectedOrder._id, newStatus);
            setStatusModalVisible(false);
            setSelectedOrder(null);
        }
    };

    const openStatusModal = (order: Order) => {
        setSelectedOrder(order);
        setNewStatus(order.status);
        setStatusModalVisible(true);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#FBC02D'; // Yellow
            case 'Processing': return '#0288D1'; // Light Blue
            case 'Packed': return '#7B1FA2'; // Purple
            case 'Shipped': return '#F57C00'; // Orange
            case 'Delivered': return '#388E3C'; // Green
            case 'Cancelled': return '#D32F2F'; // Red
            default: return COLORS.darkGray;
        }
    };

    const renderOrderItem = ({ item }: { item: Order }) => (
        <View style={styles.orderCard}>
            <View style={styles.orderHeader}>
                <View>
                    <Text style={styles.orderId}>Order #{item._id.slice(-6)}</Text>
                    <Text style={styles.orderDate}>{formatDate(item.createdAt)}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.customerSection}>
                <Ionicons name="person-outline" size={16} color="#666" />
                <Text style={styles.customerName}>{item.customerInfo?.name || 'Unknown User'}</Text>
            </View>

            <View style={styles.statsRow}>
                <View>
                    <Text style={styles.label}>Total Price</Text>
                    <Text style={styles.price}>₹{item.totalPrice.toFixed(2)}</Text>
                </View>
                <View>
                    <Text style={styles.label}>Items</Text>
                    <Text style={styles.val}>{item.orderItems.length}</Text>
                </View>
                <View>
                    <Text style={styles.label}>Payment</Text>
                    <Text style={styles.val}>{item.paymentMethod}</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => openStatusModal(item)}
            >
                <Text style={styles.actionButtonText}>Update Status</Text>
            </TouchableOpacity>

            {/* Helper to view details logic could go here, e.g. expand to show items */}
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}


            {/* Filters */}
            <View style={styles.filterContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={20} color="#999" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search ID or Name"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>

                <View style={styles.filterRow}>
                    <TouchableOpacity
                        style={styles.sortButton}
                        onPress={() => setSortOrder(prev => prev === 'Newest' ? 'Oldest' : 'Newest')}
                    >
                        <MaterialIcons name="sort" size={20} color="#555" />
                        <Text style={styles.sortText}>{sortOrder}</Text>
                    </TouchableOpacity>

                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={filterStatus}
                            onValueChange={(itemValue) => setFilterStatus(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="All Statuses" value="All" />
                            {ORDER_STATUSES.map(status => (
                                <Picker.Item key={status} label={status} value={status} />
                            ))}
                        </Picker>
                    </View>
                </View>
            </View>

            {isLoading && orders.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    renderItem={renderOrderItem}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No orders found.</Text>
                        </View>
                    }
                />
            )}

            {/* Update Status Modal */}
            <Modal
                transparent={true}
                visible={statusModalVisible}
                animationType="fade"
                onRequestClose={() => setStatusModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Order Status</Text>
                        <Text style={styles.modalSubtitle}>Order #{selectedOrder?._id.slice(-6)}</Text>

                        <View style={styles.modalPickerContainer}>
                            <Picker
                                selectedValue={newStatus}
                                onValueChange={(itemValue) => setNewStatus(itemValue)}
                            >
                                {ORDER_STATUSES.map(status => (
                                    <Picker.Item key={status} label={status} value={status} />
                                ))}
                            </Picker>
                        </View>

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => setStatusModalVisible(false)}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.confirmButton]}
                                onPress={handleUpdateStatus}
                            >
                                <Text style={styles.confirmButtonText}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FA',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        backgroundColor: COLORS.white,
        elevation: 2,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginLeft: 15,
        color: COLORS.black,
    },
    filterContainer: {
        backgroundColor: COLORS.white,
        padding: 15,
        paddingTop: 15,
        zIndex: 1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: 8,
        paddingHorizontal: 10,
        height: 40,
        marginBottom: 10,
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: COLORS.black,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        padding: 8,
        borderRadius: 8,
        marginRight: 10,
    },
    sortText: {
        marginLeft: 5,
        fontWeight: '500',
        color: '#555',
    },
    pickerContainer: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 8,
        justifyContent: 'center',
        height: 50, // Increased height
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    picker: {
        height: 50, // Increased height
        width: '100%',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: 15,
    },
    orderCard: {
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.black,
    },
    orderDate: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    divider: {
        height: 1,
        backgroundColor: '#EEE',
        marginVertical: 12,
    },
    customerSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    customerName: {
        marginLeft: 8,
        fontSize: 14,
        color: '#444',
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 15,
    },
    label: {
        fontSize: 12,
        color: '#888',
        marginBottom: 2,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    val: {
        fontSize: 14,
        fontWeight: '500',
        color: '#333',
    },
    actionButton: {
        backgroundColor: COLORS.primary,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyText: {
        color: '#888',
        fontSize: 16,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        padding: 20,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
        color: COLORS.black,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    modalPickerContainer: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    modalButton: {
        paddingVertical: 10,
        paddingHorizontal: 15,
        borderRadius: 6,
        marginLeft: 10,
    },
    cancelButton: {
        backgroundColor: '#F5F5F5',
    },
    confirmButton: {
        backgroundColor: COLORS.primary,
    },
    cancelButtonText: {
        color: '#666',
        fontWeight: 'bold',
    },
    confirmButtonText: {
        color: COLORS.white,
        fontWeight: 'bold',
    },
});
