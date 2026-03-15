import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from './AuthContext';

interface LedgerEntry {
    id: string;
    type: string;
    amount: number;
    description: string;
    created_at: string;
}

interface CoinsContextType {
    coinsBalance: number;
    referralCode: string | null;
    ledger: LedgerEntry[];
    loading: boolean;
    refreshCoins: () => Promise<void>;
    spendCoins: (amount: number, description: string) => Promise<boolean>;
    earnCoins: (amount: number, type: string, description: string) => Promise<void>;
}

const CoinsContext = createContext<CoinsContextType>({
    coinsBalance: 0,
    referralCode: null,
    ledger: [],
    loading: true,
    refreshCoins: async () => {},
    spendCoins: async () => false,
    earnCoins: async () => {},
});

export const CoinsProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [coinsBalance, setCoinsBalance] = useState(0);
    const [referralCode, setReferralCode] = useState<string | null>(null);
    const [ledger, setLedger] = useState<LedgerEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const refreshCoins = useCallback(async () => {
        if (!user?.id) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Fetch profile (which has coins_balance and referral_code)
            const { data: profile } = await supabase
                .from('user_profiles')
                .select('coins_balance, referral_code')
                .eq('id', user.id)
                .single();

            if (profile) {
                setCoinsBalance(profile.coins_balance);
                setReferralCode(profile.referral_code);
            } else {
                // Profile doesn't exist yet — create one with a generated code
                const code = Math.random().toString(36).substring(2, 10).toUpperCase();
                await supabase.from('user_profiles').insert([{
                    id: user.id,
                    referral_code: code,
                    coins_balance: 50,
                }]);
                setReferralCode(code);
                setCoinsBalance(50);
            }

            // Fetch ledger history
            const { data: entries } = await supabase
                .from('coins_ledger')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(20);
            if (entries) setLedger(entries);
        } catch (err) {
            console.error('CoinsContext error:', err);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id) refreshCoins();
    }, [user?.id, refreshCoins]);

    const earnCoins = async (amount: number, type: string, description: string) => {
        if (!user?.id) return;
        await supabase.from('coins_ledger').insert([{ user_id: user.id, type, amount, description }]);
        await supabase.from('user_profiles').update({
            coins_balance: coinsBalance + amount,
            total_coins_earned: coinsBalance + amount,
        }).eq('id', user.id);
        setCoinsBalance(prev => prev + amount);
        await refreshCoins();
    };

    const spendCoins = async (amount: number, description: string): Promise<boolean> => {
        if (!user?.id || coinsBalance < amount) return false;
        await supabase.from('coins_ledger').insert([{
            user_id: user.id, type: 'spend_checkout', amount: -amount, description
        }]);
        await supabase.from('user_profiles').update({ coins_balance: coinsBalance - amount }).eq('id', user.id);
        setCoinsBalance(prev => prev - amount);
        return true;
    };

    return (
        <CoinsContext.Provider value={{ coinsBalance, referralCode, ledger, loading, refreshCoins, earnCoins, spendCoins }}>
            {children}
        </CoinsContext.Provider>
    );
};

export const useCoins = () => useContext(CoinsContext);
