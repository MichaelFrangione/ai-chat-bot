import { UIMessage } from 'ai';
import { loadChat } from '@/utils/chat-store';

export class MessageManager {
    /**
     * Loads previous messages from chat store and merges with new message
     * Deduplicates messages by ID (keeps last occurrence)
     */
    static async loadAndMergeMessages(chatId: string, newMessage: UIMessage): Promise<UIMessage[]> {
        const previousMessages = await loadChat(chatId);
        const allMessages = [...previousMessages, newMessage];

        // Deduplicate by ID (keeps last occurrence)
        // This handles tool calls where client sends updated assistant message
        return Array.from(
            new Map(allMessages.map(msg => [msg.id, msg])).values()
        );
    }
}
