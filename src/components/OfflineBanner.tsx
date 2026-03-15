import React, { useState, useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';

export const OfflineBanner = () => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      Animated.spring(slideAnim, {
        toValue: state.isConnected ? -100 : 0,
        useNativeDriver: true,
        friction: 8,
        tension: 40
      }).start();
    });

    return () => unsubscribe();
  }, []);

  return (
    <Animated.View 
      style={{ transform: [{ translateY: slideAnim }], zIndex: 1000 }}
      className="absolute top-0 left-0 right-0 bg-red-600 px-4 py-3 pb-4 rounded-b-[24px] flex-row items-center justify-center shadow-2xl"
    >
      <WifiOff size={16} color="#FFF" />
      <Text className="text-white font-black text-xs ml-3 uppercase tracking-widest">
        You are offline. Some features may not work.
      </Text>
    </Animated.View>
  );
};

import { useRef } from 'react';
