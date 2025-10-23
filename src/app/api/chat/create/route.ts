import { createChat } from '@/utils/chat-store';

export async function POST() {
    try {
        const chatId = await createChat();

        return new Response(JSON.stringify({ chatId }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to create chat:', error);

        return new Response(JSON.stringify({
            error: 'Failed to create chat',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

