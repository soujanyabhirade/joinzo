import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Truck, MapPin, Package, CheckCircle2, ChevronLeft, PhoneCall } from 'lucide-react-native';

export const TrackOrderScreen = ({ navigation }: any) => {
    const [progress, setProgress] = useState(1);

    // Simulate order progress
    useEffect(() => {
        const timer1 = setTimeout(() => setProgress(2), 3000);
        const timer2 = setTimeout(() => setProgress(3), 8000);
        const timer3 = setTimeout(() => setProgress(4), 15000);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);

    const steps = [
        { id: 1, title: 'Order Placed', desc: 'We have received your order', icon: Package },
        { id: 2, title: 'Item Packed', desc: 'Rider is picking up from the hub', icon: CheckCircle2 },
        { id: 3, title: 'Out for Delivery', desc: 'Rider is on the way to your gate', icon: Truck },
        { id: 4, title: 'Delivered', desc: 'Order dropped at Gate 2', icon: MapPin },
    ];

    return (
        <View className="flex-1 bg-deep-charcoal">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-black text-xl">TRACK ORDER</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* Status Card */}
                <View className="bg-soft-gray rounded-3xl p-6 border border-gray-800 mb-8">
                    <View className="flex-row justify-between mb-8">
                        <View>
                            <Text className="text-gray-400 font-bold text-xs uppercase mb-1">Estimated Arrival</Text>
                            <Text className="text-neon-green font-black text-3xl">7 mins</Text>
                        </View>
                        <View className="bg-deep-charcoal px-3 py-2 rounded-xl justify-center border border-gray-700">
                            <Text className="text-white font-bold text-xs">Gate 2</Text>
                        </View>
                    </View>

                    {/* Timeline */}
                    <View className="pl-2">
                        {steps.map((step, index) => {
                            const isCompleted = progress >= step.id;
                            const isCurrent = progress === step.id;
                            const isLast = index === steps.length - 1;

                            return (
                                <View key={step.id} className="flex-row">
                                    <View className="items-center mr-4">
                                        <View className={`w-8 h-8 rounded-full items-center justify-center border-2 
                                            ${isCompleted ? 'bg-neon-green border-neon-green' : 'bg-deep-charcoal border-gray-700'} 
                                            ${isCurrent ? 'shadow-lg shadow-neon-green' : ''}`}>
                                            <step.icon size={16} color={isCompleted ? "#121212" : "#9CA3AF"} />
                                        </View>
                                        {!isLast && (
                                            <View className={`w-1 h-12 ${isCompleted ? 'bg-neon-green' : 'bg-gray-700'}`} />
                                        )}
                                    </View>
                                    <View className="pt-1 pb-10">
                                        <Text className={`font-black text-lg ${isCompleted ? 'text-white' : 'text-gray-500'}`}>{step.title}</Text>
                                        <Text className={`text-sm mt-1 ${isCurrent ? 'text-gray-300 font-medium' : 'text-gray-600'}`}>{step.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Rider Info */}
                {progress >= 3 && (
                    <View className="bg-soft-gray rounded-3xl p-4 border border-gray-800 flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-full bg-deep-charcoal border border-neon-green items-center justify-center overflow-hidden">
                                <Text className="text-neon-green font-bold text-lg">AS</Text>
                            </View>
                            <View className="ml-3">
                                <Text className="text-white font-bold">Arjun Sharma</Text>
                                <Text className="text-gray-400 text-xs">Your Delivery Rider</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="w-10 h-10 bg-neon-green/20 rounded-full items-center justify-center border border-neon-green/50">
                            <PhoneCall size={18} color="#39FF14" />
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </View>
    );
};
