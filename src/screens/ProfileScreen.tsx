import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert, Platform } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { useNotification } from '../lib/NotificationContext';
import { supabase } from '../lib/supabase';
import { User, LogOut, Settings, CreditCard, HelpCircle, ChevronLeft, Package, RotateCw, Heart, MapPin, Trash2 } from 'lucide-react-native';

export const ProfileScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { addToCart, favorites } = useCart();
    const { savedAddresses, deleteAddress } = useLocation();
    const { showNotification } = useNotification();
    const [orders, setOrders] = useState<any[]>([]);

    const fetchOrders = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user?.id)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) setOrders(data);
        } catch (err) {
            console.log("Could not fetch orders", err);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchOrders();
        }
    }, [fetchOrders]);

    const handleReorder = async (orderId: string) => {
        // Find the order to get its amount (or simulate items)
        const order = orders.find(o => o.id === orderId);
        
        // Mock items for the reorder
        const itemsToReorder = [
            { id: 101, name: "Premium Avocados", price: 199, qty: 1 },
            { id: 102, name: "Sourdough Bread", price: 85, qty: 1 }
        ];

        itemsToReorder.forEach(item => {
            addToCart({ ...item, type: "Solo" });
        });

        showNotification("All items from your previous order added!", "success");
        navigation.navigate("Checkout");
    };

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            showNotification(error.message, "error");
        } else {
            showNotification("Signed out successfully.", "info");
        }
    };

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-ui-background">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-xl">MY PROFILE</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* User Info Card */}
                <View className="bg-ui-surface rounded-3xl p-6 border border-gray-200 shadow-sm items-center mb-8">
                    <View className="w-20 h-20 rounded-full bg-brand-primary/10 border-2 border-brand-primary items-center justify-center mb-4">
                        <User size={40} color="#5A189A" />
                    </View>
                    <Text className="text-text-primary font-black text-xl">{user?.email}</Text>
                    <View className="bg-brand-primary/10 px-3 py-1 rounded-full mt-2 border border-brand-primary/20">
                        <Text className="text-brand-primary text-xs font-bold">Verified Member</Text>
                    </View>
                </View>

                {/* Order History */}
                <Text className="text-text-primary font-black text-lg mb-4 ml-1">Order History</Text>

                {orders.length === 0 ? (
                    <View className="bg-ui-surface rounded-3xl p-6 border border-gray-200 shadow-sm items-center mb-6">
                        <Package size={32} color="#9CA3AF" />
                        <Text className="text-text-secondary font-bold mt-3">No recent orders found.</Text>
                    </View>
                ) : (
                    <View className="bg-ui-surface rounded-3xl p-2 border border-gray-200 mb-6 shadow-sm">
                        {orders.map((order, index) => {
                            const date = new Date(order.created_at).toLocaleDateString();
                            return (
                                <View key={order.id || index} className={`p-4 flex-row items-center justify-between ${index !== orders.length - 1 ? 'border-b border-gray-200' : ''}`}>
                                    <View>
                                        <Text className="text-text-primary font-bold">Order #{order.id?.toString().slice(0, 6)}</Text>
                                        <Text className="text-text-secondary text-xs mt-1">{date} • ₹{order.total_amount}</Text>
                                    </View>
                                    <TouchableOpacity
                                        onPress={() => handleReorder(order.id)}
                                        className="bg-brand-primary/10 px-3 py-1.5 rounded-lg border border-brand-primary/30 flex-row items-center"
                                    >
                                        <RotateCw size={12} color="#5A189A" />
                                        <Text className="text-brand-primary text-xs font-bold ml-1">Reorder</Text>
                                    </TouchableOpacity>
                                </View>
                            );
                        })}
                    </View>
                )}

                {/* Options List */}
                <View className="bg-ui-surface rounded-3xl p-2 border border-gray-200 mb-6 shadow-sm">
                    <TouchableOpacity onPress={() => navigation.navigate('PaymentMethods')} className="flex-row items-center p-4 border-b border-gray-200">
                        <CreditCard size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Payment Methods</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Settings')} className="flex-row items-center p-4 border-b border-gray-100">
                        <Settings size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">App Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => navigation.navigate('Support')} className="flex-row items-center p-4">
                        <HelpCircle size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-4 flex-1">Support & Help</Text>
                    </TouchableOpacity>
                </View>

                {/* Favorites Section */}
                <View className="mb-8">
                    <View className="flex-row items-center justify-between mb-4">
                        <Text className="text-text-primary font-black text-lg ml-1">My Favorites</Text>
                        <Heart size={20} color="#EF4444" />
                    </View>
                    {favorites.length === 0 ? (
                        <View className="bg-ui-surface rounded-3xl p-6 border border-gray-200 shadow-sm items-center">
                            <Text className="text-text-secondary font-bold">No items favorited yet.</Text>
                        </View>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {favorites.map(favId => (
                                <View key={favId} className="mr-3 bg-ui-surface p-4 rounded-3xl border border-gray-200 w-32 items-center">
                                    <View className="w-16 h-16 bg-ui-background rounded-2xl mb-2 items-center justify-center">
                                        <Text className="text-2xl">🍎</Text>
                                    </View>
                                    <Text className="text-text-primary font-bold text-xs text-center" numberOfLines={1}>Product {favId}</Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}
                </View>

                {/* Saved Addresses Section */}
                <View className="mb-8">
                    <Text className="text-text-primary font-black text-lg mb-4 ml-1">Delivery Addresses</Text>
                    {savedAddresses.map((addr) => (
                        <View key={addr.id} className="bg-ui-surface rounded-3xl p-4 border border-gray-200 mb-3 shadow-sm flex-row items-center">
                            <View className="w-10 h-10 bg-brand-primary/10 rounded-full items-center justify-center border border-brand-primary/20 mr-3">
                                <MapPin size={20} color="#5A189A" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-text-primary font-bold">{addr.title}</Text>
                                <Text className="text-text-secondary text-xs" numberOfLines={1}>{addr.address}</Text>
                            </View>
                            <TouchableOpacity onPress={() => deleteAddress(addr.id)}>
                                <Trash2 size={18} color="#9CA3AF" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-ui-background border border-red-500 py-4 rounded-xl flex-row items-center justify-center shadow-sm"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold ml-2">SIGN OUT</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-500 text-xs mt-6">Joinzo v1.0.0</Text>
            </ScrollView>
        </View>
    );
};
