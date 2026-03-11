import * as Haptics from 'expo-haptics';
import { useCallback, useRef } from 'react';

/**
 * useHapticArrival
 * 
 * Simulates the "Haptic Arrival" feature for Joinzo.
 * Triggers a synchronized vibration/pulse on all team members' phones
 * when the rider is 500m from the "Common Gate."
 */
export const useHapticArrival = () => {
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const triggerArrivalPulse = useCallback(() => {
        // Pulse pattern: Heavy, Medium, Light
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

        setTimeout(() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }, 200);

        setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }, 400);
    }, []);

    const startSimulation = useCallback(() => {
        if (intervalRef.current) return;

        // Simulate rider approaching... pulse every 3 seconds for 9 seconds
        let count = 0;
        intervalRef.current = setInterval(() => {
            triggerArrivalPulse();
            count++;
            if (count >= 3) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }, 3000);
    }, [triggerArrivalPulse]);

    return { triggerArrivalPulse, startSimulation };
};
