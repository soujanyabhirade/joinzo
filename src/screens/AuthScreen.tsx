import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform } from 'react-native';
import { supabase } from '../lib/supabase';
import { Mail, Lock, Zap } from 'lucide-react-native';
import { useNotification } from '../lib/NotificationContext';
import { useAuth } from '../lib/AuthContext';

export const AuthScreen = () => {
    const { signInAsGuest } = useAuth();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState<'EMAIL' | 'OTP'>('EMAIL');
    const { showNotification } = useNotification();

    const handleSendOtp = async () => {
        if (!email) {
            Alert.alert("Error", "Please enter your email");
            return;
        }

        setLoading(true);
        try {
            const redirectTo = Platform.OS === 'web' ? window.location.origin : undefined;

            const { error } = await supabase.auth.signInWithOtp({
                email,
                options: {
                    shouldCreateUser: true,
                    emailRedirectTo: redirectTo,
                }
            });

            if (error) throw error;

            setStep('OTP');
            showNotification("OTP/Login link sent! Please check your email inbox.", "success");
        } catch (error: any) {
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            Alert.alert("Error", "Please enter the 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.verifyOtp({
                email,
                token: otp,
                type: 'email'
            });

            if (error) throw error;
            // Success: User is now authenticated and AuthContext will update
            showNotification("Welcome to Joinzo!", "success");
        } catch (error: any) {
            showNotification(error.message, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-ui-background p-6">
            <View className="items-center mb-12 mt-10">
                <View className="flex-row items-center">
                    <Text className="text-brand-primary font-black text-5xl tracking-tighter">JOINZO</Text>
                    <Zap size={36} color="#5A189A" fill="#5A189A" className="ml-1" />
                </View>
                <Text className="text-text-secondary font-bold mt-2">Groceries delivered in 10 minutes</Text>
            </View>

            <View className="bg-ui-surface p-6 rounded-3xl border border-gray-200 shadow-sm">
                <Text className="text-text-primary font-black text-2xl mb-6">
                    {step === 'EMAIL' ? 'Login or Sign Up' : 'Enter OTP'}
                </Text>

                {step === 'EMAIL' ? (
                    <>
                        <View className="mb-6">
                            <Text className="text-text-secondary font-bold text-xs mb-2 ml-1">YOUR EMAIL</Text>
                            <View className="flex-row items-center bg-ui-background border border-gray-300 rounded-2xl px-4 py-3">
                                <Mail size={20} color="#9CA3AF" />
                                <TextInput
                                    nativeID="email"
                                    className="flex-1 ml-3 text-text-primary font-medium"
                                    placeholder="you@example.com"
                                    placeholderTextColor="#9CA3AF"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    keyboardType="email-address"
                                    value={email}
                                    onChangeText={setEmail}
                                />
                            </View>
                        </View>

                        <TouchableOpacity
                            onPress={handleSendOtp}
                            disabled={loading || !email}
                            className={`py-4 rounded-xl items-center flex-row justify-center shadow-md ${!email ? 'bg-gray-300' : 'bg-brand-primary'}`}
                        >
                            <Text className="text-white font-black text-lg">
                                {loading ? 'Sending...' : 'CONTINUE'}
                            </Text>
                        </TouchableOpacity>

                        <Text className="text-text-secondary text-xs text-center mt-4">
                            By continuing, you verify that you are the owner of this email account.
                        </Text>
                    </>
                ) : (
                    <>
                        <View className="mb-6">
                            <Text className="text-text-secondary font-bold text-xs mb-2 ml-1">6-DIGIT OTP</Text>
                            <View className="flex-row items-center bg-ui-background border border-gray-300 rounded-2xl px-4 py-3">
                                <Lock size={20} color="#9CA3AF" />
                                <TextInput
                                    nativeID="otp"
                                    className="flex-1 ml-3 text-text-primary font-medium tracking-[0.5em] text-center"
                                    placeholder="000000"
                                    placeholderTextColor="#9CA3AF"
                                    keyboardType="number-pad"
                                    maxLength={6}
                                    value={otp}
                                    onChangeText={setOtp}
                                />
                            </View>
                            <Text className="text-text-secondary text-xs mt-2 ml-1">
                                Sent to {email}
                            </Text>
                        </View>

                        <TouchableOpacity
                            onPress={handleVerifyOtp}
                            disabled={loading || otp.length !== 6}
                            className={`py-4 rounded-xl items-center flex-row justify-center shadow-md ${otp.length !== 6 ? 'bg-gray-300' : 'bg-brand-primary'}`}
                        >
                            <Text className="text-white font-black text-lg">
                                {loading ? 'Verifying...' : 'VERIFY & LOGIN'}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => {
                                signInAsGuest();
                                showNotification("Demo Mode: Skipping Auth", "info");
                            }}
                            className="mt-4 items-center"
                        >
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Skip for Demo (No OTP)</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setStep('EMAIL')}
                            className="mt-6 items-center"
                        >
                            <Text className="text-brand-primary font-bold underline">Change Email Address</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>

            {/* Manual Bypass Help */}
            <View className="mt-10 px-4">
                <Text className="text-text-secondary text-[10px] text-center italic">
                    Facing a "429 Too Many Requests" error? Supabase limits emails during testing.
                    You can manually confirm users in the Supabase SQL Editor using:
                </Text>
                <Text className="text-brand-primary text-[10px] text-center font-mono mt-1 bg-brand-primary/5 p-2 rounded-lg">
                    update auth.users set email_confirmed_at = now() where email = '{email}';
                </Text>
            </View>
        </ScrollView>
    );
};
