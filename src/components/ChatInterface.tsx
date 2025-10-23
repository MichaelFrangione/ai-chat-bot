'use client';

import { useChat } from '@ai-sdk/react';
import {
    DefaultChatTransport,
    lastAssistantMessageIsCompleteWithToolCalls,
    createIdGenerator,
} from 'ai';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePersonality } from '@/contexts/PersonalityContext';
import { PERSONALITIES, PersonalityKey } from '@/constants/personalities';
import SuggestionChips from './SuggestionChips';
import { useAssistantStatus } from '@/hooks/useAssistantStatus';
import { useImageGenerationStatus } from '@/hooks/useImageGenerationStatus';
import { useAutoScroll } from '@/hooks/useAutoScroll';
import MessagesList from './messages/MessagesList';

interface ChatInterfaceProps {
    chatId: string;
    initialMessages: any[];
    onNewChat: () => void;
}

export default function ChatInterface({ chatId, initialMessages, onNewChat }: ChatInterfaceProps) {
    const { currentTheme } = useTheme();
    const { personality, setPersonality } = usePersonality();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, addToolResult, error, status } = useChat({
        id: chatId,
        messages: initialMessages,
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
        // Generate client-side IDs with prefix
        generateId: createIdGenerator({
            prefix: 'msgc',
            size: 16,
        }),
        transport: new DefaultChatTransport({
            api: '/api/chat',
            // Only send the last message to reduce bandwidth
            prepareSendMessagesRequest({ messages, id }) {
                return {
                    body: {
                        message: messages[messages.length - 1],
                        id
                    }
                };
            },
        }),
        onError: (error: Error) => {
            console.error('Chat error:', error);
        },
    });

    // Use custom hooks for cleaner logic
    const { isAssistantResponding } = useAssistantStatus(messages, status);
    const { isWaitingForUserInput } = useImageGenerationStatus(messages);
    const { messagesContainerRef } = useAutoScroll(messages);

    // Only disable input when AI is actively processing (not when waiting for user input)
    const shouldDisableInput = status === 'submitted' && !isWaitingForUserInput;

    return (
        <div
            className="flex flex-col h-[calc(100vh-16rem)] rounded-xl shadow-xl border overflow-hidden"
            style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
            }}
        >
            {/* Header */}
            <div
                className="px-6 py-4 border-b"
                style={{
                    background: `linear-gradient(to right, ${currentTheme.colors.gradient.from}, ${currentTheme.colors.gradient.to})`,
                    borderBottomColor: currentTheme.colors.border
                }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <label
                            className="text-sm font-medium"
                            style={{ color: currentTheme.colors.headerText }}
                        >
                            Personality:
                        </label>
                        <select
                            className="text-sm rounded px-2 py-1 border"
                            style={{
                                backgroundColor: currentTheme.colors.surface,
                                color: currentTheme.colors.text,
                                borderColor: currentTheme.colors.border,
                            }}
                            value={personality}
                            onChange={(e) => setPersonality(e.target.value as PersonalityKey)}
                        >
                            {Object.entries(PERSONALITIES).map(([key, meta]) => (
                                <option key={key} value={key}>{meta.label}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={onNewChat}
                        className="text-sm px-4 py-2 rounded-md hover:opacity-80 transition-opacity font-medium"
                        style={{
                            backgroundColor: currentTheme.colors.componentColor,
                            color: currentTheme.colors.text,
                        }}
                    >
                        + New Chat
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
                style={{
                    backgroundColor: currentTheme.colors.background,
                }}
            >
                <MessagesList
                    messages={messages}
                    personality={personality}
                    currentTheme={currentTheme}
                    addToolResult={addToolResult}
                    error={error || null}
                />

                {/* Scroll anchor */}
                <div ref={messagesEndRef} style={{ marginBottom: '20px' }} />

                {/* Loading indicator when processing */}
                {status === 'submitted' && (
                    <div className="flex items-center justify-center py-4">
                        <div className="flex items-center space-x-2 text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-500"></div>
                            <span className="text-sm">Processing...</span>
                        </div>
                    </div>
                )}

                {/* Show suggestion chips below messages when it's user's turn and not waiting for input */}
                {!isAssistantResponding && !isWaitingForUserInput && (
                    <SuggestionChips
                        count={4}
                        onQuickPrompt={(text) => {
                            sendMessage({ text });
                        }}
                    />
                )}
            </div>

            {/* Input */}
            <div
                className="p-4 border-t"
                style={{
                    backgroundColor: currentTheme.colors.surface,
                    borderTopColor: currentTheme.colors.border
                }}
            >
                <form
                    onSubmit={e => {
                        e.preventDefault();
                        if (input.trim() && !isWaitingForUserInput) {
                            sendMessage({ text: input });
                            setInput('');
                        }
                    }}
                    className="flex gap-2"
                >
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isWaitingForUserInput ? "Please respond to the image generation request above..." : status === 'submitted' ? "Processing..." : "Type your message..."}
                        disabled={shouldDisableInput}
                        className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.text
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || shouldDisableInput}
                        className="px-6 py-2 rounded-lg font-medium transition-opacity disabled:opacity-50"
                        style={{
                            backgroundColor: currentTheme.colors.componentColor,
                            color: currentTheme.colors.text
                        }}
                    >
                        Send
                    </button>
                </form>
            </div>
        </div>
    );
}
