import React from 'react';
import { Stack } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../utils/constants';
import { MaterialIcons } from '@expo/vector-icons';

export default function AdminLayout() {
    const logout = useAuthStore((state) => state.logout);

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Logout', style: 'destructive', onPress: logout },
        ]);
    };

    return (
        <Stack
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.white,
                headerTitleStyle: {
                    fontWeight: 'bold',
                },
            }}
        >
            <Stack.Screen
                name="dashboard/index"
                options={{
                    title: 'Dashboard',
                    headerRight: () => (
                        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                            <MaterialIcons name="logout" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Stack.Screen
                name="products/index"
                options={{
                    title: 'Products',
                }}
            />
            <Stack.Screen
                name="products/manage"
                options={{
                    title: 'Manage Product',
                }}
            />
            <Stack.Screen
                name="categories/index"
                options={{
                    title: 'Categories',
                }}
            />
            <Stack.Screen
                name="categories/manage"
                options={{
                    title: 'Manage Category',
                }}
            />
            <Stack.Screen
                name="subcategories/index"
                options={{
                    title: 'Subcategories',
                }}
            />
            <Stack.Screen
                name="subcategories/manage"
                options={{
                    title: 'Manage Subcategory',
                }}
            />
            <Stack.Screen
                name="orders/index"
                options={{
                    title: 'Orders',
                }}
            />
            <Stack.Screen
                name="settings/change-password"
                options={{
                    title: 'Change Password',
                }}
            />
            <Stack.Screen
                name="carousel/index"
                options={{
                    title: 'Manage Carousel',
                }}
            />
            <Stack.Screen
                name="carousel/manage"
                options={{
                    title: 'Manage Offer',
                }}
            />
        </Stack>
    );
}
