'use client';

import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeSwitcherProps {
    className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ className = '' }) => {
    const { currentTheme, setTheme, availableThemes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={`relative ${className}`}>
            {/* Theme Selector */}
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors"
                    style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                        color: currentTheme.colors.text
                    }}
                >
                    <div
                        className="w-4 h-4 rounded-full"
                        style={{
                            background: `linear-gradient(to right, ${currentTheme.colors.gradient.from}, ${currentTheme.colors.gradient.to})`
                        }}
                    />
                    <span className="text-sm font-medium">
                        {currentTheme.name}
                    </span>
                    <svg
                        className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        style={{ color: currentTheme.colors.text }}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Theme Dropdown */}
                {isOpen && (
                    <div
                        className="absolute top-full left-0 mt-2 w-64 border rounded-lg shadow-lg z-50"
                        style={{
                            backgroundColor: currentTheme.colors.surface,
                            borderColor: currentTheme.colors.border
                        }}
                    >
                        <div className="p-3">
                            <h3
                                className="text-sm font-semibold mb-3"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Choose Theme
                            </h3>
                            <div className="space-y-2">
                                {availableThemes.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => {
                                            console.log('Setting theme to:', theme.id);
                                            setTheme(theme.id);
                                            setIsOpen(false);
                                        }}
                                        className="w-full flex items-center gap-3 p-3 rounded-lg transition-colors border hover:opacity-80"
                                        style={{
                                            backgroundColor: currentTheme.id === theme.id
                                                ? currentTheme.colors.background
                                                : 'transparent',
                                            borderColor: currentTheme.id === theme.id
                                                ? currentTheme.colors.border
                                                : 'transparent'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (currentTheme.id !== theme.id) {
                                                e.currentTarget.style.backgroundColor = currentTheme.colors.background;
                                                e.currentTarget.style.opacity = '0.7';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (currentTheme.id !== theme.id) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                                e.currentTarget.style.opacity = '1';
                                            }
                                        }}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full"
                                            style={{
                                                background: `linear-gradient(to right, ${theme.colors.gradient.from}, ${theme.colors.gradient.to})`
                                            }}
                                        />
                                        <div className="flex-1 text-left">
                                            <div
                                                className="text-sm font-medium"
                                                style={{ color: currentTheme.colors.text }}
                                            >
                                                {theme.name}
                                            </div>
                                            <div
                                                className="text-xs opacity-80"
                                                style={{ color: currentTheme.colors.text }}
                                            >
                                                {theme.description}
                                            </div>
                                        </div>
                                        {currentTheme.id === theme.id && (
                                            <svg
                                                className="w-4 h-4"
                                                fill="currentColor"
                                                viewBox="0 0 20 20"
                                                style={{ color: currentTheme.colors.text }}
                                            >
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Backdrop to close dropdown */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

export default ThemeSwitcher;
