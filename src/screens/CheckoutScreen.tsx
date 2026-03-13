import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { ShoppingBag, MapPin, ChevronRight, Info, Clock, CheckCircle, Truck, Zap, ShieldCheck, CreditCard, Smartphone, Wallet, Users, Recycle, Gift, ChevronLeft } from 'lucide-react-native';
import Map, { Marker } from '../components/Map';
import { CountdownTimer } from '../components/CountdownTimer';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';
import { SwipeButton } from '../components/SwipeButton';

export const CheckoutScreen = ({ navigation }: any) => {
    const [apartment, setApartment] = useState('');
    const [gate, setGate] = useState('');
    const [instructions, setInstructions] = useState('');
    const [showPayment, setShowPayment] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isNeighborhoodDrop, setIsNeighborhoodDrop] = useState(false);
    const [bagsToReturn, setBagsToReturn] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [cardCVV, setCardCVV] = useState('');
    
    // Gifting Mode State
    const [isGift, setIsGift] = useState(false);
    const [giftMessage, setGiftMessage] = useState('');
    const [giftCard, setGiftCard] = useState<'birthday' | 'getwell' | 'congrats' | null>(null);

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

    // 4. Neighborhood & Eco Features
    const neighborhoodDiscount = isNeighborhoodDrop ? total * 0.15 : 0;
    const bagReturnCredit = bagsToReturn * 5;

    // Final Math
    const finalTotal = Math.max(0, total - batchDiscount - neighborhoodDiscount - bagReturnCredit);

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
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ChevronLeft size={28} color="#5A189A" />
                    </TouchableOpacity>
                    <Text className="text-text-primary font-black text-3xl flex-1">GATE-DROP</Text>
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

                {/* Community & Eco Features */}
                <View className="mb-6 space-y-4">
                    {/* Neighborhood Drop */}
                    <TouchableOpacity 
                        onPress={() => setIsNeighborhoodDrop(!isNeighborhoodDrop)}
                        className={`bg-ui-surface border rounded-3xl p-5 mb-4 flex-row items-center justify-between shadow-sm overflow-hidden ${isNeighborhoodDrop ? 'border-brand-primary' : 'border-gray-200'}`}
                    >
                        <View className="flex-1 pr-4">
                            <View className="flex-row items-center mb-1">
                                <Users size={16} color={isNeighborhoodDrop ? "#5A189A" : "#9CA3AF"} />
                                <Text className={`font-black ml-2 text-xs ${isNeighborhoodDrop ? 'text-brand-primary' : 'text-text-secondary'}`}>NEIGHBORHOOD MATCH</Text>
                            </View>
                            <Text className="text-text-primary text-xs font-bold mt-1">Pool your order with neighbors within 15 mins for <Text className="text-brand-primary">15% OFF</Text>.</Text>
                        </View>
                        <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isNeighborhoodDrop ? 'bg-brand-primary border-brand-primary' : 'border-gray-300'}`}>
                            {isNeighborhoodDrop && <CheckCircle size={14} color="#FFFFFF" />}
                        </View>
                    </TouchableOpacity>

                    {/* Return Bags */}
                    <View className="bg-ui-surface border border-gray-200 rounded-3xl p-5 shadow-sm">
                        <View className="flex-row items-center mb-3">
                            <Recycle size={18} color="#10B981" />
                            <Text className="text-text-primary font-black ml-2 text-xs">RETURN DELIVERY BAGS</Text>
                        </View>
                        <Text className="text-text-secondary text-[11px] font-bold mb-4">Give your empty Joinzo bags to the rider for instant wallet credit (₹5/bag).</Text>
                        
                        <View className="flex-row items-center justify-between bg-ui-background p-2 rounded-2xl border border-gray-200">
                            <TouchableOpacity 
                                onPress={() => setBagsToReturn(Math.max(0, bagsToReturn - 1))}
                                className="w-10 h-10 bg-white rounded-xl items-center justify-center shadow-sm"
                            >
                                <Text className="text-text-primary font-black text-xl">-</Text>
                            </TouchableOpacity>
                            <View className="items-center">
                                <Text className="text-text-primary font-black text-xl">{bagsToReturn}</Text>
                                <Text className="text-text-secondary text-[10px] font-bold uppercase">Bags</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => setBagsToReturn(bagsToReturn + 1)}
                                className="w-10 h-10 bg-brand-primary rounded-xl items-center justify-center shadow-sm"
                            >
                                <Text className="text-white font-black text-xl mb-1">+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
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

                    {neighborhoodDiscount > 0 && (
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-brand-primary font-bold">Neighborhood Match (15%)</Text>
                            <Text className="text-brand-primary font-black">-₹{neighborhoodDiscount.toFixed(0)}</Text>
                        </View>
                    )}

                    {bagReturnCredit > 0 && (
                        <View className="flex-row justify-between items-center mb-2">
                            <Text className="text-green-500 font-bold">Bag Return Credit</Text>
                            <Text className="text-green-500 font-black">-₹{bagReturnCredit}</Text>
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
                        <View className="gap-3 mb-6">
                            {[
                                { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: Smartphone },
                                { id: 'card', name: 'Credit / Debit Card', icon: CreditCard },
                                { id: 'wallet', name: 'Joinzo Wallet', icon: Wallet }
                            ].map((method) => (
                                <View key={method.id} className="mb-2">
                                    <TouchableOpacity
                                        onPress={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                                        disabled={isProcessing}
                                        className={`bg-ui-surface border rounded-2xl p-4 flex-row items-center justify-between shadow-sm ${selectedMethod === method.id ? 'border-brand-primary bg-brand-primary/5' : 'border-gray-200'} ${isProcessing ? 'opacity-50' : ''}`}
                                    >
                                        <View className="flex-row items-center">
                                            <View className={`w-10 h-10 rounded-full items-center justify-center border ${selectedMethod === method.id ? 'bg-brand-primary border-brand-primary' : 'bg-ui-background border-gray-200'}`}>
                                                <method.icon size={20} color={selectedMethod === method.id ? "#FFF" : "#5A189A"} />
                                            </View>
                                            <Text className={`font-bold text-lg ml-4 ${selectedMethod === method.id ? 'text-brand-primary' : 'text-text-primary'}`}>{method.name}</Text>
                                        </View>
                                        {selectedMethod !== 'card' || method.id !== 'card' ? (
                                             <ChevronRight size={20} color={selectedMethod === method.id ? "#5A189A" : "#9CA3AF"} />
                                        ) : null}
                                    </TouchableOpacity>

                                    {/* Expandable Mock Card Form */}
                                    {selectedMethod === 'card' && method.id === 'card' && (
                                        <View className="bg-ui-surface p-4 rounded-b-2xl border-x border-b border-brand-primary/20 mt-[-8px] pt-4 mb-2">
                                            <Text className="text-text-secondary text-[10px] font-bold uppercase mb-2 ml-1 mt-2">Card Details (Mock)</Text>
                                            <TextInput
                                                className="bg-ui-background border border-gray-200 rounded-xl px-4 py-3 text-text-primary font-medium mb-3"
                                                placeholder="16-Digit Card Number"
                                                keyboardType="numeric"
                                                maxLength={16}
                                                value={cardNumber}
                                                onChangeText={setCardNumber}
                                            />
                                            <View className="flex-row gap-3 mb-4">
                                                <TextInput
                                                    className="flex-1 bg-ui-background border border-gray-200 rounded-xl px-4 py-3 text-text-primary font-medium text-center"
                                                    placeholder="MM/YY"
                                                    keyboardType="numeric"
                                                    maxLength={5}
                                                    value={cardExpiry}
                                                    onChangeText={setCardExpiry}
                                                />
                                                <TextInput
                                                    className="flex-1 bg-ui-background border border-gray-200 rounded-xl px-4 py-3 text-text-primary font-medium text-center"
                                                    placeholder="CVV"
                                                    keyboardType="numeric"
                                                    maxLength={3}
                                                    secureTextEntry
                                                    value={cardCVV}
                                                    onChangeText={setCardCVV}
                                                />
                                            </View>
                                        </View>
                                    )}
                                </View>
                            ))}
                        </View>

                        {/* GIFTING CORE FEATURE */}
                        <View className="bg-ui-surface p-6 mb-6 rounded-3xl border border-pink-100 shadow-sm">
                            <View className="flex-row items-center justify-between mb-2">
                                <View className="flex-row items-center">
                                    <View className="w-8 h-8 rounded-full bg-pink-500/10 items-center justify-center mr-3 border border-pink-500/20">
                                        <Gift size={16} color="#EC4899" />
                                    </View>
                                    <Text className="text-text-primary font-black text-lg">Send as a Gift?</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => setIsGift(!isGift)}
                                    className={`w-12 h-6 rounded-full px-1 justify-center transition-colors ${isGift ? 'bg-pink-500' : 'bg-gray-200'}`}
                                >
                                    <View className={`w-4 h-4 rounded-full bg-white transition-transform ${isGift ? 'translate-x-6' : 'translate-x-0'}`} />
                                </TouchableOpacity>
                            </View>

                            {isGift && (
                                <View className="mt-4 bg-pink-50 rounded-2xl p-4 border border-pink-100">
                                    <Text className="text-pink-800 font-bold mb-3 uppercase tracking-widest text-xs">Select Virtual Card</Text>
                                    <View className="flex-row justify-between mb-4">
                                        {['birthday', 'getwell', 'congrats'].map((type) => (
                                            <TouchableOpacity 
                                                key={type}
                                                onPress={() => setGiftCard(type as any)}
                                                className={`flex-1 py-3 rounded-xl border items-center mx-1 ${giftCard === type ? 'bg-pink-100 border-pink-400' : 'bg-white border-pink-100'}`}
                                            >
                                                <Text className="text-xl mb-1">{type === 'birthday' ? '🎂' : type === 'getwell' ? '🍲' : '🎉'}</Text>
                                                <Text className={`text-[10px] font-black uppercase ${giftCard === type ? 'text-pink-600' : 'text-gray-400'}`}>{type}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                    <TextInput
                                        className="bg-white border border-pink-200 rounded-xl p-3 text-text-primary font-medium min-h-[80px]"
                                        placeholder="Write a warm message..."
                                        placeholderTextColor="#F472B6"
                                        multiline
                                        value={giftMessage}
                                        onChangeText={setGiftMessage}
                                        textAlignVertical="top"
                                    />
                                </View>
                            )}
                        </View>

                        {/* Master Swipe-To-Pay Button */}
                        {(!selectedMethod || isProcessing) ? (
                            <TouchableOpacity
                                disabled={true}
                                className="py-4 rounded-2xl flex-row justify-center shadow-lg mb-6 bg-gray-300"
                            >
                                <ShieldCheck size={20} color="#FFFFFF" className="mr-2" />
                                <Text className="text-white font-black text-lg">
                                    {isProcessing ? 'Processing SECURELY...' : `SELECT PAYMENT METHOD`}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <View className="mb-6">
                                <SwipeButton 
                                    title="Swipe to Confirm Order" 
                                    amount={finalTotal} 
                                    onSwipeSuccess={() => {
                                        if (selectedMethod === 'card' && (cardNumber.length < 16 || cardExpiry.length < 5 || cardCVV.length < 3)) {
                                            Alert.alert("Invalid Card Details", "Please fill out the mock card details completely (16 digits, MM/YY, CVV).");
                                            return;
                                        }
                                        handlePayment(selectedMethod || 'wallet');
                                    }} 
                                />
                            </View>
                        )}

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
