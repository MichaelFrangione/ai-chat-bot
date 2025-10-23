import { PersonalityKey } from '@/constants/personalities';
import MessageBubble from './MessageBubble';
import MessageContent from './MessageContent';

interface MessagesListProps {
    messages: any[];
    personality: PersonalityKey;
    currentTheme: any;
    addToolResult: (result: any) => void;
    error: Error | null;
}

export default function MessagesList({ messages, personality, currentTheme, addToolResult, error }: MessagesListProps) {
    return (
        <>
            {error && (
                <div className="text-center py-4 px-4 mx-4 mb-4 rounded-lg border" style={{
                    backgroundColor: '#fef2f2',
                    borderColor: '#fecaca',
                    color: '#dc2626'
                }}>
                    <p className="font-medium">Error: {error.message}</p>
                </div>
            )}

            {messages.length === 0 && !error && (
                <div className="text-center py-12" style={{ color: currentTheme.colors.text }}>
                    <p>Ask me for a dad joke!</p>
                </div>
            )}

            {messages?.map((message: any) => (
                <MessageBubble
                    key={message.id}
                    message={message}
                    personality={personality}
                    currentTheme={currentTheme}
                >
                    <MessageContent
                        message={message}
                        personality={personality}
                        addToolResult={addToolResult}
                    />
                </MessageBubble>
            ))}
        </>
    );
}

