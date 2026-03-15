import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, Modal, Dimensions } from 'react-native';
import { X, ShoppingCart, Users, Zap, Info, ShieldCheck, Truck } from 'lucide-react-native';

interface ProductDetailModalProps {
    visible: boolean;
    onClose: () => void;
    product: {
        id: number;
        name: string;
        priceSolo: number;
        priceLoop: number;
        image: string;
        weight?: string;
    };
    onAddToCart: (type: 'Solo' | 'Loop') => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export const ProductDetailModal = ({ visible, onClose, product, onAddToCart }: ProductDetailModalProps) => {
    if (!product) return null;

    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View className="flex-1 justify-end bg-black/50">
                <View className="bg-white rounded-t-[40px] h-[85%] shadow-2xl overflow-hidden">
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-100">
                        <Text className="text-text-primary font-black text-lg uppercase tracking-tight">Product Details</Text>
                        <TouchableOpacity onPress={onClose} className="p-2 bg-gray-100 rounded-full">
                            <X size={20} color="#1F2937" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Image Section */}
                        <View className="items-center py-10 bg-gray-50/50">
                            <Image
                                source={{ uri: product.image }}
                                className="w-64 h-64"
                                resizeMode="contain"
                            />
                        </View>

                        <View className="p-6">
                            {/* Basics */}
                            <View className="flex-row justify-between items-start">
                                <View className="flex-1">
                                    <Text className="text-text-primary font-black text-2xl tracking-tight leading-7">{product.name}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="bg-gray-100 px-2 py-1 rounded-md">
                                            <Text className="text-gray-500 font-bold text-[10px] uppercase">{product.weight || "500g"}</Text>
                                        </View>
                                        <View className="bg-indigo-50 px-2 py-1 rounded-md ml-2 border border-indigo-100">
                                            <Text className="text-brand-primary font-black text-[10px] uppercase tracking-wider">High Demand 🔥</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            {/* Trust Markers */}
                            <View className="flex-row justify-between mt-8">
                                <View className="items-center flex-1">
                                    <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mb-2">
                                        <ShieldCheck size={24} color="#059669" />
                                    </View>
                                    <Text className="text-[10px] font-black text-gray-500 uppercase">Quality Check</Text>
                                </View>
                                <View className="items-center flex-1">
                                    <View className="w-12 h-12 bg-purple-50 rounded-2xl items-center justify-center mb-2">
                                        <Zap size={24} color="#5A189A" />
                                    </View>
                                    <Text className="text-[10px] font-black text-gray-500 uppercase">10 Min Del</Text>
                                </View>
                                <View className="items-center flex-1">
                                    <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mb-2">
                                        <Info size={24} color="#2563EB" />
                                    </View>
                                    <Text className="text-[10px] font-black text-gray-500 uppercase">Organic</Text>
                                </View>
                            </View>

                            {/* Nutrition Info (Mocked) */}
                            <View className="mt-8">
                                <Text className="text-text-primary font-black text-sm uppercase mb-3">Nutritional Info <Text className="text-text-secondary font-medium">(Per 100g)</Text></Text>
                                <View className="flex-row flex-wrap justify-between gap-y-2">
                                    {[
                                        { label: 'Energy', val: '45 kcal' },
                                        { label: 'Protein', val: '1.2g' },
                                        { label: 'Fat', val: '0.2g' },
                                        { label: 'Carbs', val: '9.8g' }
                                    ].map(item => (
                                        <View key={item.label} className="w-[48%] bg-gray-50 p-3 rounded-2xl border border-gray-100">
                                            <Text className="text-gray-400 font-bold text-[10px] uppercase">{item.label}</Text>
                                            <Text className="text-text-primary font-black text-sm">{item.val}</Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                            
                            <View className="h-32" />
                        </View>
                    </ScrollView>

                    {/* Bottom Sticky CTA */}
                    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-6 shadow-2xl">
                        <View className="flex-row space-x-4">
                            <TouchableOpacity 
                                onPress={() => onAddToCart('Solo')}
                                className="flex-1 bg-gray-100 border border-gray-200 py-4 rounded-2xl items-center"
                            >
                                <View className="flex-row items-center mb-0.5">
                                    <ShoppingCart size={14} color="#1F2937" />
                                    <Text className="text-text-primary font-black text-xs ml-2 uppercase">ADD SOLO</Text>
                                </View>
                                <Text className="text-text-primary font-black text-lg tracking-tighter">₹{product.priceSolo}</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                                onPress={() => onAddToCart('Loop')}
                                className="flex-1 bg-brand-primary py-4 rounded-2xl items-center shadow-lg shadow-brand-primary/40"
                            >
                                <View className="flex-row items-center mb-0.5">
                                    <Users size={14} color="#FFFFFF" />
                                    <Text className="text-white font-black text-xs ml-2 uppercase">JOIN LOOP</Text>
                                </View>
                                <Text className="text-white font-black text-lg tracking-tighter">₹{product.priceLoop}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </Modal>
    );
};
