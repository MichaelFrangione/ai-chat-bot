import { JSONFilePreset } from 'lowdb/node';
import type { AIMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { summarizeMessages } from './llm';
import { Redis } from '@upstash/redis';

// Initialize Upstash Redis client only when enabled
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = process.env.NODE_ENV === 'production';
// Only allow USE_LOCAL_DB override in development; ignore in production
const USE_LOCAL_OVERRIDE = IS_DEV && process.env.USE_LOCAL_DB === 'true';

let redis: Redis | null = null;
try {
    // Use Redis only outside development
    const shouldUseRedis = !IS_DEV && !USE_LOCAL_OVERRIDE;
    if (
        shouldUseRedis &&
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
    }
} catch (_e) {
    redis = null;
}

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

const buildSessionKey = (sessionId?: string) => `chatbot:session:${sessionId || 'default'}`;

// KV helpers
async function kvGet(sessionId?: string): Promise<Data> {
    if (!redis) return { ...defaultData };
    try {
        const data = await redis.get<Data>(buildSessionKey(sessionId));
        return data || { ...defaultData };
    } catch (_e) {
        return { ...defaultData };
    }
}

async function kvSet(data: Data, sessionId?: string): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(buildSessionKey(sessionId), data);
    } catch (_e) {
        // swallow; fallback path handles persistence in dev
    }
}

export const getDb = async (sessionId?: string) => {
    // If Redis is configured, emulate the lowdb API over Redis
    if (redis) {
        const data = await kvGet(sessionId);
        return {
            data,
            write: async () => {
                await kvSet(data, sessionId);
            },
        } as const;
    }

    // Fallback: file-based local DB (shared across sessions in dev)
    const db = await JSONFilePreset<Data>('db.json', defaultData);
    return db;
};

export const addMessages = async (messages: AIMessage[], sessionId?: string) => {
    const db = await getDb(sessionId);
    db.data.messages.push(...messages.map(addMetadata));

    if (db.data.messages.length >= 20) {
        // Find messages to remove, but ensure we don't orphan tool calls
        let messagesToRemove = 10;
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

        const newSummary = await summarizeMessages(messagesToSummarize, sessionId);

        // Update the summary and remove the old messages
        db.data.summary = newSummary;
        db.data.messages = db.data.messages.slice(messagesToRemove);
    }

    await db.write();
};

export const getMessages = async (sessionId?: string) => {
    const db = await getDb(sessionId);
    const messages = db.data.messages.map(removeMetadata);
    let slice = messages.slice(-10);

    // Ensure tool responses in the slice have their corresponding assistant tool_call in the slice
    const hasAssistantToolCallFor = (toolCallId: string) =>
        slice.some((m: any) => m.role === 'assistant' && m.tool_calls && m.tool_calls.some((tc: any) => tc.id === toolCallId));

    // If a tool message lacks its initiating assistant call in the slice, try to prepend earlier messages to include it
    for (let i = 0; i < slice.length; i++) {
        const m: any = slice[i];
        if (m.role === 'tool' && m.tool_call_id && !hasAssistantToolCallFor(m.tool_call_id)) {
            // Find the assistant tool_call earlier in full history
            const assistantIdx = messages.findIndex((am: any) => am.role === 'assistant' && am.tool_calls && am.tool_calls.some((tc: any) => tc.id === m.tool_call_id));
            if (assistantIdx >= 0) {
                // Prepend from assistantIdx up to current slice start
                const startIdx = Math.max(0, assistantIdx);
                const needed = messages.slice(startIdx, messages.length - slice.length);
                slice = [...needed, ...slice].slice(-10);
            } else {
                // If we can't find the assistant call, drop the orphan tool message
                slice = slice.filter((_, idx) => idx !== i);
                i -= 1;
            }
        }
    }

    // If the first message is still a tool, prepend one earlier message if available
    if ((slice[0] as any)?.role === 'tool') {
        const prepend = messages[messages.length - slice.length - 1];
        if (prepend) {
            slice = [prepend, ...slice].slice(-10);
        }
    }

    return slice;
};

export const getSummary = async (sessionId?: string) => {
    const db = await getDb(sessionId);
    return db.data.summary;
};

export const saveToolResponse = async (
    toolCallId: string,
    toolResponse: string,
    sessionId?: string
) => {
    return addMessages([
        {
            role: 'tool',
            content: toolResponse,
            tool_call_id: toolCallId,
        },
    ], sessionId);
};