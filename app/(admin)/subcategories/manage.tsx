import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import { COLORS } from '../../../utils/constants';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useSubcategoryStore } from '../../../store/subcategory.store';
import { useCategoryStore } from '../../../store/category.store';

export default function ManageSubcategoryScreen() {
    const { id, mode } = useLocalSearchParams();
    const router = useRouter();
    const { addSubcategory, updateSubcategory, subcategories, isLoading: isSubLoading } = useSubcategoryStore();
    const { categories, fetchCategories, isLoading: isCatLoading } = useCategoryStore();

    const [name, setName] = useState('');
    const [categoryId, setCategoryId] = useState('');
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        if (mode === 'edit' && id) {
            const subcategory = subcategories.find((s) => s._id === id);
            if (subcategory) {
                setName(subcategory.name);
                // Handle populated category object or string ID
                const catId = typeof subcategory.category === 'object' ? subcategory.category?._id : subcategory.category;
                setCategoryId(catId || '');
                setIsActive(subcategory.isActive);
            }
        } else {
            // Reset state for "Add" mode
            setName('');
            setCategoryId('');
            setIsActive(true);
        }
    }, [id, mode, subcategories]);

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a subcategory name');
            return;
        }

        if (!categoryId) {
            Alert.alert('Error', 'Please select a parent category');
            return;
        }

        setIsSubmitting(true);
        try {
            const data = { name, categoryId, isActive };

            if (mode === 'edit' && id) {
                await updateSubcategory(id as string, data);
            } else {
                await addSubcategory(data);
            }
            router.back();
        } catch (error) {
            // Error handled in store
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: mode === 'edit' ? 'Edit Subcategory' : 'Add Subcategory' }} />

            <View style={styles.formContainer}>
                <Input
                    label="Subcategory Name"
                    placeholder="Enter subcategory name"
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Parent Category</Text>
                <View style={styles.pickerContainer}>
                    {isCatLoading && categories.length === 0 ? (
                        <ActivityIndicator size="small" color={COLORS.primary} style={{ margin: 10 }} />
                    ) : (
                        <Picker
                            selectedValue={categoryId}
                            onValueChange={(itemValue) => setCategoryId(itemValue)}
                            style={styles.picker}
                        >
                            <Picker.Item label="Select a Category" value="" />
                            {categories.map((cat) => (
                                <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                            ))}
                        </Picker>
                    )}
                </View>

                {mode === 'edit' && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={isActive ? 'true' : 'false'}
                                onValueChange={(itemValue) => setIsActive(itemValue === 'true')}
                                style={styles.picker}
                            >
                                <Picker.Item label="Active" value="true" />
                                <Picker.Item label="Disabled" value="false" />
                            </Picker>
                        </View>
                    </View>
                )}

                <Button
                    title={isSubmitting ? 'Saving...' : 'Save Subcategory'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting || isSubLoading}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.white,
    },
    formContainer: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
        fontWeight: '500',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 20,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 50,
        width: '100%',
    },
});
