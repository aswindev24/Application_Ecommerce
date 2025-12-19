import { create } from 'zustand';
import api from '../api/axios';
import { Alert } from 'react-native';

export interface Subcategory {
    _id: string;
    name: string;
    category: {
        _id: string;
        name: string;
    } | string; // Could be populated object or ID string
    isActive: boolean;
}

interface SubcategoryState {
    subcategories: Subcategory[];
    isLoading: boolean;
    fetchSubcategories: () => Promise<void>;
    addSubcategory: (data: { name: string; categoryId: string; isActive?: boolean }) => Promise<void>;
    updateSubcategory: (id: string, data: { name: string; categoryId: string; isActive?: boolean }) => Promise<void>;
    deleteSubcategory: (id: string) => Promise<void>;
}

export const useSubcategoryStore = create<SubcategoryState>((set, get) => ({
    subcategories: [],
    isLoading: false,

    fetchSubcategories: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/subcategories');
            set({ subcategories: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching subcategories:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'Failed to fetch subcategories');
        }
    },

    addSubcategory: async (data) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/subcategories', data);
            set((state) => ({
                subcategories: [...state.subcategories, response.data],
                isLoading: false,
            }));
            Alert.alert('Success', 'Subcategory added successfully');
        } catch (error: any) {
            console.error('Error adding subcategory:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to add subcategory');
            throw error;
        }
    },

    updateSubcategory: async (id, data) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/subcategories/${id}`, data);
            set((state) => ({
                subcategories: state.subcategories.map((sub) =>
                    sub._id === id ? { ...sub, ...response.data } : sub // Merge to keep populated category if not returned fully
                ),
                isLoading: false,
            }));
            // Refresh list to ensure population is correct if needed, or rely on manual update
            await get().fetchSubcategories();
            Alert.alert('Success', 'Subcategory updated successfully');
        } catch (error: any) {
            console.error('Error updating subcategory:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update subcategory');
            throw error;
        }
    },

    deleteSubcategory: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.delete(`/subcategories/${id}`);
            const { isActive, message } = response.data;

            set((state) => ({
                subcategories: state.subcategories.map((sub) =>
                    sub._id === id ? { ...sub, isActive } : sub
                ),
                isLoading: false,
            }));

            Alert.alert('Success', message);
        } catch (error: any) {
            console.error('Error deleting/toggling subcategory:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update subcategory status');
        }
    },
}));
