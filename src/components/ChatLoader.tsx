'use client';

import { useState, useEffect } from 'react';
import ChatInterface from './ChatInterface';

const CHAT_ID_KEY = 'current-chat-id';

export default function ChatLoader() {
    const [chatId, setChatId] = useState<string | null>(null);
    const [initialMessages, setInitialMessages] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function initializeChat() {
            try {
                // Check localStorage for existing chat ID
                const storedChatId = localStorage.getItem(CHAT_ID_KEY);

                if (storedChatId) {
                    console.log('📂 Restoring chat:', storedChatId);

                    // Load messages from server
                    const response = await fetch('/api/chat/load', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ chatId: storedChatId }),
                    });
                    const data = await response.json();

                    console.log('📥 Loaded', data.messages?.length || 0, 'messages');
                    setInitialMessages(data.messages || []);
                    setChatId(storedChatId);
                } else {
                    // Create new chat
                    console.log('🆕 Creating new chat');
                    const response = await fetch('/api/chat/create', {
                        method: 'POST',
                    });
                    const data = await response.json();
                    console.log('✅ Created chat:', data.chatId);
                    setChatId(data.chatId);
                    localStorage.setItem(CHAT_ID_KEY, data.chatId);
                }
            } catch (error) {
                console.error('Failed to initialize chat:', error);
            } finally {
                setIsLoading(false);
            }
        }

        initializeChat();
    }, []);

    const handleNewChat = async () => {
        try {
            console.log('🆕 Starting new chat');
            const response = await fetch('/api/chat/create', {
                method: 'POST',
            });
            const data = await response.json();
            console.log('✅ Created new chat:', data.chatId);
            setChatId(data.chatId);
            setInitialMessages([]);
            localStorage.setItem(CHAT_ID_KEY, data.chatId);
        } catch (error) {
            console.error('Failed to create new chat:', error);
        }
    };

    // Show loading state
    if (isLoading || !chatId) {
        return (
            <div className="flex flex-col h-[calc(100vh-16rem)] rounded-xl shadow-xl border overflow-hidden items-center justify-center">
                <div className="text-center text-white">Loading chat...</div>
            </div>
        );
    }

    // Only render ChatInterface once we have the data
    // Use key prop to force remount when chat ID changes
    return (
        <ChatInterface
            key={chatId}
            chatId={chatId}
            initialMessages={initialMessages}
            onNewChat={handleNewChat}
        />
    );
}

