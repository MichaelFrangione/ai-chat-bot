import { PersonalityKey } from '@/constants/personalities';
import { PERSONALITIES } from '@/constants/personalities';
import ToolRenderer from './ToolRenderer';

interface MessageContentProps {
    message: any;
    personality: PersonalityKey;
    addToolResult: (result: any) => void;
}

export default function MessageContent({ message, personality, addToolResult }: MessageContentProps) {
    // Find the index of the first structured tool result to suppress text after it
    const getStructuredToolIndex = (toolType: string) =>
        message.parts.findIndex((part: any) => part.type === toolType && part.state === 'output-available');

    const structuredToolIndexes = [
        getStructuredToolIndex('tool-movie_search'),
        getStructuredToolIndex('tool-reddit'),
        getStructuredToolIndex('tool-youtubeTranscriber'),
        getStructuredToolIndex('tool-websiteScraper'),
        getStructuredToolIndex('tool-generate_image')
    ].filter(index => index !== -1);

    const firstStructuredToolIndex = structuredToolIndexes.length > 0
        ? Math.min(...structuredToolIndexes)
        : -1;

    const renderedParts = message.parts.map((part: any, index: number) => {
        switch (part.type) {
            case 'text':
                // Suppress text content if it comes AFTER the first structured tool result
                if (firstStructuredToolIndex !== -1 && index > firstStructuredToolIndex) {
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

    return <>{renderedParts}</>;
}
