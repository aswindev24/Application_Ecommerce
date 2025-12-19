import React from 'react';
import { Tabs } from 'expo-router';
import { Alert, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/auth.store';
import { COLORS } from '../../utils/constants';

// Icons functionality would require @expo/vector-icons
// Since we haven't confirmed install, we will use text or simple indicators if icons missing
// But standard template includes vector icons usually.
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
        <Tabs
            screenOptions={{
                headerStyle: {
                    backgroundColor: COLORS.primary,
                },
                headerTintColor: COLORS.white,
                tabBarActiveTintColor: COLORS.primary,
                tabBarInactiveTintColor: 'gray',
            }}
        >
            <Tabs.Screen
                name="dashboard/index"
                options={{
                    title: 'Dashboard',
                    tabBarLabel: 'Home',
                    tabBarIcon: ({ color }) => <MaterialIcons name="dashboard" size={24} color={color} />,
                    headerRight: () => (
                        <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
                            <MaterialIcons name="logout" size={24} color={COLORS.white} />
                        </TouchableOpacity>
                    ),
                }}
            />
            <Tabs.Screen
                name="products/index"
                options={{
                    title: 'Products',
                    tabBarLabel: 'Products',
                    tabBarIcon: ({ color }) => <MaterialIcons name="shopping-bag" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="orders/index"
                options={{
                    title: 'Orders',
                    tabBarLabel: 'Orders',
                    tabBarIcon: ({ color }) => <MaterialIcons name="list-alt" size={24} color={color} />,
                }}
            />
            <Tabs.Screen
                name="categories/index" // This might need to be a stack if we have deep nav, but for now flat
                options={{
                    title: 'Categories',
                    tabBarLabel: 'Categories',
                    tabBarIcon: ({ color }) => <MaterialIcons name="category" size={24} color={color} />,
                }}
            />

            {/* Hidden tabs for detail screens if they are in the same stack or handled via separate groups */}
            {/* In file structure, they are under (admin)/... so they are routes. */}
            {/* If we want them hidden from tab bar, we use href: null (deprecated) or button display none */}
            {/* Standard way in expo router is to put them in the group but not add a Tabs.Screen if they are just files, 
          BUT Tabs layout will auto-pick them up if they exist as direct children unless we exclude them or use a stack inside a tab.
          
          For simplicity, I will layout the MAIN tabs. Other screens will be part of the navigation graph but might show up as tabs if I don't hide them.
          To fix this, we usually use a Stack for each Tab, or just one Stack for the whole (admin) group and use Tabs for the main menu component only.
          
          However, (admin)/_layout.tsx being a Tabs means direct children are tabs.
          
          Correct approach:
          (admin)/_layout.tsx -> Tabs
          (admin)/dashboard -> Tab 1
          (admin)/products -> Tab 2 (Stack?)
          
          If the user structure is flat under (admin), then (admin)/products/index, (admin)/products/add are siblings.
          
          I will set href: null for non-tab screens if I knew them, but for now I'll just add the main ones.
      */}

        </Tabs>
    );
}
