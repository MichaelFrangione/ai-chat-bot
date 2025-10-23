import { UIMessage, generateId } from 'ai';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// Simple JSON file-based storage for local dev
const DB_FILE = path.join(process.cwd(), 'db.json');

// Initialize Upstash Redis client
const IS_DEV = process.env.NODE_ENV === 'development';
const IS_PROD = process.env.NODE_ENV === 'production';

let redis: Redis | null = null;
try {
    // Use Redis in production only
    if (
        IS_PROD &&
        process.env.UPSTASH_REDIS_REST_URL &&
        process.env.UPSTASH_REDIS_REST_TOKEN
    ) {
        redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        console.log('[CHAT-STORE] Upstash Redis initialized (production mode)');
    } else {
        console.log('[CHAT-STORE] Using local db.json (development mode)');
    }
} catch (error) {
    redis = null;
    console.error('[CHAT-STORE] Failed to initialize Redis, falling back to local db.json:', error);
}

interface ChatData {
    id: string;
    messages: UIMessage[];
    summary: string;
    createdAt: string;
    updatedAt: string;
}

interface ChatStore {
    chats: {
        [chatId: string]: ChatData;
    };
}

// Redis key helpers
const buildChatKey = (chatId: string) => `chatbot:chat:${chatId}`;

// Redis operations
async function getChatFromRedis(chatId: string): Promise<ChatData | null> {
    if (!redis) return null;
    try {
        const data = await redis.get<ChatData>(buildChatKey(chatId));
        return data;
    } catch (error) {
        console.error('[CHAT-STORE] Redis get error:', error);
        return null;
    }
}

async function setChatInRedis(chatId: string, chat: ChatData): Promise<void> {
    if (!redis) return;
    try {
        await redis.set(buildChatKey(chatId), chat);
    } catch (error) {
        console.error('[CHAT-STORE] Redis set error:', error);
    }
}

// File-based storage (fallback)
async function readStore(): Promise<ChatStore> {
    if (!existsSync(DB_FILE)) {
        return { chats: {} };
    }
    try {
        const content = await readFile(DB_FILE, 'utf-8');
        const data = JSON.parse(content);
        // Migrate old format if needed
        if (Array.isArray(data.messages)) {
            return { chats: {} };
        }
        return data.chats ? data : { chats: {} };
    } catch (error) {
        console.error('[CHAT-STORE] Error reading store:', error);
        return { chats: {} };
    }
}

async function writeStore(store: ChatStore): Promise<void> {
    try {
        await writeFile(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
        console.error('[CHAT-STORE] Error writing store:', error);
    }
}

export async function createChat(): Promise<string> {
    const chatId = generateId();
    const now = new Date().toISOString();

    const chatData: ChatData = {
        id: chatId,
        messages: [],
        summary: '',
        createdAt: now,
        updatedAt: now,
    };

    if (redis) {
        // Use Redis
        await setChatInRedis(chatId, chatData);
    } else {
        // Use file storage
        const store = await readStore();
        store.chats[chatId] = chatData;
        await writeStore(store);
    }

    return chatId;
}

export async function loadChat(chatId: string): Promise<UIMessage[]> {
    if (redis) {
        // Use Redis
        const chat = await getChatFromRedis(chatId);
        if (!chat) {
            return [];
        }
        return chat.messages;
    } else {
        // Use file storage
        const store = await readStore();
        const chat = store.chats[chatId];
        if (!chat) {
            return [];
        }
        return chat.messages;
    }
}

export async function saveChat(params: {
    chatId: string;
    messages: UIMessage[];
    summary?: string;
}): Promise<void> {
    const { chatId, messages, summary } = params;

    if (redis) {
        // Use Redis
        let chat = await getChatFromRedis(chatId);

        if (!chat) {
            const now = new Date().toISOString();
            chat = {
                id: chatId,
                messages: [],
                summary: '',
                createdAt: now,
                updatedAt: now,
            };
        }

        chat.messages = messages;
        if (summary !== undefined) {
            chat.summary = summary;
        }
        chat.updatedAt = new Date().toISOString();

        await setChatInRedis(chatId, chat);
    } else {
        // Use file storage
        const store = await readStore();

        if (!store.chats[chatId]) {
            const now = new Date().toISOString();
            store.chats[chatId] = {
                id: chatId,
                messages: [],
                summary: '',
                createdAt: now,
                updatedAt: now,
            };
        }

        store.chats[chatId].messages = messages;
        if (summary !== undefined) {
            store.chats[chatId].summary = summary;
        }
        store.chats[chatId].updatedAt = new Date().toISOString();

        await writeStore(store);
    }
}

export async function getChatSummary(chatId: string): Promise<string> {
    if (redis) {
        // Use Redis
        const chat = await getChatFromRedis(chatId);
        return chat?.summary || '';
    } else {
        // Use file storage
        const store = await readStore();
        const chat = store.chats[chatId];
        return chat?.summary || '';
    }
}
