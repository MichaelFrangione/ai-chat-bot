'use client';

import { useEffect, useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { pickRandomSuggestions } from '@/constants/suggestions';

interface SuggestionChipsProps {
    count?: number;
    onQuickPrompt?: (text: string) => void;
}

export default function SuggestionChips({ count = 4, onQuickPrompt }: SuggestionChipsProps) {
    const { currentTheme } = useTheme();
    const [suggestions, setSuggestions] = useState<string[]>([]);

    // Defer randomization to client after mount to avoid SSR hydration mismatch
    useEffect(() => {
        setSuggestions(pickRandomSuggestions(count));
    }, [count]);

    return (
        <div className="mt-6 flex flex-wrap gap-2 justify-center">
            {suggestions.map((label) => (
                <button
                    key={label}
                    type="button"
                    onClick={() => onQuickPrompt && onQuickPrompt(label)}
                    className="text-xs px-3 py-1 rounded-full border select-none transition-colors bg-[var(--chip-bg)] text-[var(--chip-text)] border-[var(--chip-border)] hover:bg-[var(--chip-hover-bg)] hover:text-[var(--chip-hover-text)] hover:border-[var(--chip-hover-border)]"
                    style={{
                        ['--chip-bg' as any]: currentTheme.colors.surface,
                        ['--chip-text' as any]: currentTheme.colors.text,
                        ['--chip-border' as any]: currentTheme.colors.border,
                        ['--chip-hover-bg' as any]: currentTheme.colors.primary,
                        ['--chip-hover-text' as any]: currentTheme.colors.headerText,
                        ['--chip-hover-border' as any]: currentTheme.colors.primary,
                    } as React.CSSProperties}
                >
                    {label}
                </button>
            ))}
        </div>
    );
}