import { UIMessage } from 'ai';
import {
    shouldSummarize,
    splitMessagesForSummarization,
    summarizeConversation
} from '@/utils/summarization';
import { getChatSummary } from '@/utils/chat-store';

export interface ConversationResult {
    summary: string;
    messagesToProcess: UIMessage[];
}

export class ConversationManager {
    /**
     * Handles conversation summarization and message management
     */
    static async handleConversation(chatId: string, messages: UIMessage[]): Promise<ConversationResult> {
        let summary = '';
        let messagesToProcess = messages;

        if (shouldSummarize(messages.length)) {
            console.log('📊 Triggering summarization...');

            // Get previous summary
            const previousSummary = await getChatSummary(chatId);

            // Split messages
            const { toSummarize, toKeep } = splitMessagesForSummarization(messages);

            console.log(`📦 Summarizing ${toSummarize.length} messages, keeping ${toKeep.length} recent`);

            // Generate new summary
            summary = await summarizeConversation(toSummarize, previousSummary);
            console.log(`✅ Summary generated: ${summary.substring(0, 100)}...`);

            // Use trimmed messages for processing
            messagesToProcess = toKeep;
        } else if (chatId) {
            // Load existing summary
            summary = await getChatSummary(chatId);
        }

        return { summary, messagesToProcess };
    }
}
