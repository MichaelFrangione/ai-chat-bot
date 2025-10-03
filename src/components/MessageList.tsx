'use client';

import { ChatMessage } from '@/types/chat';
import MessageBubble from './MessageBubble';
import LoadingSpinner from './LoadingSpinner';

interface MessageListProps {
    messages: ChatMessage[];
    isLoading: boolean;
    messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, isLoading, messagesEndRef }: MessageListProps) {
    return (
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50 dark:bg-gray-900">
            {messages.length === 0 && !isLoading && (
                <div className="text-center text-gray-500 dark:text-gray-400 py-12">
                    <div className="mb-4">
                        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                    </div>
                    <h3 className="text-lg font-medium mb-2">Welcome to AI Assistant</h3>
                    <p className="text-sm">Start a conversation with the AI agent!</p>
                    <div className="mt-4 text-xs text-gray-400">
                        <p>Try asking about movies, jokes, or request an image.</p>
                    </div>
                </div>
            )}

            {messages.map((message, index) => (
                <div key={message.id || index} className="animate-fadeIn">
                    <MessageBubble message={message} />
                </div>
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 max-w-xs shadow-sm border border-gray-200 dark:border-gray-700">
                        <LoadingSpinner />
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    );
}
