import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bike, User, FileText, CheckCircle, ArrowRight, Shield, Zap } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import { useTheme } from '../lib/ThemeContext';

const VEHICLE_TYPES = ['Bicycle', 'Electric Bike', 'Scooter', 'Motorbike'];

export const RiderRegistrationScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const { isDarkMode } = useTheme();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        full_name: '',
        phone: '',
        vehicle_type: 'Electric Bike',
        vehicle_number: '',
        dl_number: '',
        aadhar_number: '',
    });

    const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

    const surfaceStyle = isDarkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-100';
    const textPrimary = isDarkMode ? 'text-white' : 'text-text-primary';
    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-400';
    const bgBase = isDarkMode ? 'bg-[#0A0A0A]' : 'bg-ui-background';

    const validate = () => {
        if (step === 1 && (!formData.full_name || !formData.phone)) {
            showNotification("Please fill in your name and phone number.", "error"); return false;
        }
        if (step === 2 && !formData.vehicle_number) {
            showNotification("Vehicle registration number is required.", "error"); return false;
        }
        if (step === 3 && (!formData.dl_number || !formData.aadhar_number)) {
            showNotification("DL number and Aadhar are required.", "error"); return false;
        }
        return true;
    };

    const handleNext = async () => {
        if (!validate()) return;
        if (step < 4) { setStep(step + 1); return; }

        setLoading(true);
        try {
            const { error } = await supabase.from('riders').insert([{
                user_id: user?.id,
                ...formData,
                status: 'pending',
                availability: 'offline',
            }]);
            if (error) throw error;
            setStep(5);
        } catch (err: any) {
            showNotification(err.message || "Submission failed.", "error");
        } finally {
            setLoading(false);
        }
    };

    if (step === 5) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
                <View className="w-24 h-24 bg-green-100 rounded-full items-center justify-center mb-6">
                    <CheckCircle size={56} color="#10B981" />
                </View>
                <Text className="text-3xl font-black text-center text-text-primary tracking-tighter">
                    You're In! 🛵
                </Text>
                <Text className="text-gray-500 text-center mt-4 font-medium leading-7">
                    Welcome to the Joinzo Rider Network,{' '}
                    <Text className="font-black text-brand-primary">{formData.full_name}</Text>.
                    {'\n'}We'll verify your documents within{' '}
                    <Text className="font-black text-green-600">24 hours</Text>{' '}
                    and notify you when you're ready to earn!
                </Text>
                <View className="mt-8 flex-row items-center bg-green-50 border border-green-100 p-4 rounded-2xl w-full">
                    <Zap size={20} color="#10B981" />
                    <Text className="text-green-700 font-bold text-sm ml-3 flex-1">Riders earn up to ₹800/day during peak Loop hours!</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    className="mt-8 w-full py-5 rounded-[32px] items-center"
                    style={{ backgroundColor: '#5A189A' }}
                >
                    <Text className="text-white font-black text-lg">BACK TO HOME</Text>
                </TouchableOpacity>
            </SafeAreaView>
        );
    }

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className={`flex-1 ${bgBase}`}>
            <SafeAreaView className="flex-1">
                {/* Header */}
                <View className={`px-6 pt-4 pb-4 flex-row items-center border-b ${isDarkMode ? 'border-white/10' : 'border-gray-100'}`}>
                    <TouchableOpacity onPress={() => (step > 1 ? setStep(step - 1) : navigation.goBack())}>
                        <ChevronLeft size={28} color={isDarkMode ? "#FFF" : "#5A189A"} />
                    </TouchableOpacity>
                    <View className="ml-4">
                        <Text className={`font-black text-xs uppercase tracking-widest ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>Rider Onboarding</Text>
                        <Text className={`font-black text-xl tracking-tighter ${textPrimary}`}>DELIVER WITH JOINZO</Text>
                    </View>
                </View>

                {/* Step Indicator */}
                <View className="flex-row items-center justify-center space-x-2 py-5">
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} style={{ width: step === i ? 32 : 16, height: 6, borderRadius: 99, backgroundColor: step === i ? '#10B981' : '#E5E7EB' }} />
                    ))}
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {step === 1 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                                    <User size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Personal Info</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 1 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Full Name</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="As per Aadhar Card"
                                placeholderTextColor="#9CA3AF"
                                value={formData.full_name}
                                onChangeText={v => updateForm('full_name', v)}
                            />
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Mobile Number</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="+91 XXXXX XXXXX"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="phone-pad"
                                value={formData.phone}
                                onChangeText={v => updateForm('phone', v)}
                            />
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                                    <Bike size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Vehicle Details</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 2 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-3 ml-1 ${textSecondary}`}>Vehicle Type</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {VEHICLE_TYPES.map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        onPress={() => updateForm('vehicle_type', type)}
                                        className={`px-4 py-2.5 rounded-full border`}
                                        style={{
                                            backgroundColor: formData.vehicle_type === type ? '#10B981' : 'transparent',
                                            borderColor: formData.vehicle_type === type ? '#10B981' : '#E5E7EB'
                                        }}
                                    >
                                        <Text className={`text-xs font-black ${formData.vehicle_type === type ? 'text-white' : isDarkMode ? 'text-white' : 'text-text-primary'}`}>{type}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Vehicle Registration No. *</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="e.g. KA 01 AB 1234"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                value={formData.vehicle_number}
                                onChangeText={v => updateForm('vehicle_number', v)}
                            />
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                                    <Shield size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>KYC Documents</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 3 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Driving Licence Number *</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="e.g. KA0120110000001"
                                placeholderTextColor="#9CA3AF"
                                autoCapitalize="characters"
                                value={formData.dl_number}
                                onChangeText={v => updateForm('dl_number', v)}
                            />
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Aadhar Number *</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="12-digit Aadhar"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                maxLength={12}
                                value={formData.aadhar_number}
                                onChangeText={v => updateForm('aadhar_number', v)}
                            />
                        </View>
                    )}

                    {step === 4 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-green-50 rounded-2xl items-center justify-center mr-4">
                                    <CheckCircle size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Final Review</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 4 of 4</Text>
                                </View>
                            </View>
                            <View className={`border p-6 rounded-3xl shadow-sm ${surfaceStyle}`}>
                                {[
                                    { label: 'Full Name', value: formData.full_name },
                                    { label: 'Phone', value: formData.phone },
                                    { label: 'Vehicle', value: `${formData.vehicle_type} · ${formData.vehicle_number}` },
                                    { label: 'Driving Licence', value: formData.dl_number },
                                    { label: 'Aadhar No.', value: `XXXX XXXX ${formData.aadhar_number.slice(-4)}` },
                                ].map((item, i) => (
                                    <View key={item.label}>
                                        {i > 0 && <View className="h-[1px] bg-gray-100 my-3" />}
                                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textSecondary}`}>{item.label}</Text>
                                        <Text className={`font-bold ${textPrimary}`}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                            <View className="mt-6 bg-green-50 p-4 rounded-2xl border border-green-100">
                                <Text className="text-green-700 text-xs font-medium italic leading-5">
                                    By submitting, you agree to Joinzo's Rider Terms. Earn ₹15–₹50 per delivery + tips + bonuses during Loop surge hours.
                                </Text>
                            </View>
                        </View>
                    )}
                    <View className="h-8" />
                </ScrollView>

                {/* CTA */}
                <View className="p-6 pt-2">
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={loading}
                        className="py-5 rounded-[32px] flex-row items-center justify-center"
                        style={{ backgroundColor: loading ? '#9CA3AF' : '#10B981' }}
                    >
                        <Text className="text-white font-black text-base uppercase tracking-wide mr-2">
                            {loading ? 'Submitting...' : step === 4 ? 'Submit Application' : 'Continue'}
                        </Text>
                        {!loading && <ArrowRight size={18} color="#FFF" />}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
};
