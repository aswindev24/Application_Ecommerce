import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../../utils/constants';
import { useProductStore, Product } from '../../../store/product.store';
import { useCategoryStore } from '../../../store/category.store';
import { useSubcategoryStore } from '../../../store/subcategory.store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { generatePDF, productsToHTML } from '../../../utils/pdfGenerator';

export default function ProductsScreen() {
    const router = useRouter();
    const { products, isLoading, fetchProducts, deleteProduct } = useProductStore();
    const { categories, fetchCategories } = useCategoryStore();
    const { subcategories, fetchSubcategories } = useSubcategoryStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategoryId, setFilterCategoryId] = useState('');
    const [filterSubcategoryId, setFilterSubcategoryId] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterCategoryId, filterSubcategoryId, filterStatus]);

    useFocusEffect(
        useCallback(() => {
            fetchProducts();
            fetchCategories();
            fetchSubcategories();
        }, [])
    );

    const filteredSubcategories = useMemo(() => {
        if (!filterCategoryId) return subcategories;
        return subcategories.filter(sub => {
            const catId = typeof sub.category === 'object' ? sub.category?._id : sub.category;
            return catId === filterCategoryId;
        });
    }, [subcategories, filterCategoryId]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());

            const catId = typeof product.category === 'object' ? product.category?._id : product.category;
            const matchesCategory = filterCategoryId === '' || catId === filterCategoryId;

            const subId = typeof product.subcategory === 'object' ? product.subcategory?._id : product.subcategory;
            const matchesSubcategory = filterSubcategoryId === '' || subId === filterSubcategoryId;

            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && product.isActive) ||
                (filterStatus === 'inactive' && !product.isActive);

            return matchesSearch && matchesCategory && matchesSubcategory && matchesStatus;
        });
    }, [products, searchQuery, filterCategoryId, filterSubcategoryId, filterStatus]);

    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredProducts.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredProducts, currentPage]);

    const handleDownload = async () => {
        try {
            const html = productsToHTML(filteredProducts);
            await generatePDF('Products Inventory Report', html);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    const handleToggleStatus = (id: string, name: string) => {
        const product = products.find(p => p._id === id);
        const isDeactivating = product?.isActive;
        const action = isDeactivating ? 'Deactivate' : 'Activate';

        Alert.alert(
            `${action} Product`,
            `Are you sure you want to ${action.toLowerCase()} "${name}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action,
                    style: isDeactivating ? 'destructive' : 'default',
                    onPress: () => deleteProduct(id),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <Image
                source={{ uri: item.images[0]?.url || 'https://via.placeholder.com/150' }}
                style={styles.image}
            />
            <View style={styles.infoContainer}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <Text style={styles.stock}>Stock: {item.stock}</Text>
                <Text style={item.isActive ? styles.statusActive : styles.statusInactive}>
                    {item.isActive ? 'Active' : 'Disabled'}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(admin)/products/manage', params: { id: item._id, mode: 'edit' } })}
                    style={[styles.actionButton, styles.editButton]}
                >
                    <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleToggleStatus(item._id, item.name)}
                    style={[styles.actionButton, styles.deleteButton]}
                >
                    <MaterialIcons
                        name={item.isActive ? "delete" : "restore"}
                        size={20}
                        color={item.isActive ? COLORS.red : COLORS.green}
                    />
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        return (
            <View style={styles.paginationContainer}>
                <TouchableOpacity
                    style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                >
                    <Ionicons name="chevron-back" size={20} color={currentPage === 1 ? '#999' : COLORS.primary} />
                </TouchableOpacity>

                <View style={styles.pageInfo}>
                    <Text style={styles.pageText}>Page {currentPage} of {totalPages}</Text>
                    <Text style={styles.totalText}>Total: {filteredProducts.length}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
                    onPress={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                >
                    <Ionicons name="chevron-forward" size={20} color={currentPage === totalPages ? '#999' : COLORS.primary} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={COLORS.gray} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')} style={{ marginRight: 10 }}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                    <TouchableOpacity onPress={handleDownload}>
                        <MaterialIcons name="picture-as-pdf" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                </View>

                <View style={styles.filterRow}>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={filterCategoryId}
                            onValueChange={(val) => {
                                setFilterCategoryId(val);
                                setFilterSubcategoryId('');
                            }}
                            style={styles.picker}
                            mode="dropdown"
                            dropdownIconColor={COLORS.darkGray}
                        >
                            <Picker.Item label="All" value="" style={{ fontSize: 11 }} />
                            {categories.map(cat => (
                                <Picker.Item key={cat._id} label={cat.name} value={cat._id} style={{ fontSize: 11 }} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={filterSubcategoryId}
                            onValueChange={(val) => setFilterSubcategoryId(val)}
                            style={styles.picker}
                            mode="dropdown"
                            enabled={!!filterCategoryId || filteredSubcategories.length > 0}
                            dropdownIconColor={COLORS.darkGray}
                        >
                            <Picker.Item label="Sub" value="" style={{ fontSize: 11 }} />
                            {filteredSubcategories.map(sub => (
                                <Picker.Item key={sub._id} label={sub.name} value={sub._id} style={{ fontSize: 11 }} />
                            ))}
                        </Picker>
                    </View>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={filterStatus}
                            onValueChange={(val) => setFilterStatus(val)}
                            style={styles.picker}
                            mode="dropdown"
                            dropdownIconColor={COLORS.darkGray}
                        >
                            <Picker.Item label="Status" value="all" style={{ fontSize: 11 }} />
                            <Picker.Item label="Active" value="active" style={{ fontSize: 11 }} />
                            <Picker.Item label="Disabled" value="inactive" style={{ fontSize: 11 }} />
                        </Picker>
                    </View>
                </View>
            </View>

            {isLoading && products.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={paginatedProducts}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchProducts} colors={[COLORS.primary]} />
                    }
                    ListFooterComponent={renderPagination}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={60} color="#ddd" />
                            <Text style={styles.emptyText}>No products found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: '/(admin)/products/manage', params: { mode: 'add' } })}
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
        width: 70,
        height: 70,
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
    price: {
        fontSize: 14,
        color: COLORS.primary,
        fontWeight: '600',
        marginTop: 2,
    },
    stock: {
        fontSize: 12,
        color: '#666',
        marginTop: 1,
    },
    statusActive: {
        fontSize: 12,
        color: COLORS.green,
        marginTop: 4,
        fontWeight: '600',
    },
    statusInactive: {
        fontSize: 12,
        color: COLORS.red,
        marginTop: 4,
        fontWeight: '600',
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
        marginTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.darkGray,
        marginTop: 15,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#999',
        marginTop: 5,
    },
    header: {
        backgroundColor: COLORS.white,
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F0F2F5',
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 45,
        marginBottom: 12,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontSize: 15,
        color: COLORS.darkGray,
    },
    filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
    },
    pickerWrapper: {
        flex: 1,
        backgroundColor: '#F0F2F5',
        borderRadius: 10,
        height: 45,
        justifyContent: 'center',
    },
    picker: {
        height: 45,
        width: '100%',
        color: COLORS.darkGray,
    },
    paginationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 20,
        marginTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    pageButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    pageButtonDisabled: {
        backgroundColor: '#f5f5f5',
        elevation: 0,
    },
    pageInfo: {
        alignItems: 'center',
    },
    pageText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: COLORS.darkGray,
    },
    totalText: {
        fontSize: 12,
        color: '#666',
        marginTop: 2,
    },
});
