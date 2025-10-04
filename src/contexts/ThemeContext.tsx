'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, defaultTheme } from '@/constants/themes';

interface ThemeContextType {
    currentTheme: Theme;
    setTheme: (themeId: string) => void;
    availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState<Theme>(defaultTheme);

    // Load theme preference from localStorage on mount
    useEffect(() => {
        const savedThemeId = localStorage.getItem('selectedTheme');

        if (savedThemeId && themes[savedThemeId]) {
            setCurrentTheme(themes[savedThemeId]);
        }
    }, []);

    const setTheme = (themeId: string) => {
        if (themes[themeId]) {
            setCurrentTheme(themes[themeId]);
            localStorage.setItem('selectedTheme', themeId);
        }
    };

    const availableThemes = Object.values(themes);

    const value: ThemeContextType = {
        currentTheme,
        setTheme,
        availableThemes,
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
