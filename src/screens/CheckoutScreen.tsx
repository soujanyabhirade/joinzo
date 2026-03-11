import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { ShoppingBag, MapPin, ChevronRight, Info, Clock, CheckCircle, Truck, Zap, ShieldCheck, CreditCard, Smartphone, Wallet } from 'lucide-react-native';
import Map, { Marker } from '../components/Map';
import { CountdownTimer } from '../components/CountdownTimer';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';

export const CheckoutScreen = ({ navigation }: any) => {
    const [apartment, setApartment] = useState('');
    const [gate, setGate] = useState('');
    const [instructions, setInstructions] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { cartItems, getCartTotal, clearCart } = useCart();
    const { isServicable, savedAddresses } = useLocation();
    const { user } = useAuth();
    const { showNotification } = useNotification();

    // 1. Base Total
    const total = getCartTotal();

    // 2. Mock Savings Calculation (assuming Loop is ~20% cheaper than Solo)
    const loopItems = cartItems.filter(item => item.type === "Loop");
    const loopSavings = loopItems.reduce((acc, item) => acc + (item.price * 0.2 * item.qty), 0);

    // 3. Smart Batching Discount (₹15 off if neighbor at same gate)
    const batchDiscount = gate ? 15 : 0;

    // Final Math
    const finalTotal = Math.max(0, total - batchDiscount);

    const handlePayment = async (methodId: string) => {
        if (isProcessing) return; // Debounce mechanism
        setIsProcessing(true);

        try {
            if (cartItems.length === 0) {
                throw new Error("Your cart is empty!");
            }

            // 1. Validating Product Availability before charging (Backend Check)
            const itemIds = cartItems.map(item => item.id);
            const { data: stockData, error: stockError } = await supabase
                .from('products')
                .select('id, is_in_stock, name')
                .in('id', itemIds);

            if (stockError) throw stockError;

            // Check if any items are flagged as out of stock by the backend response
            const outOfStock = stockData?.find(p => !p.is_in_stock);
            if (outOfStock) {
                throw new Error(`${outOfStock.name} is currently out of stock. Please remove it from your cart.`);
            }

            // 2. Insert Order into Supabase accurately
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id,
                    total_amount: finalTotal,
                    status: 'placed',
                })
                .select()
                .single();

            if (orderError) {
                console.error("Order Insert Error (Non-fatal for demo):", orderError);
            }

            // 3. Simulate Gateway Delay Processing
            await new Promise(resolve => setTimeout(resolve, 1500));

            // 4. Success Navigation & State Reset
            clearCart();
            setShowPayment(false);
            showNotification("Payment successful! Tracking your order.", "success");
            navigation.navigate("TrackOrder", { triggerConfetti: true });

        } catch (error: any) {
            console.error("Payment Flow Error:", error);
            showNotification(error.message || "Payment Processing Failed. Try again.", "error");
        } finally {
            // Restore button operability if failed or unmounted
            setIsProcessing(false);
        }
    };

    return (
        <View className="flex-1 bg-ui-background p-4">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-center mt-4 mb-6">
                    <Text className="text-text-primary font-black text-3xl">GATE-DROP</Text>
                    <CountdownTimer minutes={10} />
                </View>

                {/* Address Section */}
                <View className="bg-ui-surface border border-gray-200 rounded-3xl p-5 mb-6 overflow-hidden">
                    <View className="flex-row items-center mb-4">
                        <MapPin size={20} color="#5A189A" />
                        <Text className="text-text-primary font-bold ml-2">Delivery Address</Text>
                    </View>

                    {/* Map Integration */}
                    <View className="h-32 bg-ui-background rounded-2xl border border-gray-200 mb-4 overflow-hidden">
                        <Map
                            style={{ flex: 1 }}
                            initialRegion={{
                                latitude: 12.9716, // Default Bangalore temp
                                longitude: 77.5946,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            userInterfaceStyle="dark"
                        >
                            <Marker
                                coordinate={{ latitude: 12.9716, longitude: 77.5946 }}
                                title="Common Drop Point"
                                description={`Gate ${gate || "2"}`}
                            />
                        </Map>
                    </View>

                    {/* Quick Address Picker */}
                    <View className="mb-4">
                        <Text className="text-text-secondary font-bold text-[10px] uppercase mb-2">Select Saved Address</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {savedAddresses.map(addr => (
                                <TouchableOpacity
                                    key={addr.id}
                                    onPress={() => setApartment(addr.address)}
                                    className="mr-2 bg-ui-background border border-gray-200 px-3 py-2 rounded-xl"
                                >
                                    <Text className="text-brand-primary font-bold text-xs">{addr.title}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <TextInput
                        placeholder="Apartment / Complex Name"
                        placeholderTextColor="#9CA3AF"
                        className="bg-ui-background border border-gray-200 rounded-2xl px-4 py-4 text-text-primary font-medium mb-3"
                        value={apartment}
                        onChangeText={setApartment}
                    />

                    <View className="flex-row space-x-3 mb-3">
                        <TextInput
                            placeholder="Drop-off Gate #"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="numeric"
                            className="flex-1 bg-ui-background border border-gray-200 rounded-2xl px-4 py-4 text-text-primary font-black text-lg"
                            value={gate}
                            onChangeText={setGate}
                        />
                        <View className="flex-1 items-center justify-center bg-brand-primary/10 border border-brand-primary/30 rounded-2xl p-2">
                            <Text className="text-brand-primary text-[10px] font-black uppercase text-center">Batching logic:</Text>
                            <Text className="text-text-primary text-xs text-center font-bold">Orders for Gate {gate || "?"} will arrive together.</Text>
                        </View>
                    </View>

                    <TextInput
                        placeholder="Delivery Instructions (e.g. Leave at door)"
                        placeholderTextColor="#9CA3AF"
                        className="bg-ui-background border border-gray-200 rounded-2xl px-4 py-4 text-text-primary font-medium"
                        value={instructions}
                        onChangeText={setInstructions}
                    />
                </View>

                {/* Cart Summary */}
                <View className="bg-ui-surface border border-gray-200 rounded-3xl p-5 mb-6">
                    <Text className="text-text-secondary font-bold text-xs uppercase mb-4 tracking-widest">Order Summary</Text>
                    {cartItems.length === 0 ? (
                        <Text className="text-text-secondary font-medium text-center py-4">Your cart is empty</Text>
                    ) : cartItems.map((item, index) => (
                        <View key={`${item.id}-${index}`} className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="bg-ui-background px-2 py-1 rounded-md mr-3 border border-gray-200">
                                    <Text className="text-brand-primary font-black text-xs">{item.qty}x</Text>
                                </View>
                                <View>
                                    <Text className="text-text-primary font-bold">{item.name}</Text>
                                    <Text className="text-brand-primary text-[10px] font-bold uppercase">{item.type} PRICE APPLIED</Text>
                                </View>
                            </View>
                            <Text className="text-text-primary font-black">₹{item.price * item.qty}</Text>
                        </View>
                    ))}

                    <View className="h-[1px] bg-gray-200 my-4" />

                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text-secondary font-bold">Subtotal</Text>
                        <Text className="text-text-primary font-bold">₹{total}</Text>
                    </View>
                    <View className="flex-row justify-between items-center mb-2">
                        <Text className="text-text-secondary font-bold">Gate-Drop Fee</Text>
                        <Text className="text-brand-primary font-black">FREE</Text>
                    </View>

                    {/* Savings Calculator UI */}
                    {loopSavings > 0 && (
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-green-500 font-bold">Loop Savings</Text>
                            <Text className="text-green-500 font-black">-₹{loopSavings.toFixed(0)}</Text>
                        </View>
                    )}

                    {batchDiscount > 0 && (
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-brand-primary font-bold">Smart Batch Discount</Text>
                            <Text className="text-brand-primary font-black">-₹{batchDiscount}</Text>
                        </View>
                    )}

                    <View className="h-[1px] border border-dashed border-gray-300 my-3" />

                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-text-primary text-xl font-black">Total to Pay</Text>
                        <Text className="text-text-primary text-xl font-black">₹{finalTotal}</Text>
                    </View>
                </View>

                {/* 2026 Batching Notice */}
                <View className="bg-brand-primary/10 border border-brand-primary/30 p-4 rounded-3xl mb-10 flex-row items-center">
                    <View className="w-12 h-12 bg-ui-background border border-gray-200 rounded-full items-center justify-center">
                        <Truck size={24} color="#5A189A" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-brand-primary font-black text-sm uppercase">Smart Batching Enabled</Text>
                        <Text className="text-text-primary/80 text-xs font-semibold">Your rider will drop off 3 other active loops at Gate {gate || "2"} in one go.</Text>
                    </View>
                </View>

                {/* Place Order Button */}
                {!isServicable ? (
                    <View className="bg-red-500/10 border border-red-500/30 p-6 rounded-3xl items-center justify-center">
                        <Text className="text-red-500 font-black text-lg uppercase">Out of Delivery Zone</Text>
                        <Text className="text-red-500/80 font-bold text-xs mt-1">Cannot place orders from this location</Text>
                    </View>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            if (cartItems.length === 0) {
                                showNotification("Add some items before placing an order.", "info");
                                return;
                            }
                            setShowPayment(true);
                        }}
                        className="bg-brand-primary p-6 rounded-3xl flex-row items-center justify-between shadow-lg shadow-brand-primary/50">
                        <View className="flex-row items-center">
                            <ShieldCheck size={24} color="#FFFFFF" />
                            <Text className="text-white font-black text-xl ml-3 uppercase">PLACE ORDER</Text>
                        </View>
                        <ChevronRight size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                )}

                <View className="h-20" />
            </ScrollView>

            {/* Payment Selection Modal Overlay */}
            {showPayment && (
                <View className="absolute inset-0 bg-black/60 justify-end p-0" style={{ pointerEvents: 'auto' }}>
                    <TouchableOpacity className="flex-1" onPress={() => !isProcessing && setShowPayment(false)} />
                    <View className="bg-ui-background rounded-t-3xl p-6 shadow-xl w-full border-t border-gray-200">
                        <Text className="text-text-primary font-black text-2xl mb-1">Select Payment</Text>
                        <Text className="text-text-secondary font-bold text-sm mb-6">Total Amount: <Text className="text-brand-primary text-xl tracking-tight">₹{finalTotal}</Text></Text>

                        {/* Payment Options */}
                        <View className="gap-3 mb-8">
                            {[
                                { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: Smartphone },
                                { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                                { id: 'wallet', name: 'Joinzo Wallet', icon: Wallet }
                            ].map((method) => (
                                <TouchableOpacity
                                    key={method.id}
                                    onPress={() => handlePayment(method.id)}
                                    disabled={isProcessing}
                                    className={`bg-ui-surface border border-gray-200 rounded-2xl p-4 flex-row items-center justify-between ${isProcessing ? 'opacity-50' : ''}`}
                                >
                                    <View className="flex-row items-center">
                                        <View className="w-10 h-10 bg-brand-primary/10 rounded-full items-center justify-center border border-brand-primary/20">
                                            <method.icon size={20} color="#5A189A" />
                                        </View>
                                        <Text className="text-text-primary font-bold text-lg ml-4">{method.name}</Text>
                                    </View>
                                    <ChevronRight size={20} color="#9CA3AF" />
                                </TouchableOpacity>
                            ))}
                        </View>

                        {isProcessing && (
                            <View className="absolute inset-0 bg-ui-background/80 items-center justify-center rounded-t-3xl">
                                <ActivityIndicator size="large" color="#5A189A" />
                                <Text className="text-brand-primary font-black mt-4">Processing Payment...</Text>
                            </View>
                        )}
                    </View>
                </View>
            )}
        </View>
    );
};
