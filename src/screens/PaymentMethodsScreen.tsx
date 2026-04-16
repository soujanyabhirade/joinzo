import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { ChevronLeft, CreditCard, Plus, Smartphone, Trash2, ShieldCheck, CheckCircle2 } from 'lucide-react-native';
import { useNotification } from '../lib/NotificationContext';

const INITIAL_CARDS = [
    { id: '1', type: 'VISA', last4: '4242', expiry: '12/25', isDefault: true },
    { id: '2', type: 'MASTERCARD', last4: '8888', expiry: '09/24', isDefault: false }
];

export const PaymentMethodsScreen = ({ navigation }: any) => {
    const [cards, setCards] = useState(INITIAL_CARDS);
    const { showNotification } = useNotification();

    const removeCard = (id: string) => {
        Alert.alert(
            "Remove Card",
            "Are you sure you want to delete this payment method?",
            [
                { text: "Cancel", style: "cancel" },
                { text: "Remove", style: "destructive", onPress: () => setCards(cards.filter(c => c.id !== id)) }
            ]
        );
    };

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <View>
                    <Text className="text-text-primary font-black text-xl">PAYMENT METHODS</Text>
                    <Text className="text-text-secondary font-bold text-[10px] uppercase tracking-widest">Manage your saved cards & UPI</Text>
                </View>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="p-6">
                    <Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest mb-4">Saved Cards</Text>
                    
                    {cards.map((card) => (
                        <View key={card.id} className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm">
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <View className="w-12 h-8 bg-gray-50 border border-gray-200 rounded-md items-center justify-center mr-4">
                                        <Text className="text-[10px] font-black text-gray-400">{card.type}</Text>
                                    </View>
                                    <View>
                                        <Text className="text-text-primary font-bold text-base">•••• {card.last4}</Text>
                                        <Text className="text-text-secondary text-[10px] font-bold uppercase">Expires {card.expiry}</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center">
                                    {card.isDefault && (
                                        <View className="mr-3 bg-green-50 px-2 py-1 rounded-lg border border-green-100">
                                            <Text className="text-green-600 font-black text-[8px] uppercase">Default</Text>
                                        </View>
                                    )}
                                    <TouchableOpacity onPress={() => removeCard(card.id)}>
                                        <Trash2 size={18} color="#EF4444" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    ))}

                    <TouchableOpacity onPress={() => showNotification("Card/UPI management coming soon. Use Razorpay at checkout for now.", "info")} className="bg-brand-primary/5 border border-brand-primary/20 border-dashed rounded-3xl p-5 flex-row items-center justify-center mb-10">
                        <Plus size={20} color="#5A189A" />
                        <Text className="text-brand-primary font-black ml-2 uppercase tracking-tight">Add New Card</Text>
                    </TouchableOpacity>

                    <Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest mb-4">UPI IDs</Text>
                    <View className="bg-white border border-gray-100 rounded-3xl p-5 mb-4 shadow-sm flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-10 h-10 bg-indigo-50 border border-indigo-100 rounded-2xl items-center justify-center mr-4">
                                <Smartphone size={20} color="#5A189A" />
                            </View>
                            <View>
                                <Text className="text-text-primary font-bold">akash@oksbi</Text>
                                <Text className="text-text-secondary text-[10px] font-bold uppercase">Verified UPI ID</Text>
                            </View>
                        </View>
                        <CheckCircle2 size={20} color="#10B981" />
                    </View>

                    <TouchableOpacity onPress={() => showNotification("Card/UPI management coming soon. Use Razorpay at checkout for now.", "info")} className="bg-brand-primary/5 border border-brand-primary/20 border-dashed rounded-3xl p-5 flex-row items-center justify-center">
                        <Plus size={20} color="#5A189A" />
                        <Text className="text-brand-primary font-black ml-2 uppercase tracking-tight">Connect New UPI ID</Text>
                    </TouchableOpacity>
                </View>

                <View className="px-6 pb-12 items-center flex-row justify-center">
                    <ShieldCheck size={16} color="#9CA3AF" />
                    <Text className="text-gray-400 text-[10px] font-bold uppercase tracking-widest ml-1">Secure Encrypted Payments</Text>
                </View>
            </ScrollView>
        </View>
    );
};
