'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { ChatAPI } from '@/lib/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ApprovalDialog from './ApprovalDialog';
import { DEV_CONFIG, toggleDevMode } from '@/config/dev';
import { PERSONALITIES, PersonalityKey } from '@/constants/personalities';
import { useTheme } from '@/contexts/ThemeContext';

interface ChatInterfaceProps {
    themeClasses: {
        background: string;
        text: string;
        surface: string;
        border: string;
        gradient: string;
    };
}

export default function ChatInterface({ themeClasses }: ChatInterfaceProps) {
    const { currentTheme } = useTheme();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [approvalRequest, setApprovalRequest] = useState<{
        toolName: string;
        toolArgs: any;
        message: string;
    } | null>(null);
    const [devMode, setDevMode] = useState(DEV_CONFIG.SHOW_TOOL_USAGE);
    const [personality, setPersonality] = useState<PersonalityKey>('assistant');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Load initial messages
        loadMessages();
    }, []);

    const loadMessages = async () => {
        try {
            const response = await ChatAPI.getMessages();
            if (response.success) {
                setMessages(response.messages);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!message.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            role: 'user',
            content: message,
            id: Date.now().toString(),
        };

        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await ChatAPI.sendMessage(message, personality);
            if (response.success) {
                setMessages(response.messages);

                // Check if approval is needed
                if (response.needsApproval && response.approvalType === 'image') {
                    setApprovalRequest({
                        toolName: 'generateImage',
                        toolArgs: JSON.parse(response.toolCall!.function.arguments),
                        message: 'Do you approve generating an image?'
                    });
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage: ChatMessage = {
                role: 'assistant',
                content: 'Sorry, I encountered an error. Please try again.',
                id: Date.now().toString(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproval = async (approved: boolean) => {
        if (!approvalRequest) return;

        setIsLoading(true);
        setApprovalRequest(null);

        try {
            const response = await ChatAPI.approveAction(approved);
            if (response.success) {
                setMessages(response.messages);
            }
        } catch (error) {
            console.error('Failed to handle approval:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleDevMode = () => {
        const newDevMode = toggleDevMode();
        setDevMode(newDevMode);
    };

    return (
        <div
            className="flex flex-col h-[calc(100vh-16rem)] rounded-xl shadow-xl border overflow-hidden"
            style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
            }}
        >
            {/** Resolve assistant label from selected personality */}
            {(() => {
                return null;
            })()}
            <div
                className="px-6 py-4 border-b"
                style={{
                    background: `linear-gradient(to right, ${currentTheme.colors.gradient.from}, ${currentTheme.colors.gradient.to})`,
                    borderBottomColor: currentTheme.colors.border
                }}
            >
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2
                            className="font-semibold text-lg"
                            style={{ color: currentTheme.colors.headerText }}
                        >
                            {PERSONALITIES[personality]?.label || 'AI Assistant'}
                        </h2>
                        <p
                            className="text-sm opacity-80"
                            style={{ color: currentTheme.colors.headerText }}
                        >
                            Powered by advanced AI with tools
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <label
                            className="text-sm"
                            style={{ color: currentTheme.colors.headerText }}
                        >
                            Personality
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
                        <button
                            onClick={handleToggleDevMode}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${devMode
                                ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                                : 'bg-white/20 hover:bg-white/30 text-white'
                                }`}
                            title={devMode ? 'Dev mode enabled - showing tool usage' : 'Click to enable dev mode'}
                        >
                            {devMode ? '🔧 Dev' : '👁️ Normal'}
                        </button>
                    </div>
                </div>
            </div>

            <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                assistantLabel={PERSONALITIES[personality]?.label || 'AI Assistant'}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
            />

            {approvalRequest && (
                <ApprovalDialog
                    request={approvalRequest}
                    onApprove={(approved: boolean) => handleApproval(approved)}
                    onClose={() => setApprovalRequest(null)}
                />
            )}
        </div>
    );
}
