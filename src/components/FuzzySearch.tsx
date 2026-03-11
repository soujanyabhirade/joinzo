import React from 'react';
import { View, TextInput } from 'react-native';
import { Search, Mic } from 'lucide-react-native';

export const FuzzySearch = () => {
    return (
        <View className="px-4 mt-2">
            <View className="bg-soft-gray border border-gray-800 rounded-2xl flex-row items-center px-4 py-3 shadow-lg">
                <Search size={20} color="#39FF14" />
                <TextInput
                    placeholder='Search "Fresh Milk", "Snacks" or "Vapes"'
                    placeholderTextColor="#6B7280"
                    className="flex-1 ml-3 text-white font-medium"
                />
                <Mic size={20} color="#9CA3AF" />
            </View>
        </View>
    );
};
