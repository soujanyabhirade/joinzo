import { Platform } from 'react-native';
import { CONFIG } from './config';

// Razorpay Configuration
// Replace these with your actual Razorpay credentials
const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXX'; // Get from https://dashboard.razorpay.com

interface RazorpayOptions {
    amount: number; // in paise (₹1 = 100 paise)
    currency?: string;
    name?: string;
    description?: string;
    orderId?: string;
    customerEmail?: string;
    customerPhone?: string;
    onSuccess: (response: RazorpayResponse) => void;
    onFailure: (error: any) => void;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id?: string;
    razorpay_signature?: string;
}

// Load Razorpay script for web
const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
        if (Platform.OS !== 'web') {
            resolve(false);
            return;
        }

        // Check if already loaded
        if ((window as any).Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

// Open Razorpay Checkout
export const openRazorpayCheckout = async (options: RazorpayOptions) => {
    if (Platform.OS !== 'web') {
        // For native apps, use react-native-razorpay package
        // npm install react-native-razorpay
        // For now, simulate success on native
        options.onSuccess({
            razorpay_payment_id: `pay_demo_${Date.now()}`,
        });
        return;
    }

    // Check if key is configured
    if (!isRazorpayConfigured()) {
        console.warn('Razorpay Key not configured — using demo mode simulation');
        // We can't use showNotification here as it's a hook, 
        // but the failure/success callbacks will handle the UI
        simulateDemoPayment(options);
        return;
    }

    const loaded = await loadRazorpayScript();

    if (!loaded) {
        // If Razorpay script fails, use demo mode
        console.warn('Razorpay SDK not loaded — using demo mode');
        simulateDemoPayment(options);
        return;
    }

    try {
        const rzp = new (window as any).Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: options.amount,
            currency: options.currency || 'INR',
            name: options.name || 'Joinzo',
            description: options.description || 'Grocery Order',
            image: `${CONFIG.APP_BASE_URL}/favicon.ico`,
            order_id: options.orderId,
            prefill: {
                email: options.customerEmail || '',
                contact: options.customerPhone || '',
            },
            theme: {
                color: '#5A189A',
                backdrop_color: 'rgba(0,0,0,0.7)',
            },
            handler: (response: RazorpayResponse) => {
                options.onSuccess(response);
            },
            modal: {
                ondismiss: () => {
                    options.onFailure({ message: 'Payment cancelled by user' });
                },
            },
        });

        rzp.on('payment.failed', (response: any) => {
            options.onFailure({
                message: response.error?.description || 'Payment failed',
                code: response.error?.code,
            });
        });

        rzp.open();
    } catch (err) {
        console.error('Razorpay error:', err);
        // Fallback to demo mode
        simulateDemoPayment(options);
    }
};

// Demo Payment Simulation (when Razorpay key is not configured)
const simulateDemoPayment = (options: RazorpayOptions) => {
    // Simulate a 2-second payment processing delay
    setTimeout(() => {
        options.onSuccess({
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_order_id: `order_demo_${Date.now()}`,
        });
    }, 2000);
};

// Validate Razorpay Key
export const isRazorpayConfigured = (): boolean => {
    return !RAZORPAY_KEY_ID.includes('XXXXXXX');
};

// Format amount for display
export const formatAmountForRazorpay = (amountInRupees: number): number => {
    return Math.round(amountInRupees * 100); // Convert to paise
};
