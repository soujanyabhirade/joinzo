import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Platform, Share, Linking } from 'react-native';
import * as Contacts from 'expo-contacts';
import { Check, UserPlus, Home } from 'lucide-react-native';
import { useNotification } from '../lib/NotificationContext';
import { CONFIG } from '../lib/config';

export const ConnectContactsScreen = ({ route, navigation }: any) => {
    const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
    const [loading, setLoading] = useState(true);
    const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());
    const { showNotification } = useNotification();

    // Optionally grab the newly created team details passed via navigation params
    const { teamName } = route.params || { teamName: "Skyline Snacks" };

    useEffect(() => {
        (async () => {
            if (Platform.OS === 'web') {
                // Web browsers don't support native contact reading via Expo. Provide mock data.
                setTimeout(() => {
                    const mockContacts = [
                        { id: 'm1', firstName: 'Priya', lastName: 'Sharma', phoneNumbers: [{ id: 'p1', number: '+91 98765 43210', label: 'mobile' }] },
                        { id: 'm2', firstName: 'Rahul', lastName: 'Verma', phoneNumbers: [{ id: 'p2', number: '+91 98765 43211', label: 'mobile' }] },
                        { id: 'm3', firstName: 'Neha', lastName: 'Gupta', phoneNumbers: [{ id: 'p3', number: '+91 98765 43212', label: 'mobile' }] },
                        { id: 'm4', firstName: 'Amit', lastName: 'Singh', phoneNumbers: [{ id: 'p4', number: '+91 98765 43213', label: 'mobile' }] },
                        { id: 'm5', firstName: 'Anjali', lastName: 'Desai', phoneNumbers: [{ id: 'p5', number: '+91 98765 43214', label: 'mobile' }] },
                    ] as unknown as Contacts.Contact[];
                    setContacts(mockContacts);
                    setLoading(false);
                }, 800);
            } else {
                const { status } = await Contacts.requestPermissionsAsync();
                if (status === 'granted') {
                    const { data } = await Contacts.getContactsAsync({
                        fields: [Contacts.Fields.PhoneNumbers],
                        pageSize: 50
                    });

                    // Filter contacts that have valid names and phone numbers
                    const validContacts = data.filter(c => c.firstName && c.phoneNumbers && c.phoneNumbers.length > 0);
                    setContacts(validContacts);
                } else {
                    Alert.alert("Permission Denied", "We need access to contacts to invite your neighbors!");
                }
                setLoading(false);
            }
        })();
    }, []);

    const handleInvite = async (contact?: Contacts.Contact) => {
        const teamId = route.params?.teamId || `loop-${Math.random().toString(36).substring(7)}`;
        const teamLink = `${CONFIG.APP_BASE_URL}/?teamId=${teamId}`;
        
        const message = contact 
            ? `Hey ${contact.firstName}! Join my "${teamName}" Loop on Joinzo and unlock 30% discount! 🚀\n\nJoin Link: ${teamLink}`
            : `Join my "${teamName}" Loop on Joinzo and unlock 30% discount! 🚀\n\nJoin Link: ${teamLink}`;

        try {
            if (Platform.OS === 'web') {
                await navigator.clipboard.writeText(message);
                showNotification("Invite link copied to clipboard!", "success");
                if (contact && (contact as any).id) {
                    setInvitedIds(prev => new Set([...prev, (contact as any).id]));
                }
            } else {
                const result = await Share.share({
                    message: message,
                    url: teamLink, // iOS support
                    title: `Join my ${teamName} Loop!`
                });

                if (result.action === Share.sharedAction) {
                    if (contact && (contact as any).id) {
                        setInvitedIds(prev => new Set([...prev, (contact as any).id]));
                    }
                    showNotification("Invite Shared Successfully!", "success");
                }
            }
        } catch (error: any) {
            console.error("Sharing Error:", error);
            showNotification("Could not share/copy link. Try manually!", "error");
        }
    };

    const renderContact = ({ item }: { item: Contacts.Contact }) => {
        const itemId = (item as any).id;
        const isInvited = itemId && invitedIds.has(itemId);

        return (
            <View className="flex-row items-center justify-between bg-ui-surface p-4 mb-3 rounded-2xl border border-gray-200 shadow-sm">
                <View>
                    <Text className="text-text-primary font-bold text-lg">{item.firstName} {item.lastName || ''}</Text>
                    <Text className="text-text-secondary text-xs mt-1">
                        {item.phoneNumbers?.[0]?.number || 'No number'}
                    </Text>
                </View>
                <TouchableOpacity
                    onPress={() => !isInvited && handleInvite(item)}
                    disabled={isInvited}
                    className={`px-4 py-2 rounded-xl flex-row items-center ${isInvited ? 'bg-gray-100 border border-gray-200' : 'bg-brand-primary/10 border border-brand-primary/30'}`}
                >
                    {isInvited ? (
                        <>
                            <Check size={16} color="#6B7280" />
                            <Text className="text-text-secondary font-bold ml-1">Invited</Text>
                        </>
                    ) : (
                        <>
                            <UserPlus size={16} color="#5A189A" />
                            <Text className="text-brand-primary font-black ml-1">Add</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View className="flex-1 bg-ui-background">
            {/* Header */}
            <View className="px-6 py-6 pt-12 bg-ui-background border-b border-gray-100 flex-row justify-between items-center z-10 shadow-sm">
                <View>
                    <Text className="text-text-secondary font-black text-xs uppercase tracking-widest mb-1">Spread the word</Text>
                    <Text className="text-text-primary font-black text-2xl">Invite Neighbors</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Home")} className="bg-ui-surface p-3 rounded-full border border-gray-200 shadow-sm">
                    <Home size={20} color="#5A189A" />
                </TouchableOpacity>
            </View>

            {/* Quick Share Link Section */}
            <View className="p-4">
                <TouchableOpacity 
                    onPress={() => handleInvite()}
                    className="bg-indigo-600 p-5 rounded-[32px] flex-row items-center justify-between shadow-lg shadow-indigo-200"
                >
                    <View>
                        <Text className="text-white font-black text-lg tracking-tight">Copy Loop Link</Text>
                        <Text className="text-indigo-100 text-[10px] font-bold uppercase tracking-widest">Share on WhatsApp or iMessage</Text>
                    </View>
                    <View className="bg-white/20 p-2 rounded-full">
                        <UserPlus size={20} color="#FFF" />
                    </View>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <Text className="text-brand-primary font-bold animate-pulse">Syncing contacts...</Text>
                </View>
            ) : (
                <FlatList
                    data={contacts}
                    keyExtractor={(c) => (c as any).id || Math.random().toString()}
                    renderItem={renderContact}
                    className="p-4"
                    ListHeaderComponent={<Text className="text-text-secondary font-black text-[10px] uppercase tracking-widest ml-1 mb-4">Or pick from neighbors</Text>}
                    ListEmptyComponent={
                        <Text className="text-gray-400 text-center mt-10">No contacts found with phone numbers.</Text>
                    }
                    ListFooterComponent={<View className="h-20" />}
                />
            )}
        </View>
    );
};
