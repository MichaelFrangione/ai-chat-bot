'use client';

import { ChatMessage } from '@/types/chat';
import StructuredOutputComponent from './StructuredOutput';
import { DEV_CONFIG } from '@/config/dev';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageBubbleProps {
    message: ChatMessage;
    assistantLabel?: string;
}

export default function MessageBubble({ message, assistantLabel }: MessageBubbleProps) {
    const { currentTheme } = useTheme();
    const isUser = message.role === 'user';
    const isTool = message.role === 'tool';

    if (isTool) {
        // Hide tool responses unless dev mode is enabled
        if (!DEV_CONFIG.SHOW_TOOL_RESPONSES) {
            return null;
        }

        return (
            <div className="flex justify-center">
                <div className="max-w-3xl w-full">
                    <div
                        className="border rounded-xl p-4 text-sm"
                        style={{
                            backgroundColor: currentTheme.colors.surface,
                            borderColor: currentTheme.colors.border,
                            color: currentTheme.colors.text
                        }}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: currentTheme.colors.accent === 'blue' ? '#facc15' : '#10b981' }}
                            ></div>
                            <span
                                className="font-semibold"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Tool Response
                            </span>
                        </div>
                        <div style={{ color: currentTheme.colors.text }}>{message.content}</div>
                    </div>
                </div>
            </div>
        );
    }

    // Hide AI assistant messages with tool calls unless dev mode is enabled
    if (!isUser && message.tool_calls && message.tool_calls.length > 0 && !DEV_CONFIG.SHOW_TOOL_USAGE) {
        return null;
    }

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs lg:max-w-lg ${isUser ? '' : 'max-w-4xl'}`}>
                {/* Regular message bubble - only show if there's content or no structured output */}
                {(!isUser && message.structuredOutput && !message.content) ? null : (
                    <div
                        className="px-4 py-3 rounded-2xl shadow-sm border break-words"
                        style={isUser ? {
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
                                    backgroundColor: isUser ? 'rgba(255,255,255,0.7)' : currentTheme.colors.accent === 'blue' ? '#10b981' : '#10b981'
                                }}
                            ></div>
                            <div className="text-xs font-medium opacity-80">
                                {isUser ? 'You' : (assistantLabel || 'AI Assistant')}
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed break-words">{message.content}</div>

                        {message.tool_calls && message.tool_calls.length > 0 && DEV_CONFIG.SHOW_TOOL_USAGE && (
                            <div
                                className="mt-3 pt-2 border-t"
                                style={{ borderColor: currentTheme.colors.border }}
                            >
                                <div className="flex items-center gap-1 text-xs opacity-75">
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    Using tool: {message.tool_calls[0].function.name}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Structured output */}
                {!isUser && message.structuredOutput && (
                    <div className={message.content ? "mt-4" : ""}>
                        <StructuredOutputComponent output={message.structuredOutput} />
                    </div>
                )}
            </div>
        </div>
    );
}
