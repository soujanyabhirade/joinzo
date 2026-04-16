import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Store, MapPin, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../lib/AuthContext';
import { supabase } from '../lib/supabase';
import { useNotification } from '../lib/NotificationContext';
import { useTheme } from '../lib/ThemeContext';

const CATEGORIES = ['Grocery', 'Pharma', 'Bakery', 'Snacks & Beverages', 'Dairy & Eggs', 'Fresh Produce'];

export const PartnerRegistrationScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const { showNotification } = useNotification();
    const { isDarkMode } = useTheme();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        shop_name: '',
        owner_name: '',
        category: 'Grocery',
        gst_number: '',
        fssai_number: '',
        address: '',
    });

    const updateForm = (key: string, value: string) => setFormData(prev => ({ ...prev, [key]: value }));

    const surfaceStyle = isDarkMode ? 'bg-[#121212] border-white/10' : 'bg-white border-gray-100';
    const textPrimary = isDarkMode ? 'text-white' : 'text-text-primary';
    const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-400';
    const bgBase = isDarkMode ? 'bg-[#0A0A0A]' : 'bg-ui-background';

    const validate = () => {
        if (step === 1 && (!formData.shop_name || !formData.owner_name)) {
            showNotification("Please fill in shop and owner names.", "error"); return false;
        }
        if (step === 2 && !formData.gst_number) {
            showNotification("GST Number is mandatory.", "error"); return false;
        }
        if (step === 3 && !formData.address) {
            showNotification("Shop address is required.", "error"); return false;
        }
        return true;
    };

    const handleNext = async () => {
        if (!validate()) return;
        if (step < 4) { setStep(step + 1); return; }

        setLoading(true);
        try {
            // Fix Cause #3: Bypass Postgres foreign key & RLS constraints if using the Demo User
            if (user?.id === '00000000-0000-0000-0000-000000000000') {
                setTimeout(() => {
                    setLoading(false);
                    setStep(5);
                }, 800);
                return;
            }

            const { error } = await supabase.from('partners').insert([{ user_id: user?.id, ...formData, status: 'pending' }]);
            
            // Fix Cause #4: Better error handling visibility
            if (error) throw error;
            setStep(5);
        } catch (err: any) {
            showNotification(err.message || "Submission failed.", "error");
            alert(err.message || "Supabase rejected the submission."); // Hard alert fallback
        } finally {
            setLoading(false);
        }
    };

    if (step === 5) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center p-8">
                <CheckCircle size={80} color="#10B981" />
                <Text className="text-3xl font-black text-center mt-6 text-text-primary tracking-tighter">
                    Application Sent! 🎉
                </Text>
                <Text className="text-gray-500 text-center mt-4 font-medium leading-7">
                    We've received your application for{' '}
                    <Text className="font-black text-brand-primary">{formData.shop_name}</Text>.
                    {'\n'}Our team verifies within{' '}
                    <Text className="font-black text-green-600">24 hours</Text>.
                </Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                    className="mt-10 w-full py-5 rounded-[32px] items-center"
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
                        <Text className={`font-black text-xs uppercase tracking-widest ${isDarkMode ? 'text-purple-400' : 'text-brand-primary'}`}>Partner Onboarding</Text>
                        <Text className={`font-black text-xl tracking-tighter ${textPrimary}`}>SELL ON JOINZO</Text>
                    </View>
                </View>

                {/* Step Indicator */}
                <View className="flex-row items-center justify-center space-x-2 py-5">
                    {[1, 2, 3, 4].map(i => (
                        <View key={i} style={{ width: step === i ? 32 : 16, height: 6, borderRadius: 99, backgroundColor: step === i ? '#5A189A' : '#E5E7EB' }} />
                    ))}
                </View>

                <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
                    {step === 1 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-brand-primary/10 rounded-2xl items-center justify-center mr-4">
                                    <Store size={24} color="#5A189A" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Business Basics</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 1 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Shop Name</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="e.g. MK Groceries & Daily"
                                placeholderTextColor="#9CA3AF"
                                value={formData.shop_name}
                                onChangeText={v => updateForm('shop_name', v)}
                            />
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Owner Full Name</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="As per PAN / Aadhar"
                                placeholderTextColor="#9CA3AF"
                                value={formData.owner_name}
                                onChangeText={v => updateForm('owner_name', v)}
                            />
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-3 ml-1 ${textSecondary}`}>Category</Text>
                            <View className="flex-row flex-wrap gap-2 mb-6">
                                {CATEGORIES.map(cat => (
                                    <TouchableOpacity
                                        key={cat}
                                        onPress={() => updateForm('category', cat)}
                                        className={`px-4 py-2.5 rounded-full border ${formData.category === cat ? 'bg-brand-primary border-brand-primary' : `${surfaceStyle}`}`}
                                    >
                                        <Text className={`text-xs font-black ${formData.category === cat ? 'text-white' : isDarkMode ? 'text-white' : 'text-text-primary'}`}>{cat}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    )}

                    {step === 2 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-brand-primary/10 rounded-2xl items-center justify-center mr-4">
                                    <ShieldCheck size={24} color="#5A189A" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>KYC & Compliance</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 2 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>GST Number *</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="15-digit GSTIN"
                                placeholderTextColor="#9CA3AF"
                                maxLength={15}
                                autoCapitalize="characters"
                                value={formData.gst_number}
                                onChangeText={v => updateForm('gst_number', v)}
                            />
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>FSSAI Number (Optional)</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-6 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                placeholder="For food & snacks businesses"
                                placeholderTextColor="#9CA3AF"
                                keyboardType="numeric"
                                value={formData.fssai_number}
                                onChangeText={v => updateForm('fssai_number', v)}
                            />
                        </View>
                    )}

                    {step === 3 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-brand-primary/10 rounded-2xl items-center justify-center mr-4">
                                    <MapPin size={24} color="#5A189A" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Shop Location</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 3 of 4</Text>
                                </View>
                            </View>
                            <Text className={`text-xs font-black uppercase tracking-[2px] mb-2 ml-1 ${textSecondary}`}>Full Store Address *</Text>
                            <TextInput
                                className={`border p-5 rounded-3xl font-bold mb-4 shadow-sm ${surfaceStyle} ${textPrimary}`}
                                multiline
                                numberOfLines={4}
                                placeholder="Building No, Street, Landmark, Area, Pincode"
                                placeholderTextColor="#9CA3AF"
                                textAlignVertical="top"
                                value={formData.address}
                                onChangeText={v => updateForm('address', v)}
                                style={{ minHeight: 120 }}
                            />
                        </View>
                    )}

                    {step === 4 && (
                        <View>
                            <View className="flex-row items-center mb-6">
                                <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center mr-4">
                                    <CheckCircle size={24} color="#10B981" />
                                </View>
                                <View>
                                    <Text className={`text-xl font-black tracking-tight ${textPrimary}`}>Final Review</Text>
                                    <Text className={`text-xs font-black uppercase tracking-widest ${textSecondary}`}>Step 4 of 4</Text>
                                </View>
                            </View>
                            <View className={`border p-6 rounded-3xl shadow-sm ${surfaceStyle}`}>
                                {[
                                    { label: 'Shop Name', value: formData.shop_name },
                                    { label: 'Owner', value: formData.owner_name },
                                    { label: 'Category', value: formData.category },
                                    { label: 'GST Number', value: formData.gst_number },
                                    { label: 'Address', value: formData.address },
                                ].map((item, i) => (
                                    <View key={item.label}>
                                        {i > 0 && <View className="h-[1px] bg-gray-100 my-3" />}
                                        <Text className={`text-[10px] font-black uppercase tracking-widest mb-1 ${textSecondary}`}>{item.label}</Text>
                                        <Text className={`font-bold ${textPrimary}`}>{item.value}</Text>
                                    </View>
                                ))}
                            </View>
                            <View className="mt-6 bg-brand-primary/5 p-4 rounded-2xl border border-brand-primary/10">
                                <Text className="text-brand-primary text-xs font-medium italic leading-5">
                                    By submitting, you agree to Joinzo's Partner Terms & commission structure for the Loop Network.
                                </Text>
                            </View>
                        </View>
                    )}

                    <View className="h-8" />
                </ScrollView>

                {/* CTA Button */}
                <View className="p-6 pt-2">
                    <TouchableOpacity
                        onPress={handleNext}
                        disabled={loading}
                        className="py-5 rounded-[32px] flex-row items-center justify-center"
                        style={{ backgroundColor: loading ? '#9CA3AF' : '#5A189A' }}
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
