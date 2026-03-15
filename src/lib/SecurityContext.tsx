import React, { createContext, useContext, useState } from 'react';
import { supabase } from './supabase';

interface SecurityContextType {
    isOtpRateLimited: boolean;
    logSecurityEvent: (event: string, meta: any) => Promise<void>;
    verifyPaymentSignature: (orderId: string, paymentId: string, signature: string) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const SecurityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOtpRateLimited, setIsOtpRateLimited] = useState(false);

    const logSecurityEvent = async (event: string, meta: any) => {
        try {
            await supabase.from('security_logs').insert([{ event, meta, timestamp: new Date().toISOString() }]);
        } catch (err) {
            console.error('Security Logging Failed:', err);
        }
    };

    const verifyPaymentSignature = async (orderId: string, paymentId: string, signature: string) => {
        // Production implementation would involve calling a secure edge function
        // to verify against secret keys without exposing them client-side.
        return true; // Simulating for MVP
    };

    return (
        <SecurityContext.Provider value={{ isOtpRateLimited, logSecurityEvent, verifyPaymentSignature }}>
            {children}
        </SecurityContext.Provider>
    );
};

export const useSecurity = () => {
    const context = useContext(SecurityContext);
    if (context === undefined) throw new Error('useSecurity must be used within SecurityProvider');
    return context;
};
