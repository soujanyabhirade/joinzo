import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeContextType = {
    isDarkMode: boolean;
    toggleDarkMode: () => void;
    setDarkMode: (value: boolean) => void;
};

const THEME_STORAGE_KEY = '@joinzo_theme_mode';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDarkMode(JSON.parse(savedTheme));
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;
        AsyncStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(isDarkMode));
    }, [isDarkMode, isLoaded]);

    const toggleDarkMode = () => setIsDarkMode(prev => !prev);
    const setDarkMode = (value: boolean) => setIsDarkMode(value);

    return (
        <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode, setDarkMode }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
