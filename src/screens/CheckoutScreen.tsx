import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ShoppingBag, MapPin, ChevronRight, Info, Clock, CheckCircle, Truck, Zap, ShieldCheck } from 'lucide-react-native';
import MapView, { Marker } from 'react-native-maps';
import { CountdownTimer } from '../components/CountdownTimer';

export const CheckoutScreen = ({ navigation }: any) => {
    const [apartment, setApartment] = useState('');
    const [gate, setGate] = useState('');

    const cart = [
        { id: 1, name: "Organic Whole Milk", price: 89, qty: 1, type: "Loop" },
        { id: 2, name: "Hass Avocado", price: 180, qty: 1, type: "Loop" },
    ];

    const total = cart.reduce((acc, item) => acc + item.price, 0);

    return (
        <View className="flex-1 bg-deep-charcoal p-4">
            <ScrollView showsVerticalScrollIndicator={false}>
                <View className="flex-row justify-between items-center mt-4 mb-6">
                    <Text className="text-white font-black text-3xl">GATE-DROP</Text>
                    <CountdownTimer minutes={10} />
                </View>

                {/* Address Section */}
                <View className="bg-soft-gray border border-gray-800 rounded-3xl p-5 mb-6 overflow-hidden">
                    <View className="flex-row items-center mb-4">
                        <MapPin size={20} color="#39FF14" />
                        <Text className="text-white font-bold ml-2">Delivery Address</Text>
                    </View>

                    {/* Map Integration */}
                    <View className="h-32 bg-deep-charcoal rounded-2xl border border-gray-800 mb-4 overflow-hidden">
                        <MapView
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
                        </MapView>
                    </View>

                    <TextInput
                        placeholder="Apartment / Complex Name"
                        placeholderTextColor="#6B7280"
                        className="bg-deep-charcoal border border-gray-800 rounded-2xl px-4 py-4 text-white font-medium mb-3"
                        value={apartment}
                        onChangeText={setApartment}
                    />

                    <View className="flex-row space-x-3">
                        <TextInput
                            placeholder="Drop-off Gate #"
                            placeholderTextColor="#6B7280"
                            keyboardType="numeric"
                            className="flex-1 bg-deep-charcoal border border-gray-800 rounded-2xl px-4 py-4 text-white font-black text-lg"
                            value={gate}
                            onChangeText={setGate}
                        />
                        <View className="flex-1 items-center justify-center bg-neon-green/10 border border-neon-green/30 rounded-2xl p-2">
                            <Text className="text-neon-green text-[10px] font-black uppercase text-center">Batching logic:</Text>
                            <Text className="text-white text-xs text-center font-bold">Orders for Gate {gate || "?"} will arrive together.</Text>
                        </View>
                    </View>
                </View>

                {/* Cart Summary */}
                <View className="bg-soft-gray border border-gray-800 rounded-3xl p-5 mb-6">
                    <Text className="text-gray-400 font-bold text-xs uppercase mb-4 tracking-widest">Order Summary</Text>
                    {cart.map(item => (
                        <View key={item.id} className="flex-row justify-between items-center mb-4">
                            <View className="flex-row items-center">
                                <View className="bg-deep-charcoal px-2 py-1 rounded-md mr-3">
                                    <Text className="text-neon-green font-black text-xs">{item.qty}x</Text>
                                </View>
                                <View>
                                    <Text className="text-white font-bold">{item.name}</Text>
                                    <Text className="text-neon-green text-[10px] font-bold uppercase">{item.type} PRICE APPLIED</Text>
                                </View>
                            </View>
                            <Text className="text-white font-black">₹{item.price}</Text>
                        </View>
                    ))}

                    <View className="h-[1px] bg-gray-800 my-4" />

                    <View className="flex-row justify-between items-center">
                        <Text className="text-gray-400 font-bold">Gate-Drop Fee</Text>
                        <Text className="text-neon-green font-black">FREE</Text>
                    </View>
                    <View className="flex-row justify-between items-center mt-2">
                        <Text className="text-white text-xl font-black">Total</Text>
                        <Text className="text-neon-green text-xl font-black">₹{total}</Text>
                    </View>
                </View>

                {/* 2026 Batching Notice */}
                <View className="bg-neon-green border border-neon-green/50 p-4 rounded-3xl mb-10 flex-row items-center">
                    <View className="w-12 h-12 bg-deep-charcoal rounded-full items-center justify-center">
                        <Truck size={24} color="#39FF14" />
                    </View>
                    <View className="ml-4 flex-1">
                        <Text className="text-deep-charcoal font-black text-sm uppercase">Smart Batching Enabled</Text>
                        <Text className="text-deep-charcoal/80 text-xs font-semibold">Your rider will drop off 3 other active loops at Gate {gate || "2"} in one go.</Text>
                    </View>
                </View>

                {/* Place Order Button */}
                <TouchableOpacity onPress={() => navigation.navigate("TrackOrder")} className="bg-neon-green p-6 rounded-3xl flex-row items-center justify-between shadow-2xl shadow-neon-green/50">
                    <View className="flex-row items-center">
                        <ShieldCheck size={24} color="#121212" />
                        <Text className="text-deep-charcoal font-black text-xl ml-3 uppercase">PLACE ORDER</Text>
                    </View>
                    <ChevronRight size={24} color="#121212" />
                </TouchableOpacity>

                <View className="h-20" />
            </ScrollView>
        </View>
    );
};
