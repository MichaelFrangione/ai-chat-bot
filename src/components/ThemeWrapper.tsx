'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { useEffect } from 'react';

export default function ThemeWrapper({ children }: { children: React.ReactNode; }) {
    const { currentTheme } = useTheme();

    useEffect(() => {
        // Set CSS custom properties on the document root
        const root = document.documentElement;

        root.style.setProperty('--theme-bg', currentTheme.colors.background);
        root.style.setProperty('--theme-surface', currentTheme.colors.surface);
        root.style.setProperty('--theme-text', currentTheme.colors.text);
        root.style.setProperty('--theme-border', currentTheme.colors.border);
        root.style.setProperty('--theme-gradient-from', currentTheme.colors.gradient.from);
        root.style.setProperty('--theme-gradient-to', currentTheme.colors.gradient.to);
        root.style.setProperty('--scrollbar-thumb', currentTheme.colors.scrollbar.thumb);
        root.style.setProperty('--scrollbar-thumb-hover', currentTheme.colors.scrollbar.thumb + '80');
        root.style.setProperty('--theme-font-family', currentTheme.fontFamily || 'Inter, sans-serif');
        document.body.style.fontFamily = currentTheme.fontFamily || 'Inter, sans-serif';
    }, [currentTheme]);

    return <>{children}</>;
}