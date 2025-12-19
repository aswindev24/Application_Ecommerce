import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../api/axios';

export interface AuthState {
    user: any | null;
    token: string | null;
    isLoading: boolean;
    login: (data: any) => Promise<void>;
    logout: () => Promise<void>;
    loadUser: () => Promise<void>;
    changePassword: (data: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    token: null,
    isLoading: true,
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        const { token, ...user } = response.data;

        await SecureStore.setItemAsync('token', token);
        await SecureStore.setItemAsync('user', JSON.stringify(user));

        set({ token, user, isLoading: false });
    },
    logout: async () => {
        await SecureStore.deleteItemAsync('token');
        await SecureStore.deleteItemAsync('user');
        set({ token: null, user: null, isLoading: false });
    },
    loadUser: async () => {
        try {
            const token = await SecureStore.getItemAsync('token');
            const user = await SecureStore.getItemAsync('user');

            if (token && user) {
                set({ token, user: JSON.parse(user), isLoading: false });
            } else {
                set({ isLoading: false });
            }
        } catch (error) {
            set({ isLoading: false });
        }
    },
    changePassword: async (passwords) => {
        await api.put('/auth/change-password', passwords);
    },
}));
