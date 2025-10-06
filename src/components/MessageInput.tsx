'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageInputProps {
    onSendMessage: (message: string) => void;
    disabled?: boolean;
    onInputChange?: (text: string) => void;
}

export default function MessageInput({ onSendMessage, disabled, onInputChange }: MessageInputProps) {
    const { currentTheme } = useTheme();
    const [message, setMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim() && !disabled) {
            onSendMessage(message);
            setMessage('');
            onInputChange && onInputChange('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
        }
    };

    return (
        <div
            className="border-t p-6"
            style={{
                borderColor: currentTheme.colors.border,
                backgroundColor: currentTheme.colors.surface
            }}
        >
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => {
                            setMessage(e.target.value);
                            onInputChange && onInputChange(e.target.value);
                        }}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        disabled={disabled}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
                        style={{
                            borderColor: currentTheme.colors.border,
                            backgroundColor: currentTheme.colors.surface,
                            color: currentTheme.colors.text
                        }}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={disabled || !message.trim()}
                    className="px-6 py-3 text-white rounded-xl focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm font-medium border"
                    style={{
                        backgroundColor: currentTheme.colors.componentColor,
                        borderColor: currentTheme.colors.border
                    }}
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                    </span>
                </button>
            </form>
        </div>
    );
}
