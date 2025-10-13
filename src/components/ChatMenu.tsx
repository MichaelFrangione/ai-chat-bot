'use client';

import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { DEV_CONFIG, toggleDevMode } from '@/config/dev';
import NewChatButton from './NewChatButton';

export default function ChatMenu() {
    const { currentTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [devMode, setDevMode] = useState(DEV_CONFIG.SHOW_TOOL_USAGE);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const handleToggleDevMode = () => {
        const newDevMode = toggleDevMode();
        setDevMode(newDevMode);
    };

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-full hover:bg-white/20 transition-colors"
                style={{ color: currentTheme.colors.headerText }}
                title="Chat menu"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM12.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0zM18.75 12a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                    />
                </svg>
            </button>

            {isOpen && (
                <div
                    className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg border z-50"
                    style={{
                        backgroundColor: currentTheme.colors.surface,
                        borderColor: currentTheme.colors.border,
                    }}
                >
                    <div className="py-1">
                        <button
                            onClick={handleToggleDevMode}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                            style={{ color: currentTheme.colors.text }}
                        >
                            <span>{devMode ? '🔧' : '👁️'}</span>
                            <span>{devMode ? 'Disable Dev Mode' : 'Enable Dev Mode'}</span>
                        </button>

                        <div
                            className="my-1 border-t"
                            style={{ borderColor: currentTheme.colors.border }}
                        />

                        <NewChatButton />
                    </div>
                </div>
            )}
        </div>
    );
}

