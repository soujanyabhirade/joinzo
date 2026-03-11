import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Users } from 'lucide-react-native';

export const LoopTicker = () => {
    const loops = [
        { id: 1, user: "Aarav", location: "Gate 2", item: "Milk" },
        { id: 2, user: "Priya", location: "Skyline Apts", item: "Avocado" },
        { id: 3, user: "Ishaan", location: "Tower C", item: "Snacks" },
    ];

    return (
        <View className="mt-6">
            <View className="px-4 flex-row items-center justify-between mb-3">
                <Text className="text-white font-bold text-lg">Live Neighborhood Loops</Text>
                <Text className="text-neon-green text-xs font-bold">VIEW ALL</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {loops.map((loop) => (
                    <View
                        key={loop.id}
                        className="mr-3 bg-neon-green/10 border border-neon-green/30 px-4 py-3 rounded-2xl flex-row items-center"
                    >
                        <View className="w-8 h-8 rounded-full bg-neon-green items-center justify-center mr-3">
                            <Users size={16} color="#121212" />
                        </View>
                        <View>
                            <Text className="text-white text-sm font-bold">
                                {loop.user} at {loop.location}
                            </Text>
                            <Text className="text-neon-green text-xs font-medium">
                                Just started a <Text className="font-bold underline">{loop.item} Loop</Text>! Join?
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
