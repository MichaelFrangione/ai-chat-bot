'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { ChatAPI } from '@/lib/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ApprovalDialog from './ApprovalDialog';
import ChatMenu from './ChatMenu';
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
    const [draft, setDraft] = useState('');
    const [approvalRequest, setApprovalRequest] = useState<{
        toolName: string;
        toolArgs: any;
        message: string;
    } | null>(null);
    const [personality, setPersonality] = useState<PersonalityKey>('assistant');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        // Scroll to bottom of the messages list when a new message is added or the page is loaded
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Load initial messages
        loadMessages();
        // Load saved personality
        try {
            const saved = localStorage.getItem('selectedPersonality');
            if (saved && (saved in PERSONALITIES)) {
                setPersonality(saved as PersonalityKey);
            }
        } catch { }
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

    const handlePersonalityChange = (value: string) => {
        const key = (value in PERSONALITIES ? value : 'assistant') as PersonalityKey;
        setPersonality(key);
        try {
            localStorage.setItem('selectedPersonality', key);
        } catch { }
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
                            onChange={(e) => handlePersonalityChange(e.target.value)}
                        >
                            {Object.entries(PERSONALITIES).map(([key, meta]) => (
                                <option key={key} value={key}>{meta.label}</option>
                            ))}
                        </select>
                    </div>
                    <ChatMenu />
                </div>
            </div>

            <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef as React.RefObject<HTMLDivElement>}
                assistantLabel={PERSONALITIES[personality]?.label || 'AI Assistant'}
                assistantLoadingText={PERSONALITIES[personality]?.loadingText || 'Thinking...'}
                onQuickPrompt={(text) => handleSendMessage(text)}
                showSecondarySuggestions={!isLoading && draft.trim().length === 0}
            />

            <MessageInput
                onSendMessage={handleSendMessage}
                onInputChange={(text) => setDraft(text)}
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
