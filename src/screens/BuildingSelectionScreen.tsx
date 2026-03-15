import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, Building2, MapPin, CheckCircle2, ChevronRight } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../lib/ThemeContext';

const MOCK_BUILDINGS = [
    { id: '1', name: 'Prestige Falcon City', address: 'Kanakapura Road, Bangalore', flats: '2,500+ units' },
    { id: '2', name: 'Brigade Gateway', address: 'Rajajinagar, Bangalore', flats: '1,200+ units' },
    { id: '3', name: 'Sobha Dream Acres', address: 'Panathur, Bangalore', flats: '6,000+ units' },
    { id: '4', name: 'Adarsh Palm Retreat', address: 'Bellandur, Bangalore', flats: '800+ units' },
    { id: '5', name: 'Godrej Eternity', address: 'Kanakapura Road, Bangalore', flats: '900+ units' },
];

export const BuildingSelectionScreen = ({ navigation }: any) => {
    const { isDarkMode } = useTheme();
    const [search, setSearch] = useState('');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const filteredBuildings = MOCK_BUILDINGS.filter(b => 
        b.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleConfirm = async () => {
        if (!selectedId) return;
        
        try {
            let building;
            if (selectedId === 'custom') {
                building = { id: 'custom', name: search || 'My Street/Gate', address: 'Hyperlocal Area', flats: '1 active' };
            } else {
                building = MOCK_BUILDINGS.find(b => b.id === selectedId);
            }
            await AsyncStorage.setItem('@joinzo_user_building', JSON.stringify(building));
            await AsyncStorage.setItem('@joinzo_onboarding_complete', 'true');
            navigation.replace('Home');
        } catch (err) {
            console.error('Error saving building:', err);
            navigation.replace('Home');
        }
    };

    const ListFooter = () => (
        <TouchableOpacity
            onPress={() => setSelectedId('custom')}
            className={`mt-4 p-6 rounded-[32px] border-2 border-dashed transition-all duration-300 ${
                selectedId === 'custom' 
                ? 'border-brand-primary bg-brand-primary/5' 
                : isDarkMode ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-gray-50'
            }`}
        >
            <View className="flex-row items-center">
                <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${selectedId === 'custom' ? 'bg-brand-primary' : 'bg-gray-200'}`}>
                    <MapPin size={24} color={selectedId === 'custom' ? "#FFF" : "#5A189A"} />
                </View>
                <View className="flex-1">
                    <Text className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>Can't find your building?</Text>
                    <Text className="text-gray-500 text-xs font-bold">Use your current street location as your "Gate".</Text>
                </View>
                {selectedId === 'custom' && <CheckCircle2 size={24} color="#5A189A" fill="#5A189A10" />}
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className={`flex-1 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
            <View className="px-8 pt-8">
                <Text className="text-brand-primary font-black text-xs uppercase tracking-[4px] mb-2 italic">Hyperlocal Community</Text>
                <Text className={`font-black text-4xl tracking-tighter italic ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>
                    FIND YOUR<Text className="text-brand-primary"> GATE</Text>
                </Text>
                <Text className={`font-bold mt-2 text-lg leading-6 ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>
                    Select your building or join a new hyperlocal loop on your street.
                </Text>

                {/* Search Bar */}
                <View className={`flex-row items-center mt-8 px-5 py-4 rounded-[24px] border border-brand-primary/20 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                    <Search size={20} color="#5A189A" />
                    <TextInput
                        placeholder="Search your apartment or street..."
                        placeholderTextColor={isDarkMode ? "#4B5563" : "#9CA3AF"}
                        className={`flex-1 ml-4 font-bold text-base ${isDarkMode ? 'text-white' : 'text-text-primary'}`}
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>
            </View>

            <View className="flex-1 mt-6 px-4">
                <FlatList
                    data={filteredBuildings}
                    keyExtractor={(item) => item.id}
                    showsVerticalScrollIndicator={false}
                    ListFooterComponent={ListFooter}
                    renderItem={({ item }) => {
                        const isSelected = selectedId === item.id;
                        return (
                            <TouchableOpacity
                                onPress={() => setSelectedId(item.id)}
                                className={`mb-4 p-6 rounded-[32px] border-2 transition-all duration-300 ${
                                    isSelected 
                                    ? 'border-brand-primary bg-brand-primary/5' 
                                    : isDarkMode ? 'border-white/5 bg-[#121212]' : 'border-gray-100 bg-white'
                                }`}
                            >
                                <View className="flex-row items-center justify-between">
                                    <View className="flex-row items-center flex-1">
                                        <View className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${isSelected ? 'bg-brand-primary' : isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                                            <Building2 size={24} color={isSelected ? "#FFF" : "#5A189A"} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>{item.name}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <MapPin size={12} color="#9CA3AF" />
                                                <Text className="text-gray-500 text-xs ml-1 font-bold">{item.address}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    {isSelected && <CheckCircle2 size={24} color="#5A189A" fill="#5A189A10" />}
                                </View>
                                
                                <View className="mt-4 pt-4 border-t border-brand-primary/5 flex-row items-center">
                                    <Text className="text-brand-primary font-black text-[10px] uppercase tracking-widest">{item.flats} active in Looping</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>

            {/* Footer */}
            <View className="p-8 pb-10">
                <TouchableOpacity 
                    onPress={handleConfirm}
                    disabled={!selectedId}
                    className={`w-full py-5 rounded-[24px] flex-row items-center justify-center shadow-2xl ${
                        selectedId ? 'bg-brand-primary shadow-brand-primary/40' : 'bg-gray-300 shadow-none'
                    }`}
                >
                    <Text className="text-white font-black text-lg uppercase italic tracking-wider">
                        {selectedId === 'custom' ? 'Create My Community' : 'Join This Community'}
                    </Text>
                    {selectedId && <ChevronRight size={20} color="#FFF" style={{ marginLeft: 8 }} />}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};
