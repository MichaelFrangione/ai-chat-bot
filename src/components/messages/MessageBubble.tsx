import { PersonalityKey } from '@/constants/personalities';
import { PERSONALITIES } from '@/constants/personalities';

interface MessageBubbleProps {
    message: any;
    personality: PersonalityKey;
    currentTheme: any;
    children: React.ReactNode;
}

export default function MessageBubble({ message, personality, currentTheme, children }: MessageBubbleProps) {
    return (
        <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {children}
                </div>
            </div>
        </div>
    );
}
