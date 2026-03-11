import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Truck, MapPin, Package, CheckCircle2, ChevronLeft, PhoneCall, XCircle } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { CountdownTimer } from '../components/CountdownTimer';
import { useNotification } from '../lib/NotificationContext';
import { Alert, Platform } from 'react-native';

export const TrackOrderScreen = ({ route, navigation }: any) => {
    const { showNotification } = useNotification();
    const [progress, setProgress] = useState(1);
    const [showConfetti, setShowConfetti] = useState(route.params?.triggerConfetti || false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);
    const [canCancel, setCanCancel] = useState(true);

    useEffect(() => {
        if (showConfetti) {
            setTimeout(() => setShowConfetti(false), 4000);
        }
    }, [showConfetti]);

    useEffect(() => {
        if (secondsRemaining > 0 && canCancel) {
            const timer = setInterval(() => setSecondsRemaining(s => s - 1), 1000);
            return () => clearInterval(timer);
        } else {
            setCanCancel(false);
        }
    }, [secondsRemaining, canCancel]);

    const handleCancelOrder = () => {
        const performCancel = () => {
            setCanCancel(false);
            showNotification("Order Cancelled successfully", "error");
            navigation.navigate("Home");
        };

        if (Platform.OS === 'web') {
            if (window.confirm("Are you sure you want to cancel your order?")) {
                performCancel();
            }
        } else {
            Alert.alert(
                "Cancel Order",
                "Are you sure you want to cancel your order?",
                [
                    { text: "No", style: "cancel" },
                    { text: "Yes", onPress: performCancel }
                ]
            );
        }
    };

    // Supabase Realtime Tracking
    useEffect(() => {
        // Fallback timer simulation in case the database isn't updated
        const timer1 = setTimeout(() => setProgress(2), 15000);
        const timer2 = setTimeout(() => setProgress(3), 30000);

        const channel = supabase
            .channel('realtime-tracking')
            .on(
                'postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'orders' },
                (payload: any) => {
                    const status = payload.new.status;
                    console.log("Realtime Update Received:", payload);
                    if (status === 'packed') setProgress(2);
                    else if (status === 'out_for_delivery') setProgress(3);
                    else if (status === 'delivered') setProgress(4);
                }
            )
            .subscribe();

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            supabase.removeChannel(channel);
        };
    }, []);

    const steps = [
        { id: 1, title: 'Order Placed', desc: 'We have received your order', icon: Package },
        { id: 2, title: 'Item Packed', desc: 'Rider is picking up from the hub', icon: CheckCircle2 },
        { id: 3, title: 'Out for Delivery', desc: 'Rider is on the way to your gate', icon: Truck },
        { id: 4, title: 'Delivered', desc: 'Order dropped at Gate 2', icon: MapPin },
    ];

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-ui-background shadow-sm">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-xl">TRACK ORDER</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                <View className="flex-row justify-between mb-6 px-1">
                    <View>
                        <Text className="text-text-secondary font-bold text-xs uppercase mb-1">Estimated Arrival</Text>
                        <Text className="text-brand-primary font-black text-3xl">7 mins</Text>
                    </View>
                    <View className="items-end justify-center">
                        <CountdownTimer minutes={10} />
                    </View>
                </View>

                {/* Status Card */}
                <View className="bg-ui-surface rounded-3xl p-6 border border-gray-200 mb-8 shadow-sm">
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
                                            ${isCompleted ? 'bg-brand-primary border-brand-primary' : 'bg-gray-100 border-gray-300'} 
                                            ${isCurrent ? 'shadow-md shadow-brand-primary/50' : ''}`}>
                                            <step.icon size={16} color={isCompleted ? "#FFFFFF" : "#9CA3AF"} />
                                        </View>
                                        {!isLast && (
                                            <View className={`w-1 h-12 ${isCompleted && progress > step.id ? 'bg-brand-primary' : 'bg-gray-200'}`} />
                                        )}
                                    </View>
                                    <View className="pt-1 pb-10">
                                        <Text className={`font-black text-lg ${isCompleted ? 'text-text-primary' : 'text-gray-400'}`}>{step.title}</Text>
                                        <Text className={`text-sm mt-1 ${isCurrent ? 'text-text-secondary font-medium' : 'text-gray-400'}`}>{step.desc}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Rider Info */}
                {progress >= 3 && (
                    <View className="bg-ui-surface rounded-3xl p-4 border border-gray-200 shadow-sm flex-row items-center justify-between">
                        <View className="flex-row items-center">
                            <View className="w-12 h-12 rounded-full bg-ui-background border border-brand-primary items-center justify-center overflow-hidden">
                                <Text className="text-brand-primary font-bold text-lg">AS</Text>
                            </View>
                            <View className="ml-3">
                                <Text className="text-text-primary font-bold">Arjun Sharma</Text>
                                <Text className="text-text-secondary text-xs">Your Delivery Rider</Text>
                            </View>
                        </View>
                        <TouchableOpacity className="w-10 h-10 bg-brand-primary/10 rounded-full items-center justify-center border border-brand-primary/30">
                            <PhoneCall size={18} color="#5A189A" />
                        </TouchableOpacity>
                    </View>
                )}

                {/* Cancellation Option */}
                {canCancel && (
                    <View className="mt-8 bg-red-50 border border-red-100 rounded-3xl p-6 items-center">
                        <XCircle size={32} color="#EF4444" />
                        <Text className="text-text-primary font-black text-lg mt-3">Mistake in Order?</Text>
                        <Text className="text-text-secondary text-sm text-center mt-1">
                            You can cancel your order within the next {secondsRemaining} seconds.
                        </Text>
                        <TouchableOpacity
                            onPress={handleCancelOrder}
                            className="mt-4 bg-red-500 px-8 py-3 rounded-2xl"
                        >
                            <Text className="text-white font-black">CANCEL ORDER</Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>

            {/* Simple CSS Confetti Mock Overlay */}
            {showConfetti && (
                <View className="absolute inset-0 bg-black/10 justify-center items-center pointer-events-none z-50">
                    <Text className="text-6xl absolute" style={{ top: '20%', left: '20%', transform: [{ rotate: '45deg' }] }}>🎉</Text>
                    <Text className="text-6xl absolute" style={{ top: '30%', right: '15%', transform: [{ rotate: '-20deg' }] }}>🎊</Text>
                    <Text className="text-6xl absolute" style={{ bottom: '40%', left: '30%', transform: [{ rotate: '15deg' }] }}>✨</Text>
                    <Text className="text-6xl absolute" style={{ bottom: '25%', right: '30%', transform: [{ rotate: '-45deg' }] }}>🎇</Text>
                    <Text className="text-6xl absolute" style={{ top: '10%', right: '40%', transform: [{ rotate: '10deg' }] }}>🎈</Text>
                    <Text className="text-xl font-black text-brand-primary bg-white/90 px-6 py-3 rounded-full mt-20 shadow-xl border border-brand-primary/20">
                        Payment Successful!
                    </Text>
                </View>
            )}
        </View>
    );
};
