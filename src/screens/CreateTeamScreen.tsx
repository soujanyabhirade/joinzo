import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { MapPin, Users, ArrowRight } from 'lucide-react-native';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';

export const CreateTeamScreen = ({ navigation }: any) => {
    const { user } = useAuth();
    const [teamName, setTeamName] = useState('');
    const [gateNumber, setGateNumber] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreateTeam = async () => {
        if (!teamName || !gateNumber) {
            Alert.alert("Missing Details", "Please provide a loop name and delivery gate.");
            return;
        }

        if (!user) {
            Alert.alert("Not logged in", "You must be signed in to create a team.");
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('teams')
                .insert([
                    { name: teamName, gate_number: gateNumber, creator_id: user.id }
                ])
                .select()
                .single();

            if (error) throw error;

            // Success, navigate to Contacts to invite
            navigation.navigate('ConnectContacts', { teamId: data.id, teamName: data.name });

        } catch (error: any) {
            Alert.alert("Error Creating Loop", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} className="bg-ui-background p-6">
            <View className="items-center mb-8">
                <View className="bg-brand-primary/10 p-4 rounded-full mb-4 border border-brand-primary/30">
                    <Users size={40} color="#5A189A" />
                </View>
                <Text className="text-text-primary font-black text-3xl tracking-tight">START A LOOP</Text>
                <Text className="text-text-secondary text-center mt-2 px-4">Group orders together for bulk discounts and split delivery fees.</Text>
            </View>

            <View className="bg-ui-surface p-6 rounded-3xl border border-gray-200 shadow-sm">
                <View className="mb-6">
                    <Text className="text-text-secondary font-bold text-xs mb-2 ml-1 uppercase">Loop Name</Text>
                    <TextInput
                        className="bg-ui-background border border-gray-200 rounded-2xl px-4 py-4 text-text-primary font-medium text-lg"
                        placeholder="e.g. Skyline Tower 3 Snacks"
                        placeholderTextColor="#9CA3AF"
                        value={teamName}
                        onChangeText={setTeamName}
                    />
                </View>

                <View className="mb-6">
                    <Text className="text-text-secondary font-bold text-xs mb-2 ml-1 uppercase">Delivery Hub (Gate/Lobby)</Text>
                    <View className="flex-row items-center bg-ui-background border border-gray-200 rounded-2xl px-4 py-3">
                        <MapPin size={20} color="#5A189A" />
                        <TextInput
                            className="flex-1 ml-3 text-text-primary font-medium text-lg"
                            placeholder="Gate 2"
                            placeholderTextColor="#9CA3AF"
                            value={gateNumber}
                            onChangeText={setGateNumber}
                        />
                    </View>
                </View>

                <TouchableOpacity
                    onPress={handleCreateTeam}
                    disabled={loading}
                    className="bg-brand-primary py-4 rounded-2xl flex-row items-center justify-center mt-4"
                >
                    <Text className="text-white font-black text-lg mr-2">
                        {loading ? 'INITIALIZING...' : 'CONTINUE TO INVITES'}
                    </Text>
                    {!loading && <ArrowRight size={20} color="#FFFFFF" />}
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="py-4 mt-2 items-center justify-center"
                >
                    <Text className="text-text-secondary font-bold">Cancel</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};
