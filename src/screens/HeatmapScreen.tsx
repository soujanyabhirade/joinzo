import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { ChevronLeft, Flame } from 'lucide-react-native';
import Map, { Marker } from '../components/Map';

export const HeatmapScreen = ({ navigation }: any) => {
    // Mock user center
    const center = { latitude: 12.9716, longitude: 77.5946 };
    
    // Generate mock orders around the center
    const mockOrders = Array.from({ length: 15 }).map((_, i) => ({
        id: i,
        latitude: center.latitude + (Math.random() - 0.5) * 0.02,
        longitude: center.longitude + (Math.random() - 0.5) * 0.02,
        item: ['Maggi', 'Ice Cream', 'Chips', 'Coke', 'Milk'][Math.floor(Math.random() * 5)]
    }));

    return (
        <View className="flex-1 bg-ui-background">
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-ui-surface shadow-sm z-10">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <View>
                    <Text className="text-text-primary font-black text-xl">LIVE CRAVINGS</Text>
                    <Text className="text-text-secondary font-bold text-xs uppercase tracking-widest">Neighborhood Heatmap</Text>
                </View>
            </View>

            <View className="flex-1 relative">
                <Map
                    style={{ flex: 1 }}
                    initialRegion={{
                        latitude: center.latitude,
                        longitude: center.longitude,
                        latitudeDelta: 0.03,
                        longitudeDelta: 0.03,
                    }}
                    userInterfaceStyle="dark"
                >
                    {mockOrders.map(order => (
                        <Marker
                            key={order.id}
                            coordinate={{ latitude: order.latitude, longitude: order.longitude }}
                            title={`Someone bought ${order.item}`}
                            description="Just now"
                        >
                            <View className="bg-red-500/20 p-4 rounded-full border border-red-500/40 items-center justify-center shadow-lg shadow-red-500/50">
                                <View className="bg-red-500 w-4 h-4 rounded-full items-center justify-center">
                                    <Flame size={10} color="#FFF" />
                                </View>
                            </View>
                        </Marker>
                    ))}
                </Map>

                {/* Legend overlay */}
                <View className="absolute bottom-10 left-6 right-6 bg-ui-surface p-5 rounded-3xl border border-gray-200 shadow-xl flex-row items-center">
                    <View className="w-10 h-10 bg-red-500/10 rounded-full items-center justify-center border border-red-500/30 mr-4">
                        <Flame size={20} color="#EF4444" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-text-primary font-black text-sm uppercase">Hot Right Now</Text>
                        <Text className="text-text-secondary font-medium text-xs">These spots represent live orders placed within 3km in the last 15 mins.</Text>
                    </View>
                </View>
            </View>
        </View>
    );
};
