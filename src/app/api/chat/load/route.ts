import { loadChat } from '@/util/chat-store';

export async function POST(req: Request) {
    try {
        const { chatId } = await req.json();

        if (!chatId) {
            return new Response(JSON.stringify({
                error: 'Chat ID is required',
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const messages = await loadChat(chatId);

        return new Response(JSON.stringify({ messages }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Failed to load chat:', error);

        return new Response(JSON.stringify({
            error: 'Failed to load chat',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

