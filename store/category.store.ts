import { create } from 'zustand';
import api from '../api/axios';
import { Alert } from 'react-native';

export interface Category {
    _id: string;
    name: string;
    image: {
        url: string;
        public_id: string;
    };
    isActive: boolean;
}

interface CategoryState {
    categories: Category[];
    isLoading: boolean;
    fetchCategories: () => Promise<void>;
    addCategory: (formData: FormData) => Promise<void>;
    updateCategory: (id: string, formData: FormData) => Promise<void>;
    deleteCategory: (id: string) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
    categories: [],
    isLoading: false,

    fetchCategories: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/categories');
            set({ categories: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching categories:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'Failed to fetch categories');
        }
    },

    addCategory: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/categories', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                categories: [...state.categories, response.data],
                isLoading: false,
            }));
            Alert.alert('Success', 'Category added successfully');
        } catch (error: any) {
            console.error('Error adding category:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to add category');
            throw error;
        }
    },

    updateCategory: async (id, formData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/categories/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                categories: state.categories.map((cat) => (cat._id === id ? response.data : cat)),
                isLoading: false,
            }));
            Alert.alert('Success', 'Category updated successfully');
        } catch (error: any) {
            console.error('Error updating category:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update category');
            throw error;
        }
    },

    deleteCategory: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.delete(`/categories/${id}`);
            const { isActive, message } = response.data;

            set((state) => ({
                categories: state.categories.map((cat) =>
                    cat._id === id ? { ...cat, isActive } : cat
                ),
                isLoading: false,
            }));

            Alert.alert('Success', message);
        } catch (error: any) {
            console.error('Error deleting/toggling category:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update category status');
        }
    },
}));
