import { UIMessage, generateId } from 'ai';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Simple JSON file-based storage for local dev
const DB_FILE = path.join(process.cwd(), 'db.json');

interface ChatStore {
    chats: {
        [chatId: string]: {
            id: string;
            messages: UIMessage[];
            createdAt: string;
            updatedAt: string;
        };
    };
}

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
        console.error('Error reading store:', error);
        return { chats: {} };
    }
}

async function writeStore(store: ChatStore): Promise<void> {
    try {
        await writeFile(DB_FILE, JSON.stringify(store, null, 2), 'utf-8');
    } catch (error) {
        console.error('Error writing store:', error);
    }
}

export async function createChat(): Promise<string> {
    const chatId = generateId();
    const now = new Date().toISOString();

    const store = await readStore();
    store.chats[chatId] = {
        id: chatId,
        messages: [],
        createdAt: now,
        updatedAt: now,
    };

    await writeStore(store);
    return chatId;
}

export async function loadChat(chatId: string): Promise<UIMessage[]> {
    const store = await readStore();
    const chat = store.chats[chatId];

    if (!chat) {
        return [];
    }

    return chat.messages;
}

export async function saveChat(params: { chatId: string; messages: UIMessage[]; }): Promise<void> {
    const { chatId, messages } = params;
    const store = await readStore();

    if (!store.chats[chatId]) {
        const now = new Date().toISOString();
        store.chats[chatId] = {
            id: chatId,
            messages: [],
            createdAt: now,
            updatedAt: now,
        };
    }

    store.chats[chatId].messages = messages;
    store.chats[chatId].updatedAt = new Date().toISOString();

    await writeStore(store);
}

