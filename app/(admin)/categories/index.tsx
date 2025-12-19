import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, TextInput } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../../utils/constants';
import { useCategoryStore, Category } from '../../../store/category.store';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { generatePDF, categoriesToHTML } from '../../../utils/pdfGenerator';

export default function CategoriesScreen() {
    const router = useRouter();
    const { categories, isLoading, fetchCategories, deleteCategory } = useCategoryStore();

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 5;

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, filterStatus]);

    useFocusEffect(
        useCallback(() => {
            fetchCategories();
        }, [])
    );

    const filteredCategories = useMemo(() => {
        return categories.filter(cat => {
            const matchesSearch = cat.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && cat.isActive) ||
                (filterStatus === 'inactive' && !cat.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [categories, searchQuery, filterStatus]);

    const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);

    const paginatedCategories = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCategories.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCategories, currentPage]);

    const handleDownload = async () => {
        try {
            const html = categoriesToHTML(filteredCategories);
            await generatePDF('Categories Report', html);
        } catch (error) {
            Alert.alert('Error', 'Failed to generate PDF');
        }
    };

    const handleDelete = (id: string, name: string) => {
        const item = categories.find(c => c._id === id);
        const isDeactivating = item?.isActive;
        const action = isDeactivating ? 'Deactivate' : 'Activate';
        const message = isDeactivating
            ? `Are you sure you want to deactivate "${name}"? Associated subcategories and products will also be deactivated.`
            : `Are you sure you want to activate "${name}"?`;

        Alert.alert(
            `${action} Category`,
            message,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: action,
                    style: isDeactivating ? 'destructive' : 'default',
                    onPress: () => deleteCategory(id),
                },
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image?.url }} style={styles.image} />
            <View style={styles.infoContainer}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={item.isActive ? styles.statusActive : styles.statusInactive}>
                    {item.isActive ? 'Active' : 'Disabled'}
                </Text>
            </View>
            <View style={styles.actions}>
                <TouchableOpacity
                    onPress={() => router.push({ pathname: '/(admin)/categories/manage', params: { id: item._id, mode: 'edit' } })}
                    style={[styles.actionButton, styles.editButton]}
                >
                    <MaterialIcons name="edit" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleDelete(item._id, item.name)}
                    style={[styles.actionButton, styles.deleteButton]}
                >
                    <MaterialIcons name={item.isActive ? "delete" : "restore"} size={20} color={item.isActive ? COLORS.red : COLORS.green} />
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
                    <Text style={styles.totalText}>Total: {filteredCategories.length}</Text>
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
                        placeholder="Search categories..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Ionicons name="close-circle" size={20} color={COLORS.gray} />
                        </TouchableOpacity>
                    )}
                </View>

                <View style={styles.filterRow}>
                    <View style={styles.pickerWrapper}>
                        <Picker
                            selectedValue={filterStatus}
                            onValueChange={(val) => setFilterStatus(val)}
                            style={styles.picker}
                            mode="dropdown"
                            dropdownIconColor={COLORS.darkGray}
                        >
                            <Picker.Item label="All Status" value="all" style={{ fontSize: 13 }} />
                            <Picker.Item label="Active Only" value="active" style={{ fontSize: 13 }} />
                            <Picker.Item label="Disabled Only" value="inactive" style={{ fontSize: 13 }} />
                        </Picker>
                    </View>
                    <TouchableOpacity style={styles.downloadButton} onPress={handleDownload}>
                        <MaterialIcons name="picture-as-pdf" size={24} color={COLORS.white} />
                    </TouchableOpacity>
                </View>
            </View>

            {isLoading && categories.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : (
                <FlatList
                    data={paginatedCategories}
                    renderItem={renderItem}
                    keyExtractor={(item) => item._id}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={isLoading} onRefresh={fetchCategories} colors={[COLORS.primary]} />
                    }
                    ListFooterComponent={renderPagination}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons name="search-outline" size={60} color="#ddd" />
                            <Text style={styles.emptyText}>No categories found</Text>
                            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
                        </View>
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => router.push({ pathname: '/(admin)/categories/manage', params: { mode: 'add' } })}
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
        paddingBottom: 80, // Space for FAB
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
        width: 60,
        height: 60,
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
        justifyContent: 'flex-start',
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
    downloadButton: {
        backgroundColor: COLORS.primary,
        width: 45,
        height: 45,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
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
