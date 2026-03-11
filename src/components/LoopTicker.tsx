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
        <View className="mt-4 mb-2">
            <View className="px-4 flex-row items-center justify-between mb-3">
                <Text className="text-text-primary font-black text-lg tracking-tight">Live Neighborhood Loops</Text>
                <Text className="text-brand-primary text-xs font-bold">VIEW ALL</Text>
            </View>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16 }}
            >
                {loops.map((loop) => (
                    <View
                        key={loop.id}
                        className="mr-3 bg-brand-primary/5 border border-brand-primary/20 px-4 py-3 rounded-2xl flex-row items-center shadow-sm"
                    >
                        <View className="w-8 h-8 rounded-full bg-brand-primary/10 items-center justify-center mr-3">
                            <Users size={16} color="#5A189A" />
                        </View>
                        <View>
                            <Text className="text-text-primary text-sm font-bold">
                                {loop.user} at {loop.location}
                            </Text>
                            <Text className="text-text-secondary text-xs font-medium mt-0.5">
                                Just started a <Text className="font-bold underline text-brand-primary">{loop.item} Loop</Text>!
                            </Text>
                        </View>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};
