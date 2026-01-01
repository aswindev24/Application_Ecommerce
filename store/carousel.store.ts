import { create } from 'zustand';
import api from '../api/axios';
import { Alert } from 'react-native';

export interface CarouselOffer {
    _id: string;
    offerName: string;
    title: string;
    imageUrl: string;
    priority: number;
    status: 'active' | 'inactive';
    startDate: string;
    endDate: string;
    createdAt: string;
    updatedAt: string;
}

interface CarouselState {
    offers: CarouselOffer[];
    isLoading: boolean;
    fetchOffers: () => Promise<void>;
    addOffer: (formData: FormData) => Promise<void>;
    updateOffer: (id: string, formData: FormData) => Promise<void>;
    deleteOffer: (id: string) => Promise<void>;
}

export const useCarouselStore = create<CarouselState>((set, get) => ({
    offers: [],
    isLoading: false,

    fetchOffers: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/carousel/admin');
            set({ offers: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching carousel offers:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'Failed to fetch carousel offers');
        }
    },

    addOffer: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/carousel/admin', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                offers: [...state.offers, response.data],
                isLoading: false,
            }));
            Alert.alert('Success', 'Offer added successfully');
        } catch (error: any) {
            console.error('Error adding offer:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to add offer');
            throw error;
        }
    },

    updateOffer: async (id, formData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/carousel/admin/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                offers: state.offers.map((offer) => (offer._id === id ? response.data : offer)),
                isLoading: false,
            }));
            Alert.alert('Success', 'Offer updated successfully');
        } catch (error: any) {
            console.error('Error updating offer:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update offer');
            throw error;
        }
    },

    deleteOffer: async (id) => {
        set({ isLoading: true });
        try {
            await api.delete(`/carousel/admin/${id}`);
            set((state) => ({
                offers: state.offers.filter((offer) => offer._id !== id),
                isLoading: false,
            }));
            Alert.alert('Success', 'Offer deleted successfully');
        } catch (error: any) {
            console.error('Error deleting offer:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to delete offer');
        }
    },
}));
