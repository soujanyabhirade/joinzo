import React, { createContext, useState, useEffect, useContext } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

type AuthContextType = {
    session: Session | null;
    user: User | null;
    isLoading: boolean;
    signInAsGuest: () => void;
};

const AuthContext = createContext<AuthContextType>({
    session: null,
    user: null,
    isLoading: true,
    signInAsGuest: () => { }
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const registerAndSaveToken = async (userId: string) => {
            if (Platform.OS === 'web') return;
            try {
                if (Platform.OS === 'android') {
                    await Notifications.setNotificationChannelAsync('default', {
                        name: 'default',
                        importance: Notifications.AndroidImportance.MAX,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor: '#5A189A',
                    });
                }
                const { status: existingStatus } = await Notifications.getPermissionsAsync();
                let finalStatus = existingStatus;
                if (existingStatus !== 'granted') {
                    const { status } = await Notifications.requestPermissionsAsync();
                    finalStatus = status;
                }
                if (finalStatus !== 'granted') return;
                
                const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? "your-project-id";
                const tokenResponse = await Notifications.getExpoPushTokenAsync({ projectId });
                if (tokenResponse?.data) {
                    await supabase.from('user_profiles').update({ push_token: tokenResponse.data }).eq('id', userId);
                }
            } catch (err) {
                console.log("Push token error:", err);
            }
        };

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (session?.user?.id) registerAndSaveToken(session.user.id);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setIsLoading(false);
            if (session?.user?.id) registerAndSaveToken(session.user.id);
        });

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    const signInAsGuest = () => {
        const mockUser: User = {
            id: '00000000-0000-0000-0000-000000000000',
            email: 'demo@joinzo.com',
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
        };
        const mockSession: Session = {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh',
            expires_in: 3600,
            token_type: 'bearer',
            user: mockUser,
        };
        setSession(mockSession);
        setUser(mockUser);
    };

    return (
        <AuthContext.Provider value={{ session, user, isLoading, signInAsGuest }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
