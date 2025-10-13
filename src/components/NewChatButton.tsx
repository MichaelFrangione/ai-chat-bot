'use client';

import { useState } from 'react';
import { ChatAPI } from '@/lib/api';
import { useTheme } from '@/contexts/ThemeContext';

export default function NewChatButton() {
    const { currentTheme } = useTheme();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleResetConfirm = async () => {
        setShowResetConfirm(false);
        setIsLoading(true);
        try {
            const response = await ChatAPI.resetChat();
            if (response.success) {
                window.location.reload();
            } else {
                console.error('Failed to reset chat:', response.error);
                alert('Failed to reset chat: ' + (response.error || 'Unknown error'));
            }
        } catch (error) {
            console.error('Failed to reset chat:', error);
            alert('Failed to reset chat. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setShowResetConfirm(true)}
                disabled={isLoading}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                style={{ color: currentTheme.colors.text }}
                title="Start a new chat (clears all messages)"
            >
                <span>🗑️</span>
                <span>New Chat</span>
            </button>

            {showResetConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div
                        className="rounded-lg p-6 max-w-md w-full mx-4"
                        style={{ backgroundColor: currentTheme.colors.surface }}
                    >
                        <h3
                            className="text-lg font-semibold mb-4"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Start New Chat?
                        </h3>

                        <div className="mb-6">
                            <p
                                className="mb-2 opacity-80"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Are you sure you want to start a new chat?
                            </p>
                            <p
                                className="text-sm opacity-60"
                                style={{ color: currentTheme.colors.text }}
                            >
                                This will permanently delete all messages and conversation history. This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetConfirm}
                                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                                Delete & Start New
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

