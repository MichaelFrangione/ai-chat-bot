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

    const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        temperature,
        messages: [
            {
                role: 'system',
                content: `${systemPrompt || defaultSystemPrompt
                    }. Conversation summary so far: ${summary}`,
            },
            ...messages,
        ],
        ...(formattedTools.length > 0 && {
            tools: formattedTools,
            tool_choice: 'auto',
            parallel_tool_calls: false,
        }),
    });

    return response.choices[0].message;
};

export const runApprovalCheck = async (userMessage: string) => {
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
};

export const summarizeMessages = async (messages: AIMessage[], sessionId?: string) => {

    const response = await runLLM({
        systemPrompt: `Create a comprehensive conversation summary that preserves ALL important personal information. You MUST include:\n' +
                    '- User\'s name (if mentioned)\n' +
                    '- Birthday, age, or personal dates\n' +
                    '- Plans, goals, or future intentions\n' +
                    '- Preferences, likes, dislikes\n' +
                    '- Important decisions or outcomes\n' +
                    '- Technical context or tools used\n\n' +
                    'If there is a previous summary, merge it with new information. NEVER lose personal details like names, birthdays, or plans. Be thorough in preserving context.`,
        messages,
        sessionId,
    });

    return response.content || '';
};