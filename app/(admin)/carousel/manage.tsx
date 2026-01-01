import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../utils/constants';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { useCarouselStore } from '../../../store/carousel.store';

export default function ManageCarouselScreen() {
    const { id, mode } = useLocalSearchParams();
    const router = useRouter();
    const { addOffer, updateOffer, offers, isLoading } = useCarouselStore();

    const [offerName, setOfferName] = useState('');
    const [title, setTitle] = useState('');
    const [image, setImage] = useState<string | null>(null);
    const [priority, setPriority] = useState('0');
    const [status, setStatus] = useState<'active' | 'inactive'>('active');
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]);

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (mode === 'edit' && id) {
            const offer = offers.find((o) => o._id === id);
            if (offer) {
                setOfferName(offer.offerName);
                setTitle(offer.title);
                setImage(offer.imageUrl);
                setPriority(offer.priority.toString());
                setStatus(offer.status);
                setStartDate(new Date(offer.startDate).toISOString().split('T')[0]);
                setEndDate(new Date(offer.endDate).toISOString().split('T')[0]);
            }
        }
    }, [id, mode, offers]);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [16, 9],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    const handleSubmit = async () => {
        if (!offerName.trim() || !title.trim() || !image) {
            Alert.alert('Error', 'Please fill in all required fields (Name, Title, Image)');
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('offerName', offerName);
            formData.append('title', title);
            formData.append('priority', priority);
            formData.append('status', status);
            formData.append('startDate', startDate);
            formData.append('endDate', endDate);

            if (!image.startsWith('http')) {
                const filename = image.split('/').pop() || 'image.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : 'image/jpeg';
                // @ts-ignore
                formData.append('image', { uri: image, name: filename, type } as any);
            }

            if (mode === 'edit' && id) {
                await updateOffer(id as string, formData);
            } else {
                await addOffer(formData);
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
            <Stack.Screen options={{ title: mode === 'edit' ? 'Edit Offer' : 'Add Offer' }} />

            <View style={styles.formContainer}>
                <View style={styles.imageSection}>
                    <TouchableOpacity onPress={pickImage} style={styles.imageContainer}>
                        {image ? (
                            <Image source={{ uri: image }} style={styles.imagePreview} />
                        ) : (
                            <View style={styles.imagePlaceholder}>
                                <Ionicons name="image" size={40} color={COLORS.gray} />
                                <Text style={styles.imagePlaceholderText}>Tap to add banner image</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <Input label="Offer Name (Admin Only)" placeholder="e.g. Diwali Sale 2024" value={offerName} onChangeText={setOfferName} />
                <Input label="Display Title" placeholder="e.g. Flash Sale! 50% Off" value={title} onChangeText={setTitle} />
                <Input label="Priority (Lower is higher)" placeholder="0" keyboardType="numeric" value={priority} onChangeText={setPriority} />

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <Text style={styles.label}>Status</Text>
                        <View style={styles.pickerContainer}>
                            <Picker selectedValue={status} onValueChange={(val) => setStatus(val)} style={styles.picker}>
                                <Picker.Item label="Active" value="active" />
                                <Picker.Item label="Inactive" value="inactive" />
                            </Picker>
                        </View>
                    </View>
                </View>

                <View style={styles.row}>
                    <View style={styles.flex1}>
                        <Input label="Start Date" placeholder="YYYY-MM-DD" value={startDate} onChangeText={setStartDate} />
                    </View>
                    <View style={[styles.flex1, { marginLeft: 10 }]}>
                        <Input label="End Date" placeholder="YYYY-MM-DD" value={endDate} onChangeText={setEndDate} />
                    </View>
                </View>

                <Button
                    title={isSubmitting ? 'Saving...' : 'Save Offer'}
                    onPress={handleSubmit}
                    loading={isSubmitting}
                    disabled={isSubmitting || isLoading}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.white },
    formContainer: { padding: 20 },
    imageSection: { alignItems: 'center', marginBottom: 20 },
    imageContainer: {
        width: '100%',
        height: 180,
        borderRadius: 12,
        backgroundColor: '#f9f9f9',
        borderWidth: 1,
        borderColor: '#eee',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
    imagePlaceholder: { alignItems: 'center' },
    imagePlaceholderText: { marginTop: 5, color: COLORS.gray, fontSize: 12 },
    label: { fontSize: 14, color: COLORS.darkGray, marginBottom: 8, fontWeight: '500' },
    row: { flexDirection: 'row', marginBottom: 5 },
    flex1: { flex: 1 },
    pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, backgroundColor: '#f9f9f9', marginBottom: 10 },
    picker: { height: 50, width: '100%' },
});
