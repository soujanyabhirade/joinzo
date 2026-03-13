import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { ChevronLeft, Bell, Moon, Globe, Shield, User, Trash2, Smartphone, Eye } from 'lucide-react-native';

export const SettingsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [incognito, setIncognito] = useState(false);

    const SettingToggle = ({ icon: Icon, label, value, onValueChange, desc }: any) => (
        <View className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100">
            <View className="flex-row items-center flex-1 pr-4">
                <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                    <Icon size={20} color="#5A189A" />
                </View>
                <View className="flex-1">
                    <Text className="text-text-primary font-bold text-sm">{label}</Text>
                    {desc && <Text className="text-text-secondary text-[10px] uppercase font-black tracking-widest mt-0.5">{desc}</Text>}
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: "#E5E7EB", true: "#5A189A" }}
                thumbColor={Platform.OS === 'ios' ? '#FFF' : value ? '#FFF' : '#F9FAFB'}
            />
        </View>
    );

    const SettingLink = ({ icon: Icon, label, onPress, valueText }: any) => (
        <TouchableOpacity 
            onPress={onPress}
            className="flex-row items-center justify-between p-4 bg-white border-b border-gray-100"
        >
            <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-gray-50 rounded-2xl items-center justify-center mr-4">
                    <Icon size={20} color="#5A189A" />
                </View>
                <Text className="text-text-primary font-bold text-sm">{label}</Text>
            </View>
            <View className="flex-row items-center">
                {valueText && <Text className="text-text-secondary text-xs mr-2 font-medium">{valueText}</Text>}
                <ChevronLeft size={20} color="#9CA3AF" style={{ transform: [{ rotate: '180deg' }] }} />
            </View>
        </TouchableOpacity>
    );

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-4 py-6 pt-12 flex-row items-center border-b border-gray-100 bg-white">
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color="#5A189A" />
                </TouchableOpacity>
                <Text className="text-text-primary font-black text-xl">APP SETTINGS</Text>
            </View>

            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mt-6 mb-2 px-6">
                    <Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest">Preferences</Text>
                </View>
                <View className="bg-white border-y border-gray-100">
                    <SettingToggle 
                        icon={Bell} 
                        label="Push Notifications" 
                        value={notifications} 
                        onValueChange={setNotifications}
                        desc="Daily deals & Loop alerts"
                    />
                    <SettingToggle 
                        icon={Moon} 
                        label="Night Mode" 
                        value={darkMode} 
                        onValueChange={setDarkMode}
                        desc="Follow system settings"
                    />
                    <SettingLink icon={Globe} label="Region & Language" valueText="Koramangala, EN" />
                </View>

                <View className="mt-8 mb-2 px-6">
                    <Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest">Privacy & Social</Text>
                </View>
                <View className="bg-white border-y border-gray-100">
                    <SettingToggle 
                        icon={Eye} 
                        label="Incognito Shopping" 
                        value={incognito} 
                        onValueChange={setIncognito}
                        desc="Hide your Loops from heatmap"
                    />
                    <SettingLink icon={Shield} label="Account Security" />
                    <SettingLink icon={Smartphone} label="Connected Devices" valueText="v1.0.2" />
                </View>

                <View className="mt-8 mb-2 px-6">
                    <Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest">Danger Zone</Text>
                </View>
                <View className="bg-white border-y border-gray-100">
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Confirm Delete", "Are you sure you want to delete your account? This action is permanent.")}
                        className="flex-row items-center p-4"
                    >
                        <View className="w-10 h-10 bg-red-50 rounded-2xl items-center justify-center mr-4">
                            <Trash2 size={20} color="#EF4444" />
                        </View>
                        <Text className="text-red-600 font-bold text-sm">Delete Account</Text>
                    </TouchableOpacity>
                </View>

                <View className="p-10 items-center">
                    <Text className="text-gray-400 text-[10px] font-black uppercase tracking-widest">Made with ❤️ in Bengaluru</Text>
                </View>
            </ScrollView>
        </View>
    );
};
