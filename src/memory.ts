import { JSONFilePreset } from 'lowdb/node';
import type { AIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { summarizeMessages } from './llm';

export type MessageWithMetadata = AIMessage & {
    id: string;
    createdAt: string;
};

type Data = {
    messages: MessageWithMetadata[];
    summary: string;
};

export const addMetadata = (message: AIMessage) => {
    return {
        ...message,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
    };
};

export const removeMetadata = (message: MessageWithMetadata) => {
    const { id, createdAt, ...rest } = message;
    return rest;
};

const defaultData: Data = {
    messages: [],
    summary: '',
};

export const getDb = async () => {
    const db = await JSONFilePreset<Data>('db.json', defaultData);
    return db;
};

export const addMessages = async (messages: AIMessage[]) => {
    const db = await getDb();
    db.data.messages.push(...messages.map(addMetadata));

    if (db.data.messages.length >= 10) {
        // Find messages to remove, but ensure we don't orphan tool calls
        let messagesToRemove = 5;
        const messagesToCheck = db.data.messages.slice(0, messagesToRemove);

        // Check if any of the messages to be removed are tool calls
        const hasToolCalls = messagesToCheck.some(msg => (msg as any).tool_calls && (msg as any).tool_calls.length > 0);

        if (hasToolCalls) {
            // If we have tool calls, only remove messages up to the last tool call
            // to ensure we don't orphan tool responses
            const lastToolCallIndex = messagesToCheck.findLastIndex(msg => (msg as any).tool_calls && (msg as any).tool_calls.length > 0);
            if (lastToolCallIndex >= 0) {
                // Find the corresponding tool response
                const toolCallId = (messagesToCheck[lastToolCallIndex] as any).tool_calls?.[0]?.id;
                const toolResponseIndex = db.data.messages.findIndex(msg => (msg as any).tool_call_id === toolCallId);

                if (toolResponseIndex > lastToolCallIndex) {
                    // Only remove messages up to and including the tool response
                    messagesToRemove = toolResponseIndex + 1;
                }
            }
        }

        const oldestMessages = db.data.messages.slice(0, messagesToRemove).map(removeMetadata);

        // Create a summary that includes existing summary + new messages
        const messagesToSummarize = [
            ...(db.data.summary ? [{ role: 'user' as const, content: `Previous conversation summary: ${db.data.summary}` }] : []),
            ...oldestMessages
        ];

        const newSummary = await summarizeMessages(messagesToSummarize);

        // Update the summary and remove the old messages
        db.data.summary = newSummary;
        db.data.messages = db.data.messages.slice(messagesToRemove);
    }

    await db.write();
};

export const getMessages = async () => {
    const db = await getDb();
    const messages = db.data.messages.map(removeMetadata);
    const lastFive = messages.slice(-5);

    // If first message is a tool response, get one more message before it
    if (lastFive[0]?.role === 'tool') {
        const sixthMessage = messages[messages.length - 6];
        if (sixthMessage) {
            return [...[sixthMessage], ...lastFive];
        }
    }

    return lastFive;
};

export const getSummary = async () => {
    const db = await getDb();
    return db.data.summary;
};

export const saveToolResponse = async (
    toolCallId: string,
    toolResponse: string
) => {
    return addMessages([
        {
            role: 'tool',
            content: toolResponse,
            tool_call_id: toolCallId,
        },
    ]);
};