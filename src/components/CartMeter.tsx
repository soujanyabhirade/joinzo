import React from 'react';
import { View, Text } from 'react-native';

interface CartMeterProps {
    total: number;
    freeDeliveryThreshold?: number;
}

export const CartMeter = ({ total, freeDeliveryThreshold = 500 }: CartMeterProps) => {
    const progress = Math.min((total / freeDeliveryThreshold) * 100, 100);
    const needed = freeDeliveryThreshold - total;

    return (
        <View className="w-full">
            <View className="flex-row justify-between items-end mb-1.5">
                {needed > 0 ? (
                    <Text className="text-[10px] font-bold text-gray-500 uppercase">
                        Add <Text className="text-brand-primary font-black">₹{needed}</Text> for <Text className="text-green-600 font-black">FREE Delivery</Text>
                    </Text>
                ) : (
                    <Text className="text-[10px] font-black text-green-600 uppercase tracking-widest flex-row items-center">
                        🎉 Free Delivery Unlocked!
                    </Text>
                )}
                <Text className="text-[10px] font-black text-gray-400">₹{freeDeliveryThreshold} GOAL</Text>
            </View>
            <View className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-200/50 shadow-inner">
                <View 
                    className={`h-full rounded-full ${needed <= 0 ? 'bg-green-500' : 'bg-brand-primary'}`} 
                    style={{ width: `${progress}%` }} 
                />
            </View>
        </View>
    );
};
