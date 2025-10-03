'use client';

import { ChatMessage } from '@/types/chat';
import StructuredOutputComponent from './StructuredOutput';
import { DEV_CONFIG } from '@/config/dev';

interface MessageBubbleProps {
    message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
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
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 text-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span className="font-semibold text-yellow-800 dark:text-yellow-200">Tool Response</span>
                        </div>
                        <div className="text-yellow-700 dark:text-yellow-300">{message.content}</div>
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
                        className={`px-4 py-3 rounded-2xl shadow-sm ${isUser
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'
                            }`}
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <div className={`w-2 h-2 rounded-full ${isUser ? 'bg-blue-200' : 'bg-green-500'}`}></div>
                            <div className="text-xs font-medium opacity-80">
                                {isUser ? 'You' : 'AI Assistant'}
                            </div>
                        </div>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

                        {message.tool_calls && message.tool_calls.length > 0 && DEV_CONFIG.SHOW_TOOL_USAGE && (
                            <div className="mt-3 pt-2 border-t border-gray-300 dark:border-gray-600">
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
