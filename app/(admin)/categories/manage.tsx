import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useCategoryStore } from '../../../store/category.store';

export default function ManageCategoryScreen() {
    const { id, mode } = useLocalSearchParams();
    const router = useRouter();
    const { addCategory, updateCategory, categories, isLoading } = useCategoryStore();

    const [name, setName] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [isActive, setIsActive] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && id) {
            const category = categories.find((c) => c._id === id);
            if (category) {
                setName(category.name);
                setImage(category.image.url);
                setIsActive(category.isActive);
            }
        } else {
            // Reset state for "Add" mode
            setName('');
            setImage(null);
            setIsActive(true);
        }
    }, [id, mode, categories]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!name.trim()) {
            Alert.alert('Error', 'Please enter a category name');
            return;
        }

        if (!image) {
            Alert.alert('Error', 'Please select an image');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (mode === 'edit') {
                formData.append('isActive', isActive.toString());
            }

            // If image is a new local URI (starts with file:// or content://), append it
            // If it's an existing Cloudinary URL (http...), we might skip sending it IF the backend supports partial updates
            // OR we logic here: only append 'image' if it's new.

            // Check if image is new (from picker)
            if (!image.startsWith('http')) {
                const filename = image.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';

                // @ts-ignore: FormData expects Blob but RN sends object
                formData.append('image', { uri: image, name: filename, type } as any);
            } else if (mode !== 'edit') {
                // For create, image is required
                Alert.alert('Error', 'Please select a valid image');
                setIsSubmitting(false);
                return;
            }

            if (mode === 'edit' && id) {
                await updateCategory(id as string, formData);
            } else {
                await addCategory(formData);
            }
            router.back();
        } catch (error) {
            // Error is handled in store
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Stack.Screen options={{ title: mode === 'edit' ? 'Edit Category' : 'Add Category' }} />

            <View style={styles.formContainer}>
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="camera" size={40} color={COLORS.gray} />
                                <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                    {image && (
                        <TouchableOpacity onPress={() => setImage(null)} style={styles.removeImage}>
                            <Text style={styles.removeImageText}>Remove</Text>
                        </TouchableOpacity>
                    )}
                </View>

                <Input
                    label="Category Name"
                    placeholder="Enter category name"
                    value={name}
                    onChangeText={setName}
                />

                {mode === 'edit' && (
                    <View style={styles.statusContainer}>
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
                    title={isSubmitting ? 'Saving...' : 'Save Category'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting || isLoading}
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
    imageSection: {
        alignItems: 'center',
        marginBottom: 30,
    },
    imageContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        alignItems: 'center',
    },
    imagePlaceholderText: {
        marginTop: 5,
        color: COLORS.darkGray,
        fontSize: 12,
    },
    removeImage: {
        marginTop: 10,
    },
    removeImageText: {
        color: COLORS.red,
        fontSize: 14,
    },
    label: {
        fontSize: 14,
        color: COLORS.darkGray,
        marginBottom: 8,
        fontWeight: '500',
    },
    statusContainer: {
        marginBottom: 15,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#f9f9f9',
    },
    picker: {
        height: 50,
        width: '100%',
    },
});
