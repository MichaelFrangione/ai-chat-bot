'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { PERSONALITIES, PersonalityKey } from '@/constants/personalities';

interface PersonalityContextType {
    personality: PersonalityKey;
    setPersonality: (personality: PersonalityKey) => void;
}

const PersonalityContext = createContext<PersonalityContextType | undefined>(undefined);

export const usePersonality = () => {
    const context = useContext(PersonalityContext);
    if (context === undefined) {
        throw new Error('usePersonality must be used within a PersonalityProvider');
    }
    return context;
};

interface PersonalityProviderProps {
    children: ReactNode;
}

export const PersonalityProvider: React.FC<PersonalityProviderProps> = ({ children }) => {
    const [personality, setPersonalityState] = useState<PersonalityKey>('assistant');

    // Load personality preference from cookie on mount
    useEffect(() => {
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('personality='))
            ?.split('=')[1];

        if (cookieValue && (cookieValue in PERSONALITIES)) {
            setPersonalityState(cookieValue as PersonalityKey);
        }
    }, []);

    const setPersonality = (key: PersonalityKey) => {
        setPersonalityState(key);
        // Just set cookie - single source of truth
        document.cookie = `personality=${key}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
        console.log('🍪 Personality set to:', key);
    };

    const value: PersonalityContextType = {
        personality,
        setPersonality,
    };

    return (
        <PersonalityContext.Provider value={value}>
            {children}
        </PersonalityContext.Provider>
    );
};

