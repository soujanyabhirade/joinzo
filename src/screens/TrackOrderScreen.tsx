import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Truck, MapPin, Package, CheckCircle2, ChevronLeft, PhoneCall, XCircle, ShoppingCart, Navigation, Gift, PartyPopper, LifeBuoy } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import Map, { Marker } from '../components/Map';
import { CountdownTimer } from '../components/CountdownTimer';
import { useNotification } from '../lib/NotificationContext';
import { Alert, Platform } from 'react-native';

export const TrackOrderScreen = ({ route, navigation }: any) => {
    const { showNotification } = useNotification();
    const [progress, setProgress] = useState(1);
    const [showConfetti, setShowConfetti] = useState(route.params?.triggerConfetti || false);
    const [secondsRemaining, setSecondsRemaining] = useState(60);
    const [canCancel, setCanCancel] = useState(true);
    const [spinState, setSpinState] = useState<'idle' | 'spinning' | 'won' | 'lost'>('idle');
    const [unboxingClicks, setUnboxingClicks] = useState(0);

    // Mock Driver Location
    const destination = { latitude: 12.9716, longitude: 77.5946 };
    const initialDriver = { latitude: 12.9650, longitude: 77.5880 }; 
    const [driverLoc, setDriverLoc] = useState(initialDriver);

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

    // Simulate Driver Movement when Out for Delivery
    useEffect(() => {
        if (progress === 3) {
            const endLat = destination.latitude;
            const endLng = destination.longitude;
            let currentLat = driverLoc.latitude;
            let currentLng = driverLoc.longitude;
            
            // Move driver ~60 times to get to destination
            const latStep = (endLat - currentLat) / 60;
            const lngStep = (endLng - currentLng) / 60;

            const moveInterval = setInterval(() => {
                setDriverLoc(prev => {
                    const newLat = prev.latitude + latStep;
                    const newLng = prev.longitude + lngStep;
                    
                    // Stop if reached roughly destination
                    if (Math.abs(endLat - newLat) < 0.0001 && Math.abs(endLng - newLng) < 0.0001) {
                        clearInterval(moveInterval);
                        return destination;
                    }
                    return { latitude: newLat, longitude: newLng };
                });
            }, 1000); // Step every second

            return () => clearInterval(moveInterval);
        }
    }, [progress]);

    const handleSpin = () => {
        setSpinState('spinning');
        setTimeout(() => {
            // High chance to win for dopamine hit in demo
            if (Math.random() > 0.2) {
                setSpinState('won');
                setShowConfetti(true);
                showNotification("JACKPOT! We matched your ₹30 tip!", "success");
            } else {
                setSpinState('lost');
                showNotification("Aww, better luck next time!", "info");
            }
        }, 2000);
    };

    const handleBoxTap = () => {
        setUnboxingClicks(c => c + 1);
        if (unboxingClicks === 2) {
            setShowConfetti(true);
            showNotification("Box Opened! Welcome to your digital receipt.", "success");
        }
    };

    const steps = [
        { id: 1, title: 'Order Placed', desc: 'We have received your order', icon: Package },
        { id: 2, title: 'Item Packed', desc: 'Rider is picking up from the hub', icon: CheckCircle2 },
        { id: 3, title: 'Out for Delivery', desc: 'Rider is on the way to your gate', icon: Truck },
        { id: 4, title: 'Delivered', desc: 'Order dropped at Gate 2', icon: MapPin },
    ];

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-ui-background shadow-sm justify-between">
                <View className="flex-row items-center">
                    <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                        <ChevronLeft size={28} color="#5A189A" />
                    </TouchableOpacity>
                    <Text className="text-text-primary font-black text-xl">TRACK ORDER</Text>
                </View>
                <TouchableOpacity 
                    onPress={() => navigation.navigate('Support')}
                    className="bg-brand-primary/10 px-3 py-1.5 rounded-full border border-brand-primary/20 flex-row items-center"
                >
                    <LifeBuoy size={12} color="#5A189A" />
                    <Text className="text-brand-primary font-black text-[10px] ml-1 uppercase">Get Help</Text>
                </TouchableOpacity>
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

                {/* Delivered Gamification State */}
                {progress >= 4 && (
                    <View className="mb-8">
                        {unboxingClicks < 3 ? (
                            <TouchableOpacity 
                                onPress={handleBoxTap} 
                                activeOpacity={0.8}
                                className="bg-brand-primary p-8 rounded-3xl items-center shadow-lg shadow-brand-primary/40 border border-indigo-500 overflow-hidden"
                            >
                                <View className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full" />
                                <View className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full" />
                                
                                <Package size={64} color="#FFF" />
                                <Text className="text-white font-black text-3xl mt-4 text-center tracking-tight">Your Order is Here!</Text>
                                <Text className="text-white/80 font-bold text-center mt-2 mb-4 text-sm uppercase tracking-widest">
                                    Tap {3 - unboxingClicks} more times to unbox
                                </Text>
                                
                                <View className="bg-white/20 px-6 py-3 rounded-full animate-bounce">
                                    <Text className="text-white font-black text-lg">TAP THE BOX 👆</Text>
                                </View>
                            </TouchableOpacity>
                        ) : (
                            <View className="bg-white p-6 rounded-3xl items-center shadow-lg border border-brand-primary/20">
                                <View className="w-16 h-16 bg-brand-primary/10 rounded-full items-center justify-center mb-4 border border-brand-primary/20">
                                    <PartyPopper size={32} color="#5A189A" />
                                </View>
                                <Text className="text-text-primary font-black text-3xl mt-2 text-center tracking-tight text-brand-primary">Receipt Unlocked</Text>
                                <View className="w-full bg-gray-50 p-4 rounded-2xl my-4 border border-dashed border-gray-300">
                                    <Text className="text-text-secondary font-bold text-xs uppercase mb-2">Digital Summary</Text>
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-text-primary font-bold">Items Total</Text>
                                        <Text className="text-text-primary font-black">₹399</Text>
                                    </View>
                                    <View className="flex-row justify-between mb-1">
                                        <Text className="text-text-primary font-bold">Delivery Fee</Text>
                                        <Text className="text-brand-primary font-black">FREE</Text>
                                    </View>
                                    <View className="flex-row justify-between">
                                        <Text className="text-text-primary font-bold">Rider Tip</Text>
                                        <Text className="text-text-primary font-black">₹30</Text>
                                    </View>
                                </View>

                                <Text className="text-text-secondary font-bold text-center mt-2 mb-6 text-sm">You tipped Arjun ₹30. Play our mini-game to see if Joinzo will MATCH your tip out of our own pocket!</Text>
                                
                                {spinState === 'idle' && (
                                    <TouchableOpacity 
                                        onPress={handleSpin}
                                        className="bg-brand-primary px-8 py-4 rounded-3xl flex-row items-center w-full justify-center shadow-md border-b-4 border-indigo-900"
                                    >
                                        <Gift size={20} color="#FFF" className="mr-2" />
                                        <Text className="text-white font-black text-lg uppercase tracking-widest">Spin To Double Tip</Text>
                                    </TouchableOpacity>
                                )}

                                {spinState === 'spinning' && (
                                    <View className="bg-brand-primary/50 px-8 py-4 rounded-3xl flex-row items-center w-full justify-center border border-brand-primary/30">
                                        <Text className="text-white font-black text-lg uppercase tracking-widest animate-pulse">Spinning...</Text>
                                    </View>
                                )}

                                {spinState === 'won' && (
                                    <View className="bg-green-500 px-8 py-4 rounded-3xl flex-row items-center w-full justify-center shadow-lg border-b-4 border-green-700">
                                        <Text className="text-white font-black text-lg uppercase tracking-widest">YOU WON! ₹30 MATCHED</Text>
                                    </View>
                                )}

                                {spinState === 'lost' && (
                                    <View className="bg-gray-200 px-8 py-4 rounded-3xl flex-row items-center w-full justify-center border border-gray-300">
                                        <Text className="text-text-secondary font-black text-sm uppercase tracking-widest">No Match this time</Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                )}

                {/* Live Driver Tracking Map (Only when active delivery) */}
                {progress === 3 && (
                    <View className="bg-ui-surface rounded-3xl p-2 border border-brand-primary h-64 mb-8 overflow-hidden shadow-sm shadow-brand-primary/20">
                        <View className="absolute top-4 left-4 z-10 bg-brand-primary/90 px-3 py-1.5 rounded-full flex-row items-center border border-white/20">
                            <Navigation size={12} color="#FFF" />
                            <Text className="text-white font-black text-[10px] ml-1 uppercase">Live GPS Tracking</Text>
                        </View>
                        <Map
                            style={{ flex: 1, borderRadius: 24 }}
                            initialRegion={{
                                latitude: (destination.latitude + initialDriver.latitude) / 2, // Center between start and end
                                longitude: (destination.longitude + initialDriver.longitude) / 2,
                                latitudeDelta: 0.015,
                                longitudeDelta: 0.015,
                            }}
                            userInterfaceStyle="dark"
                        >
                            {/* Destination Marker */}
                            <Marker
                                coordinate={destination}
                                title="Delivery Gate"
                            />
                            {/* Moving Driver Marker */}
                            <Marker
                                coordinate={driverLoc}
                                title="Arjun (Rider)"
                            >
                                <View className="bg-brand-primary p-2 rounded-full border-2 border-white shadow-lg">
                                    <Truck size={14} color="#FFF" />
                                </View>
                            </Marker>
                        </Map>
                    </View>
                )}

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

                {/* Oops I forgot window */}
                {canCancel && secondsRemaining > 0 && (
                    <View className="mt-8 bg-[#FFF9E6] border border-[#FFD966] rounded-3xl p-5">
                        <View className="flex-row items-center justify-between mb-3">
                            <Text className="text-[#B45309] font-black text-lg">Oops, forgot something?</Text>
                            <Text className="text-[#B45309] font-bold text-xs">{secondsRemaining}s left to add</Text>
                        </View>
                        <Text className="text-[#D97706] text-[11px] font-bold mb-4">Add these impulse items instantly with no extra delivery fee!</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="overflow-visible">
                            {[
                                { id: 101, name: 'Tic Tac Mints', price: 20 },
                                { id: 102, name: 'AA Batteries (4)', price: 150 },
                                { id: 103, name: 'Paracetamol', price: 45 },
                                { id: 104, name: 'Dairy Milk', price: 30 }
                            ].map(item => (
                                <View key={item.id} className="bg-white border border-[#FDE68A] rounded-2xl p-3 mr-3 w-32 shadow-sm">
                                    <Text className="text-text-primary font-bold text-sm h-10" numberOfLines={2}>{item.name}</Text>
                                    <View className="flex-row items-center justify-between mt-2">
                                        <Text className="text-brand-primary font-black text-sm">₹{item.price}</Text>
                                        <TouchableOpacity 
                                            onPress={() => {
                                                showNotification(`Added ${item.name} to order!`, "success");
                                            }}
                                            className="w-8 h-8 bg-brand-primary/10 rounded-full items-center justify-center border border-brand-primary/20"
                                        >
                                            <ShoppingCart size={16} color="#5A189A" />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </ScrollView>
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
