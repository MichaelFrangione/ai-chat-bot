import { openai } from '@ai-sdk/openai';
import { generateText, UIMessage } from 'ai';

const SUMMARIZATION_THRESHOLD = 20; // Start summarizing after 20 messages
const MESSAGES_TO_KEEP = 10;
const SUMMARIZATION_TIMEOUT = 30000;

export function shouldSummarize(messageCount: number): boolean {
    return messageCount > SUMMARIZATION_THRESHOLD;
}

/**
 * Splits messages into those that should be summarized and those that should be kept in full
 */
export function splitMessagesForSummarization(messages: UIMessage[]): {
    toSummarize: UIMessage[];
    toKeep: UIMessage[];
} {
    if (messages.length <= MESSAGES_TO_KEEP) {
        return {
            toSummarize: [],
            toKeep: messages,
        };
    }

    const splitPoint = messages.length - MESSAGES_TO_KEEP;
    return {
        toSummarize: messages.slice(0, splitPoint),
        toKeep: messages.slice(splitPoint),
    };
}

/**
 * Extracts text content from a UIMessage
 */
function extractMessageContent(msg: UIMessage): string {
    // UIMessage only has parts array
    if (msg.parts && Array.isArray(msg.parts)) {
        // Extract text parts, skip tool calls
        const textParts = msg.parts
            .filter((part: any) => part.type === 'text')
            .map((part: any) => part.text || '')
            .filter(text => text.trim().length > 0);

        return textParts.length > 0 ? textParts.join(' ') : '[tool call or structured output]';
    }

    return '[tool call or structured output]';
}

/**
 * Generates a summary of the conversation using the LLM
 */
export async function summarizeConversation(
    messages: UIMessage[],
    previousSummary?: string
): Promise<string> {
    if (messages.length === 0) {
        return previousSummary || '';
    }

    // Filter out messages with only tool calls or no meaningful content
    const filteredMessages = messages.filter((msg) => {
        // Always keep user messages
        if (msg.role === 'user') return true;

        // For assistant messages, check if they have actual content
        const content = extractMessageContent(msg);
        return content && content !== '[tool call or structured output]' && content.trim().length > 0;
    });

    // Convert UIMessages to a readable format for summarization
    const conversationText = filteredMessages
        .map((msg) => {
            const role = msg.role === 'user' ? 'User' : 'Assistant';
            const content = extractMessageContent(msg);
            return `${role}: ${content}`;
        })
        .filter(line => line.trim().length > 0)
        .join('\n');

    const systemPrompt = `Create a concise conversation summary focusing on the actual dialogue between user and assistant. Include:
- What the user asked for or discussed
- Key topics and user preferences mentioned
- Important decisions or choices made
- Any ongoing themes or context

Do NOT include detailed tool outputs, technical details, or raw data. Focus on the human conversation flow and what was actually discussed between user and assistant. Keep it concise (2-4 paragraphs max).${previousSummary
            ? '\n\nA previous summary exists. Update it with new information, combining both summaries coherently.'
            : ''
        }`;

    const userPrompt = previousSummary
        ? `Previous summary:\n${previousSummary}\n\nNew conversation to add:\n${conversationText}\n\nProvide an updated summary that combines both.`
        : `Summarize this conversation:\n${conversationText}`;

    // Add timeout to prevent hanging during summarization
    const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Summarization timeout')), SUMMARIZATION_TIMEOUT)
    );

    try {
        const result = await Promise.race([
            generateText({
                model: openai('gpt-5-nano'), // Use mini for cost efficiency
                system: systemPrompt,
                prompt: userPrompt,
            }),
            timeoutPromise
        ]);

        return (result as any).text?.trim() || previousSummary || '';
    } catch (error) {
        console.error('Error generating summary:', error);
        // Fallback: return previous summary or a simple fallback
        return previousSummary || `Previous conversation had ${messages.length} messages about various topics.`;
    }
}

