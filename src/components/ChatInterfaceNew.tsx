'use client';

import { useChat } from '@ai-sdk/react';
import {
    DefaultChatTransport,
    lastAssistantMessageIsCompleteWithToolCalls,
} from 'ai';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { usePersonality } from '@/contexts/PersonalityContext';
import { PERSONALITIES, PersonalityKey } from '@/constants/personalities';

export default function ChatInterfaceNew() {
    const { currentTheme } = useTheme();
    const { personality, setPersonality } = usePersonality();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { messages, sendMessage, addToolResult } = useChat({
        api: '/api/chat',
        sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
    });

    // Auto-scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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
                    <h2 className="text-lg font-semibold" style={{ color: currentTheme.colors.headerText }}>
                        AI Chat with Streaming
                    </h2>
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
                </div>
            </div>

            {/* Messages */}
            <div
                className="flex-1 overflow-y-auto p-6 space-y-4"
                style={{
                    backgroundColor: currentTheme.colors.background,
                }}
            >
                {messages.length === 0 && (
                    <div className="text-center py-12" style={{ color: currentTheme.colors.text }}>
                        <p>Ask me for a dad joke!</p>
                    </div>
                )}

                {messages?.map((message: any) => (
                    <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div
                            className="max-w-lg px-4 py-3 rounded-2xl shadow-sm border"
                            style={message.role === 'user' ? {
                                backgroundColor: currentTheme.colors.componentColor,
                                color: currentTheme.colors.text,
                                borderColor: currentTheme.colors.border
                            } : {
                                backgroundColor: currentTheme.colors.surface,
                                color: currentTheme.colors.text,
                                borderColor: currentTheme.colors.border
                            }}
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <div
                                    className="w-2 h-2 rounded-full"
                                    style={{
                                        backgroundColor: message.role === 'user'
                                            ? 'rgba(255,255,255,0.7)'
                                            : '#10b981'
                                    }}
                                />
                                <div className="text-xs font-medium opacity-80">
                                    {message.role === 'user' ? 'You' : PERSONALITIES[personality].label}
                                </div>
                            </div>

                            {/* Render message parts */}
                            <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {(() => {
                                    const renderedParts = message.parts.map((part: any, index: number) => {
                                        switch (part.type) {
                                            case 'text':
                                                return part.text ? <span key={index}>{part.text}</span> : null;

                                            case 'tool-dad_joke':
                                                switch (part.state) {
                                                    case 'input-streaming':
                                                    case 'input-available':
                                                    case 'output-available':
                                                        // Let fallback loading text handle all these states
                                                        return null;
                                                    case 'output-error':
                                                        return (
                                                            <div key={index} className="text-red-500">
                                                                Error: {part.errorText}
                                                            </div>
                                                        );
                                                }
                                                break;

                                            default:
                                                return null;
                                        }
                                    }).filter(Boolean);

                                    // If nothing to show, display loading text with typing dots
                                    if (renderedParts.length === 0 && message.role === 'assistant') {
                                        return (
                                            <div className="text-xs opacity-75 italic flex items-center gap-1">
                                                <span>{PERSONALITIES[personality].loadingText}</span>
                                                <span className="flex gap-0.5">
                                                    <span className="animate-pulse" style={{ animationDelay: '0s' }}>.</span>
                                                    <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>.</span>
                                                    <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>.</span>
                                                </span>
                                            </div>
                                        );
                                    }

                                    return renderedParts;
                                })()}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
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
                        if (input.trim()) {
                            sendMessage({ text: input });
                            setInput('');
                        }
                    }}
                    className="flex gap-2"
                >
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Ask for a dad joke..."
                        className="flex-1 px-4 py-2 rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.text
                        }}
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
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