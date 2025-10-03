'use client';

import { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '@/types/chat';
import { ChatAPI } from '@/lib/api';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ApprovalDialog from './ApprovalDialog';
import { DEV_CONFIG, toggleDevMode } from '@/config/dev';

export default function ChatInterface() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [approvalRequest, setApprovalRequest] = useState<{
        toolName: string;
        toolArgs: any;
        message: string;
    } | null>(null);
    const [devMode, setDevMode] = useState(DEV_CONFIG.SHOW_TOOL_USAGE);
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
            const response = await ChatAPI.sendMessage(message);
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
        <div className="flex flex-col h-[calc(100vh-12rem)] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-white font-semibold text-lg">AI Assistant</h2>
                        <p className="text-blue-100 text-sm">Powered by advanced AI with tools</p>
                    </div>
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

            <MessageList
                messages={messages}
                isLoading={isLoading}
                messagesEndRef={messagesEndRef}
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
