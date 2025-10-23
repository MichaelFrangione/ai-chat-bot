import { UIMessage, streamText, convertToModelMessages, createIdGenerator } from 'ai';
import { openai } from '@ai-sdk/openai';
import { saveChat } from '@/utils/chat-store';

export class ChatStreamHandler {
    /**
     * Creates a normal chat stream (non-image processing)
     */
    static createNormalChatStream(
        validatedMessages: UIMessage[],
        systemPrompt: string,
        tools: any,
        chatId: string,
        summary: string
    ) {
        // Generate server-side message IDs for persistence
        const messageIdGenerator = createIdGenerator({
            prefix: 'msg',
            size: 16,
        });

        const result = streamText({
            model: openai('gpt-4o'),
            messages: convertToModelMessages(validatedMessages),
            system: systemPrompt,
            tools,
        });

        return result.toUIMessageStreamResponse({
            originalMessages: validatedMessages,
            generateMessageId: messageIdGenerator,
            onFinish: async ({ messages: finalMessages }) => {
                await this.saveChatIfNeeded(chatId, finalMessages, summary);
            },
        });
    }

    /**
     * Saves chat if chatId is provided
     */
    private static async saveChatIfNeeded(
        chatId: string,
        finalMessages: UIMessage[],
        summary: string
    ) {
        if (chatId) {
            console.log('💾 Saving messages. Count:', finalMessages.length);
            await saveChat({
                chatId,
                messages: finalMessages,
                summary: summary || undefined
            });
        }
    }
}
