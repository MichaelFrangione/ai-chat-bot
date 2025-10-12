import type { AIMessage } from '../types';
import { openai } from './ai';
import { zodFunction, zodResponseFormat } from 'openai/helpers/zod';
import { systemPrompt as defaultSystemPrompt } from './systemPrompt';
import { z } from 'zod';
import { getSummary } from './memory';

export const runLLM = async ({
    messages,
    tools = [],
    temperature = 1,
    systemPrompt,
    sessionId,
}: {
    messages: AIMessage[];
    tools?: any[];
    temperature?: number;
    systemPrompt?: string;
    sessionId?: string;
}) => {

    const formattedTools = tools.map(zodFunction);
    const summary = await getSummary(sessionId);

    // Filter out structuredOutput-only messages - they're for frontend display only
    // These messages break OpenAI's tool call flow expectations
    const filteredMessages = messages.filter((msg: any) => {
        // Always keep tool messages (they're responses to tool calls)
        if (msg.role === 'tool') return true;

        // Always keep user messages
        if (msg.role === 'user') return true;

        // For assistant messages:
        // Keep if it has tool_calls (even if it also has structuredOutput)
        if (msg.tool_calls && msg.tool_calls.length > 0) return true;

        // Keep if it has actual content (even if it also has structuredOutput)
        if (msg.content && msg.content !== "") return true;

        // Filter out messages that ONLY have structuredOutput
        return false;
    });

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            temperature,
            messages: [
                {
                    role: 'system',
                    content: `${systemPrompt || defaultSystemPrompt
                        }. Conversation summary so far: ${summary}`,
                },
                ...filteredMessages,
            ],
            ...(formattedTools.length > 0 && {
                tools: formattedTools,
                tool_choice: 'auto',
                parallel_tool_calls: false,
            }),
        });

        return response.choices[0].message;
    } catch (error) {
        console.error('OpenAI API error:', error);
        throw error;
    }
};

export const runApprovalCheck = async (userMessage: string) => {
    try {
        const result = await openai.chat.completions.parse({
            model: 'gpt-5-nano',
            temperature: 1,
            response_format: zodResponseFormat(
                z.object({
                    approved: z
                        .boolean()
                        .describe('did the user approve the action or not'),
                }),
                'approval'
            ),
            messages: [
                {
                    role: 'system',
                    content: `Determine if the user approved the image generation. If you are not sure, then it is not approved.`,
                },
                { role: 'user', content: userMessage },
            ],
        });

        return result.choices[0].message.parsed?.approved;
    } catch (error) {
        console.error('OpenAI approval check error:', error);
        throw error;
    }
};

export const summarizeMessages = async (messages: AIMessage[], sessionId?: string) => {
    // Add timeout to prevent hanging during summarization
    const timeoutPromise = new Promise<string>((_, reject) =>
        setTimeout(() => reject(new Error('Summarization timeout')), 30000)
    );

    try {
        // Create a proper message structure for summarization
        const summarizationMessages = [
            {
                role: 'user' as const,
                content: `Please summarize this conversation:\n\n${messages.map(msg =>
                    `${msg.role}: ${msg.content || '[tool call or structured output]'}`
                ).join('\n')}`
            }
        ];

        const response = await Promise.race([
            runLLM({
                systemPrompt: `Create a concise conversation summary focusing on the actual dialogue between user and assistant. Include:
- What the user asked for or discussed
- Key topics and user preferences mentioned
- Important decisions or choices made
- Any ongoing themes or context

Do NOT include detailed tool outputs, technical details, or raw data. Focus on the human conversation flow and what was actually discussed between user and assistant.`,
                messages: summarizationMessages,
                sessionId,
            }),
            timeoutPromise
        ]);

        return (response as any).content || '';
    } catch (error) {
        console.error('Summarization failed:', error);
        // Return a simple fallback summary
        return `Previous conversation had ${messages.length} messages about various topics.`;
    }
};