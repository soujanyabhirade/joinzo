import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, FlatList, Animated, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Users, Zap, ShieldCheck, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

const SLIDES = [
    {
        id: '1',
        title: 'JOIN THE LOOP',
        subtitle: 'Shop with your neighbors at the same gate. The more people join, the lower the price drops for everyone.',
        icon: Users,
        color: '#5A189A',
        image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '2',
        title: 'LIGHTNING SPEED',
        subtitle: '10-minute delivery to your apartment gate. We use local dark stores to ensure everything is fresh and fast.',
        icon: Zap,
        color: '#EA580C',
        image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '3',
        title: 'GATE-DROP SAFETY',
        subtitle: 'No more confusing delivery calls. Your rider drops orders at a secure common gate in one optimized batch.',
        icon: ShieldCheck,
        color: '#10B981',
        image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800'
    }
];

export const OnboardingScreen = ({ navigation }: any) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const scrollX = useRef(new Animated.Value(0)).current;
    const slidesRef = useRef(null);

    const viewableItemsChanged = useRef(({ viewableItems }: any) => {
        setCurrentIndex(viewableItems[0].index);
    }).current;

    const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

    const completeOnboarding = async () => {
        navigation.replace('BuildingSelection');
    };

    const nextSlide = () => {
        if (currentIndex < SLIDES.length - 1) {
            (slidesRef.current as any).scrollToIndex({ index: currentIndex + 1 });
        } else {
            completeOnboarding();
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-white">
            <View className="flex-[3]">
                <FlatList
                    data={SLIDES}
                    renderItem={({ item }) => (
                        <View style={{ width }} className="flex-1 items-center px-8">
                            <View className="w-full h-[350px] rounded-[48px] overflow-hidden mt-8 shadow-2xl">
                                <Image 
                                    source={{ uri: item.image }} 
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                                <View className="absolute inset-0 bg-black/20" />
                                <View 
                                    className="absolute bottom-8 left-8 w-16 h-16 rounded-2xl items-center justify-center border border-white/40 shadow-xl"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <item.icon size={32} color="#FFF" />
                                </View>
                            </View>
                            
                            <View className="mt-12 w-full">
                                <Text className="text-text-primary font-black text-4xl tracking-tighter mb-4 italic">
                                    {item.title}
                                </Text>
                                <Text className="text-text-secondary font-bold text-lg leading-7">
                                    {item.subtitle}
                                </Text>
                            </View>
                        </View>
                    )}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    pagingEnabled
                    bounces={false}
                    keyExtractor={(item) => item.id}
                    onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
                        useNativeDriver: false,
                    })}
                    onViewableItemsChanged={viewableItemsChanged}
                    viewabilityConfig={viewConfig}
                    ref={slidesRef}
                />
            </View>

            <View className="flex-1 justify-between px-8 pb-12">
                {/* Pagination Dots */}
                <View className="flex-row items-center justify-center space-x-2">
                    {SLIDES.map((_, i) => {
                        const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
                        const dotWidth = scrollX.interpolate({
                            inputRange,
                            outputRange: [10, 30, 10],
                            extrapolate: 'clamp',
                        });
                        const opacity = scrollX.interpolate({
                            inputRange,
                            outputRange: [0.3, 1, 0.3],
                            extrapolate: 'clamp',
                        });
                        return (
                            <Animated.View 
                                key={i} 
                                style={{ width: dotWidth, opacity, backgroundColor: SLIDES[i].color }} 
                                className="h-2.5 rounded-full" 
                            />
                        );
                    })}
                </View>

                {/* Footer Buttons */}
                <View className="flex-row items-center justify-between">
                    <TouchableOpacity onPress={completeOnboarding}>
                        <Text className="text-text-secondary font-black tracking-widest uppercase">Skip</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={nextSlide}
                        className="bg-brand-primary w-20 h-20 rounded-full items-center justify-center shadow-2xl shadow-brand-primary/60"
                        style={{ backgroundColor: SLIDES[currentIndex].color }}
                    >
                        <ChevronRight size={32} color="#FFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};
