'use client';

import { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
    assistantLabel?: string;
}

export default function MessageList({ messages, isLoading, messagesEndRef, assistantLabel }: MessageListProps) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar"
            style={{
                backgroundColor: currentTheme.colors.background,
                scrollbarWidth: 'thin',
                scrollbarColor: `${currentTheme.colors.scrollbar.thumb} ${currentTheme.colors.scrollbar.track}`
            }}
        >
            {messages.length === 0 && !isLoading && (
                <div
                    className="text-center py-12"
                    style={{ color: currentTheme.colors.text }}
                >
                    <div className="mb-4">
                        <div
                            className="w-16 h-16 mx-auto rounded-full flex items-center justify-center"
                            style={{
                                backgroundColor: currentTheme.colors.componentColor
                            }}
                        >
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Welcome to AI Assistant</h3>
                    <p className="text-sm">Start a conversation with the AI agent!</p>
                    <div className="mt-4 text-xs opacity-60">
                        <p>Try asking about movies, jokes, or request an image.</p>
                    </div>
                </div>
            )}

            {messages.map((message, index) => (
                <div key={message.id || index} className="animate-fadeIn">
                    <MessageBubble message={message} assistantLabel={assistantLabel} />
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div
                        className="rounded-2xl p-4 max-w-xs shadow-sm border"
                        style={{
                            backgroundColor: currentTheme.colors.surface,
                            borderColor: currentTheme.colors.border
                        }}
                    >
                        <LoadingSpinner />
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
