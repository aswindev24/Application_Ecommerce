import { create } from 'zustand';
import api from '../api/axios';
import { Alert } from 'react-native';

export interface Order {
    start_id: string; // generated ID is usually _id
    _id: string;
    user: { _id: string; name: string; email: string };
    orderItems: {
        name: string;
        qty: number;
        image: string;
        price: number;
        product: string;
        _id: string;
    }[];
    customerInfo: {
        name: string;
        email: string;
        phone: string;
        address: string;
    };
    paymentMethod: string;
    totalPrice: number;
    isPaid: boolean;
    paidAt?: string;
    deliveryStatus?: string; // Sometimes used alternatively
    deliveredAt?: string;
    status: 'Pending' | 'Processing' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
    createdAt: string;
    updatedAt: string;
}

interface OrderState {
    orders: Order[];
    isLoading: boolean;
    fetchOrders: () => Promise<void>;
    updateOrderStatus: (id: string, status: string) => Promise<void>;
}

export const useOrderStore = create<OrderState>((set) => ({
    orders: [],
    isLoading: false,

    fetchOrders: async () => {
        set({ isLoading: true });
        try {
            const response = await api.get('/orders');
            set({ orders: response.data, isLoading: false });
        } catch (error) {
            console.error('Error fetching orders:', error);
            set({ isLoading: false });
            // Alert.alert('Error', 'Failed to fetch orders'); // Avoid alert on dashboard mount
        }
    },

    updateOrderStatus: async (id, status) => {
        set({ isLoading: true });
        try {
            const response = await api.put(`/orders/${id}`, { status });
            set((state) => ({
                orders: state.orders.map((o) => (o._id === id ? response.data : o)),
                isLoading: false,
            }));
            Alert.alert('Success', 'Order status updated');
        } catch (error: any) {
            console.error('Error updating order:', error);
            set({ isLoading: false });
            Alert.alert('Error', error.response?.data?.message || 'Failed to update order');
        }
    },
}));
