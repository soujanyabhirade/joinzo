import React, { useState, useRef } from 'react';
import { View, Text, PanResponder, Animated, Platform, TouchableWithoutFeedback } from 'react-native';
import { ArrowRight, CheckCircle2 } from 'lucide-react-native';

export const SwipeButton = ({ onSwipeSuccess, title, amount }: any) => {
    const [isConfirmed, setIsConfirmed] = useState(false);
    const pan = useRef(new Animated.ValueXY()).current;
    
    // Total width of the track roughly. We'll use 250 as the drag limit.
    const dragLimit = 240;

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => !isConfirmed,
        onPanResponderMove: (e, gesture) => {
            if (isConfirmed) return;
            // Only allow dragging to the right, up to the limit
            if (gesture.dx > 0 && gesture.dx < dragLimit) {
                pan.setValue({ x: gesture.dx, y: 0 });
            }
        },
        onPanResponderRelease: (e, gesture) => {
            if (isConfirmed) return;
            
            if (gesture.dx > dragLimit * 0.8) {
                // Success: snap to end
                Animated.timing(pan, {
                    toValue: { x: dragLimit, y: 0 },
                    duration: 200,
                    useNativeDriver: false // width/layout animations need false
                }).start(() => {
                    setIsConfirmed(true);
                    if (onSwipeSuccess) onSwipeSuccess();
                });
            } else {
                // Failure: snap back to start
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    tension: 40,
                    friction: 5,
                    useNativeDriver: false
                }).start();
            }
        }
    });

    const activeWidth = pan.x.interpolate({
        inputRange: [0, dragLimit],
        outputRange: [56, dragLimit + 56], // 56 is the width of the thumb
        extrapolate: 'clamp'
    });

    if (Platform.OS === 'web') {
        // Fallback for better web mouse interaction if PanResponder is jittery
        return (
            <View className="w-full bg-brand-primary/10 h-16 rounded-full border border-brand-primary/30 justify-center overflow-hidden relative shadow-inner">
                <Text className="text-brand-primary/60 font-black text-sm uppercase tracking-widest absolute text-center w-full z-0">
                    {isConfirmed ? "Processing..." : `Click to ${title}`}
                </Text>
                
                <Animated.View style={{ width: isConfirmed ? '100%' : '0%' }} className="absolute h-full bg-brand-primary rounded-full z-0 transition-all duration-300 ease-out" />
                
                <View 
                    className="absolute left-1 z-10"
                    {...panResponder.panHandlers}
                >
                    <TouchableWithoutFeedback 
                        onPress={() => {
                            if (!isConfirmed) {
                                setIsConfirmed(true);
                                if (onSwipeSuccess) onSwipeSuccess();
                            }
                        }}
                    >
                        <View className={`w-14 h-14 rounded-full flex-row items-center justify-center shadow-md cursor-pointer transition-colors duration-300
                            ${isConfirmed ? 'bg-white/20' : 'bg-brand-primary'}`} 
                        >
                            {isConfirmed ? (
                                <CheckCircle2 size={24} color="#FFF" />
                            ) : (
                                <ArrowRight size={24} color="#FFF" />
                            )}
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                {isConfirmed && (
                    <Text className="text-white font-black text-lg absolute text-center w-full z-10 pointer-events-none">
                        ORDER CONFIRMED
                    </Text>
                )}
            </View>
        );
    }

    return (
        <View className="w-full bg-brand-primary/10 h-16 rounded-full border border-brand-primary/30 justify-center overflow-hidden relative shadow-inner px-1">
            <Text className="text-brand-primary/60 font-black text-sm uppercase tracking-widest absolute text-center w-full z-0">
                {title} • ₹{amount}
            </Text>
            
            <Animated.View 
                style={{ width: activeWidth }} 
                className={`absolute left-0 h-16 rounded-full z-0 ${isConfirmed ? 'bg-green-500' : 'bg-brand-primary/20'}`} 
            />
            
            <Animated.View 
                style={{ transform: [{ translateX: pan.x }] }}
                className="absolute left-1 z-10"
                {...panResponder.panHandlers}
            >
                <View className={`w-14 h-14 rounded-full flex-row items-center justify-center shadow-md ${isConfirmed ? 'bg-green-500 border border-white/40' : 'bg-brand-primary'}`}>
                    {isConfirmed ? (
                        <CheckCircle2 size={24} color="#FFF" />
                    ) : (
                        <ArrowRight size={24} color="#FFF" />
                    )}
                </View>
            </Animated.View>
            
            {isConfirmed && (
                <Text className="text-white font-black text-lg absolute text-center w-full z-10 pointer-events-none">
                    CONFIRMED
                </Text>
            )}
        </View>
    );
};
