import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { User, LogOut, Settings, CreditCard, HelpCircle, ChevronLeft } from 'lucide-react-native';

export const ProfileScreen = ({ navigation }: any) => {
    const { user } = useAuth();

    const handleSignOut = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            Alert.alert('Error signing out', error.message);
        }
    };

    return (
        <View className="flex-1 bg-deep-charcoal">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-800">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#fff" />
                </TouchableOpacity>
                <Text className="text-white font-black text-xl">MY PROFILE</Text>
            </View>

            <ScrollView className="flex-1 p-6">
                {/* User Info Card */}
                <View className="bg-soft-gray rounded-3xl p-6 border border-neon-green/30 items-center mb-8">
                    <View className="w-20 h-20 rounded-full bg-neon-green/20 border-2 border-neon-green items-center justify-center mb-4">
                        <User size={40} color="#39FF14" />
                    </View>
                    <Text className="text-white font-black text-xl">{user?.email}</Text>
                    <View className="bg-deep-charcoal px-3 py-1 rounded-full mt-2 border border-gray-700">
                        <Text className="text-gray-400 text-xs font-bold">Verified Member</Text>
                    </View>
                </View>

                {/* Options List */}
                <View className="bg-soft-gray rounded-3xl p-2 border border-gray-800 mb-6">
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
                        <CreditCard size={20} color="#9CA3AF" />
                        <Text className="text-white font-bold ml-4 flex-1">Payment Methods</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-800">
                        <Settings size={20} color="#9CA3AF" />
                        <Text className="text-white font-bold ml-4 flex-1">App Settings</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="flex-row items-center p-4">
                        <HelpCircle size={20} color="#9CA3AF" />
                        <Text className="text-white font-bold ml-4 flex-1">Support & Help</Text>
                    </TouchableOpacity>
                </View>

                {/* Sign Out Button */}
                <TouchableOpacity
                    onPress={handleSignOut}
                    className="bg-deep-charcoal border border-red-500/50 py-4 rounded-2xl flex-row items-center justify-center"
                >
                    <LogOut size={20} color="#EF4444" />
                    <Text className="text-red-500 font-bold ml-2">SIGN OUT</Text>
                </TouchableOpacity>

                <Text className="text-center text-gray-500 text-xs mt-6">Joinzo v1.0.0</Text>
            </ScrollView>
        </View>
    );
};
