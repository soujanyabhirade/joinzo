import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Switch, Alert, Platform } from 'react-native';
import { ChevronLeft, Bell, Moon, Globe, Shield, User, Trash2, Smartphone, Eye } from 'lucide-react-native';
import { useTheme } from '../lib/ThemeContext';

export const SettingsScreen = ({ navigation }: any) => {
    const [notifications, setNotifications] = useState(true);
    const { isDarkMode, setDarkMode } = useTheme();
    const [incognito, setIncognito] = useState(false);

    const SettingToggle = ({ icon: Icon, label, value, onValueChange, desc }: any) => {
        const { isDarkMode } = useTheme();
        return (
            <View className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100'}`}>
                <View className="flex-row items-center flex-1 pr-4">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <Icon size={20} color={isDarkMode ? "#A855F7" : "#5A189A"} />
                    </View>
                    <View className="flex-1">
                        <Text className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>{label}</Text>
                        {desc && <Text className={`text-[10px] uppercase font-black tracking-widest mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>{desc}</Text>}
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
    };

    const SettingLink = ({ icon: Icon, label, onPress, valueText }: any) => {
        const { isDarkMode } = useTheme();
        return (
            <TouchableOpacity 
                onPress={onPress}
                className={`flex-row items-center justify-between p-4 border-b ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100'}`}
            >
                <View className="flex-row items-center flex-1">
                    <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-white/5' : 'bg-gray-50'}`}>
                        <Icon size={20} color={isDarkMode ? "#A855F7" : "#5A189A"} />
                    </View>
                    <Text className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>{label}</Text>
                </View>
                <View className="flex-row items-center">
                    {valueText && <Text className={`text-xs mr-2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-text-secondary'}`}>{valueText}</Text>}
                    <ChevronLeft size={20} color={isDarkMode ? "#4B5563" : "#9CA3AF"} style={{ transform: [{ rotate: '180deg' }] }} />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View className={`flex-1 ${isDarkMode ? 'bg-[#0A0A0A]' : 'bg-ui-background'}`}>
            {/* Header */}
            <View className={`px-4 py-6 pt-12 flex-row items-center border-b ${isDarkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-100'}`}>
                <TouchableOpacity onPress={() => navigation.goBack()} className="mr-4">
                    <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                </TouchableOpacity>
                <Text className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-text-primary'}`}>APP SETTINGS</Text>
            </View>
            
            <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
                <View className="mt-6 mb-2 px-6">
                    <Text className={`font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>Preferences</Text>
                </View>
                <View className={`${isDarkMode ? 'bg-[#121212] border-y border-white/10' : 'bg-white border-y border-gray-100'}`}>
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
                        value={isDarkMode} 
                        onValueChange={setDarkMode}
                        desc="Manual theme selection"
                    />
                    <SettingLink icon={Globe} label="Region & Language" valueText="Koramangala, EN" />
                </View>

                {/* Styled item components will need their own internal logic or inherited props if they are generic. 
                   But since they use bg-white/gray-50 classes inside, I should ideally refactor them or pass theme down. 
                   For now, let's update the main sections. */}

                <View className="mt-8 mb-2 px-6">
                    <Text className={`font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>Privacy & Social</Text>
                </View>
                <View className={`${isDarkMode ? 'bg-[#121212] border-y border-white/10' : 'bg-white border-y border-gray-100'}`}>
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
                    <Text className={`font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-gray-500' : 'text-text-secondary'}`}>Danger Zone</Text>
                </View>
                <View className={`${isDarkMode ? 'bg-[#121212] border-y border-white/10' : 'bg-white border-y border-gray-100'}`}>
                    <TouchableOpacity 
                        onPress={() => Alert.alert("Confirm Delete", "Are you sure you want to delete your account? This action is permanent.")}
                        className="flex-row items-center p-4"
                    >
                        <View className={`w-10 h-10 rounded-2xl items-center justify-center mr-4 ${isDarkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
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
