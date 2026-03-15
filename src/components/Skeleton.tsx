import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

interface SkeletonItemProps {
    width?: any;
    height?: any;
    borderRadius?: number;
    className?: string;
}

export const SkeletonItem = ({ width = '100%', height = 20, borderRadius = 8, className = "" }: SkeletonItemProps) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 0.7,
                    duration: 800,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 800,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, [opacity]);

    return (
        <Animated.View
            style={[
                { width, height, borderRadius, opacity, backgroundColor: '#E5E7EB' },
            ]}
            className={className}
        />
    );
};

export const ProductSkeleton = () => (
    <View className="bg-white/50 border border-gray-100 rounded-3xl p-4 w-[48%] mb-4">
        <SkeletonItem height={128} borderRadius={16} className="mb-3" />
        <SkeletonItem width="80%" height={16} className="mb-2" />
        <SkeletonItem width="40%" height={12} className="mb-4" />
        <View className="flex-row justify-between items-center bg-gray-100/50 p-2 rounded-xl">
            <SkeletonItem width="40%" height={20} />
            <SkeletonItem width="40%" height={20} />
        </View>
        <SkeletonItem height={48} borderRadius={16} className="mt-3" />
    </View>
);
