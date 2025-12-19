import { create } from 'zustand';
import api from '../api/axios';
import { Alert } from 'react-native';

export interface Product {
    _id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    category: {
        _id: string;
        name: string;
    } | string;
    subcategory: {
        _id: string;
        name: string;
    } | string;
    images: {
        url: string;
        public_id: string;
    }[];
    isActive: boolean;
    createdAt: string;
}

interface ProductState {
    products: Product[];
    isLoading: boolean;
    fetchProducts: () => Promise<void>;
    addProduct: (formData: FormData) => Promise<void>;
    updateProduct: (id: string, formData: FormData) => Promise<void>;
    deleteProduct: (id: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
    products: [],
    isLoading: false,

    fetchProducts: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/products');
            set({ products: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching products:', error);
            set({ isLoading: false });
            Alert.alert('Error', 'Failed to fetch products');
        }
    },

    addProduct: async (formData) => {
        set({ isLoading: true });
        try {
            const response = await api.post('/products', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                products: [...state.products, response.data],
                isLoading: false,
            }));
            Alert.alert('Success', 'Product added successfully');
        } catch (error: any) {
            console.error('Error adding product:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to add product');
            throw error;
        }
    },

    updateProduct: async (id, formData) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/products/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            set((state) => ({
                products: state.products.map((p) => (p._id === id ? response.data : p)),
                isLoading: false,
            }));
            Alert.alert('Success', 'Product updated successfully');
        } catch (error: any) {
            console.error('Error updating product:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update product');
            throw error;
        }
    },

    deleteProduct: async (id) => {
        set({ isLoading: true });
        try {
            const response = await api.delete(`/products/${id}`);
            const { isActive, message } = response.data;

            set((state) => ({
                products: state.products.map((p) =>
                    p._id === id ? { ...p, isActive } : p
                ),
                isLoading: false,
            }));

            Alert.alert('Success', message);
        } catch (error: any) {
            console.error('Error toggling product status:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update product status');
        }
    },
}));
