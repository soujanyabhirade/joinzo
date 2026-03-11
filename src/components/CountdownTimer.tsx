import React, { useState, useEffect } from 'react';
import { View, Text } from 'react-native';
import { Timer } from 'lucide-react-native';

interface CountdownTimerProps {
    minutes?: number;
}

export const CountdownTimer = ({ minutes = 10 }: CountdownTimerProps) => {
    // Convert minutes to total seconds
    const [timeLeft, setTimeLeft] = useState(minutes * 60);

    useEffect(() => {
        if (timeLeft <= 0) return;

        const intervalId = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(intervalId);
    }, [timeLeft]);

    const displayMinutes = Math.floor(timeLeft / 60);
    const displaySeconds = timeLeft % 60;

    return (
        <View className="flex-row items-center bg-deep-charcoal border border-neon-green px-3 py-1.5 rounded-full">
            <Timer size={14} color="#39FF14" />
            <Text className="text-neon-green font-black text-xs ml-1.5 tabular-nums">
                {displayMinutes.toString().padStart(2, '0')}:
                {displaySeconds.toString().padStart(2, '0')}
            </Text>
        </View>
    );
};
