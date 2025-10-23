import { PersonalityKey } from '@/constants/personalities';
import { PERSONALITIES } from '@/constants/personalities';
import ToolRenderer from './ToolRenderer';

interface MessageContentProps {
    message: any;
    personality: PersonalityKey;
    addToolResult: (result: any) => void;
}

export default function MessageContent({ message, personality, addToolResult }: MessageContentProps) {
    // Check if we have any structured tool outputs
    const hasStructuredOutput = message.parts?.some((part: any) =>
        part.type.startsWith('tool-') &&
        part.state === 'output-available' &&
        part.type !== 'tool-dad_joke' // dad jokes don't have structured output
    );

    const renderedParts = message.parts.map((part: any, index: number) => {
        switch (part.type) {
            case 'text':
                // Hide text when structured output exists (to avoid redundancy)
                if (hasStructuredOutput) {
                    return null;
                }
                return part.text ? <span key={index}>{part.text}</span> : null;

            default:
                // Handle all tool types
                return <ToolRenderer key={index} part={part} index={index} addToolResult={addToolResult} />;
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
}
