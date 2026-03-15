import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ShoppingBag, MapPin, ChevronRight, Info, Clock, CheckCircle, Truck, Zap, ShieldCheck, CreditCard, Smartphone, Wallet, Users, Recycle, Gift, ChevronLeft } from 'lucide-react-native';
import Map, { Marker } from '../components/Map';
import { CountdownTimer } from '../components/CountdownTimer';
import { useCart } from '../lib/CartContext';
import { useLocation } from '../lib/LocationContext';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useNotification } from '../lib/NotificationContext';
import { SwipeButton } from '../components/SwipeButton';
import { openRazorpayCheckout, formatAmountForRazorpay, isRazorpayConfigured } from '../lib/razorpay';

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

    // Promo Code State
    const [promoCode, setPromoCode] = useState('');
    const [promoApplied, setPromoApplied] = useState(false);
    const [promoDiscount, setPromoDiscount] = useState(0);
    const [promoError, setPromoError] = useState('');

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
    const finalTotal = Math.max(0, total - batchDiscount - neighborhoodDiscount - bagReturnCredit - promoDiscount);

    // Promo Code Validation
    const PROMO_CODES: Record<string, { discount: number; type: 'flat' | 'percent'; label: string }> = {
        'JOINZO50': { discount: 50, type: 'flat', label: '₹50 OFF' },
        'FIRST100': { discount: 100, type: 'flat', label: '₹100 OFF' },
        'LOOP20': { discount: 20, type: 'percent', label: '20% OFF' },
        'WELCOME25': { discount: 25, type: 'flat', label: '₹25 OFF' },
        'MEGA200': { discount: 200, type: 'flat', label: '₹200 OFF (orders above ₹999)' },
    };

    const applyPromoCode = () => {
        const code = promoCode.trim().toUpperCase();
        const promo = PROMO_CODES[code];
        if (!promo) {
            setPromoError('Invalid promo code');
            setPromoDiscount(0);
            setPromoApplied(false);
            return;
        }
        if (code === 'MEGA200' && total < 999) {
            setPromoError('Minimum order ₹999 required for this code');
            setPromoDiscount(0);
            setPromoApplied(false);
            return;
        }
        const discount = promo.type === 'percent' ? Math.floor(total * promo.discount / 100) : promo.discount;
        setPromoDiscount(discount);
        setPromoApplied(true);
        setPromoError('');
        showNotification(`${promo.label} applied! Saving ₹${discount}`, 'success');
    };

    const removePromo = () => {
        setPromoCode('');
        setPromoDiscount(0);
        setPromoApplied(false);
        setPromoError('');
    };

    const handlePayment = async (methodId: string) => {
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            if (cartItems.length === 0) {
                throw new Error("Your cart is empty!");
            }

            // 1. Validate stock
            const itemIds = cartItems.map(item => item.id);
            const { data: stockData, error: stockError } = await supabase
                .from('products')
                .select('id, is_in_stock, name')
                .in('id', itemIds);

            if (stockError) throw stockError;

            const outOfStock = stockData?.find(p => !p.is_in_stock);
            if (outOfStock) {
                throw new Error(`${outOfStock.name} is currently out of stock.`);
            }

            // 2. Demo user bypass
            const isDemoUser = user?.id === '00000000-0000-0000-0000-000000000000';

            // 3. Insert order into Supabase
            let orderId = `demo_${Date.now()}`;
            if (!isDemoUser) {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        user_id: user?.id,
                        total_amount: finalTotal,
                        status: 'placed',
                        payment_method: methodId,
                        delivery_address: apartment || 'Not specified',
                    })
                    .select()
                    .single();

                if (orderError) throw orderError;
                orderId = orderData.id;

                // Insert order items
                const orderItemsData = cartItems.map(item => ({
                    order_id: orderData.id,
                    product_id: String(item.id),
                    quantity: item.qty,
                    price_at_order: item.price,
                    product_name: item.name,
                    type: item.type
                }));
                await supabase.from('order_items').insert(orderItemsData);
            }

            // 4. Process Payment based on method
            if (methodId === 'cod') {
                // Cash on Delivery — no gateway needed
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (!isDemoUser) {
                    await supabase.from('orders').update({ status: 'confirmed' }).eq('id', orderId);
                }
                clearCart();
                setShowPayment(false);
                if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }
                showNotification("Order placed! Pay ₹" + finalTotal + " on delivery.", "success");
                navigation.navigate("TrackOrder", { triggerConfetti: true, orderId });
            } else {
                // Razorpay — UPI / Card / Wallet
                openRazorpayCheckout({
                    amount: formatAmountForRazorpay(finalTotal),
                    description: `Joinzo Order - ${cartItems.length} items`,
                    customerEmail: user?.email || '',
                    onSuccess: async (response) => {
                        // Payment success — update order
                        if (!isDemoUser) {
                            await supabase.from('orders').update({
                                status: 'confirmed',
                                payment_method: methodId,
                            }).eq('id', orderId);
                        }
                        clearCart();
                        setShowPayment(false);
                        setIsProcessing(false);
                        if (Platform.OS !== 'web') {
                            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                        }
                        showNotification(`Payment successful! ID: ${response.razorpay_payment_id}`, "success");
                        navigation.navigate("TrackOrder", { triggerConfetti: true, orderId });
                    },
                    onFailure: (error) => {
                        setIsProcessing(false);
                        showNotification(error.message || "Payment failed. Try again.", "error");
                        // Cancel the order if payment failed
                        if (!isDemoUser) {
                            supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
                        }
                    },
                });
                return; // Don't reset isProcessing here — Razorpay callback will do it
            }

        } catch (error: any) {
            console.error("Payment Flow Error:", error);
            Alert.alert(
                "Demo Notice", 
                "We couldn't save your order to the database, but we'll show you the tracking experience anyway!",
                [{ 
                    text: "Track Order", 
                    onPress: () => {
                        clearCart();
                        setShowPayment(false);
                        navigation.navigate("TrackOrder", { triggerConfetti: true });
                    }
                }]
            );
        } finally {
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

                {/* Promo Code Section */}
                <View className="bg-ui-surface border border-gray-200 rounded-3xl p-5 mb-6 shadow-sm">
                    <View className="flex-row items-center mb-3">
                        <Gift size={18} color="#F59E0B" />
                        <Text className="text-text-primary font-black ml-2 text-xs uppercase tracking-widest">Promo Code</Text>
                    </View>
                    {promoApplied ? (
                        <View className="flex-row items-center justify-between bg-green-50 border border-green-200 p-4 rounded-2xl">
                            <View className="flex-row items-center">
                                <CheckCircle size={16} color="#059669" />
                                <Text className="text-green-700 font-black text-sm ml-2">{promoCode.toUpperCase()}</Text>
                                <Text className="text-green-600 font-bold text-xs ml-2">-₹{promoDiscount}</Text>
                            </View>
                            <TouchableOpacity onPress={removePromo} className="bg-red-500/10 px-3 py-1.5 rounded-xl">
                                <Text className="text-red-500 font-black text-[10px] uppercase">Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ) : (
                        <>
                            <View className="flex-row items-center">
                                <TextInput
                                    placeholder="Enter promo code"
                                    placeholderTextColor="#9CA3AF"
                                    className="flex-1 bg-ui-background border border-gray-200 rounded-2xl px-4 py-3.5 text-text-primary font-bold uppercase"
                                    value={promoCode}
                                    onChangeText={(t) => { setPromoCode(t); setPromoError(''); }}
                                    autoCapitalize="characters"
                                />
                                <TouchableOpacity
                                    onPress={applyPromoCode}
                                    className="ml-2 bg-brand-primary px-5 py-3.5 rounded-2xl"
                                >
                                    <Text className="text-white font-black text-xs uppercase">Apply</Text>
                                </TouchableOpacity>
                            </View>
                            {promoError !== '' && (
                                <Text className="text-red-500 font-bold text-xs mt-2 ml-1">{promoError}</Text>
                            )}
                            <Text className="text-text-secondary text-[10px] font-medium mt-2 ml-1">Try: JOINZO50, FIRST100, LOOP20</Text>
                        </>
                    )}
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
                                { id: 'upi', name: 'UPI (GPay, PhonePe)', icon: Smartphone, subtitle: 'Razorpay Secure' },
                                { id: 'card', name: 'Credit / Debit Card', icon: CreditCard, subtitle: 'Razorpay Secure' },
                                { id: 'wallet', name: 'Joinzo Wallet', icon: Wallet, subtitle: 'In-app Balance' },
                                { id: 'cod', name: 'Cash / Pay on Delivery', icon: Truck, subtitle: 'Pay when order arrives' }
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
                                            <View className="ml-4">
                                                <Text className={`font-bold text-lg ${selectedMethod === method.id ? 'text-brand-primary' : 'text-text-primary'}`}>{method.name}</Text>
                                                <View className="flex-row items-center">
                                                    <Text className="text-text-secondary text-[10px] font-bold uppercase">{method.subtitle}</Text>
                                                    {(method.id === 'upi' || method.id === 'card') && (
                                                        <View className="bg-green-100 px-1 rounded ml-2">
                                                            <Text className="text-green-700 font-black text-[8px] uppercase">Offers Available</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            </View>
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
