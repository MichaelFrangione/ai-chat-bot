import {
    UIMessage,
    validateUIMessages,
} from 'ai';
import { dadJokeTool } from '@/tools/dadJoke';
import { generateImageValidationTool } from '@/tools/generateImage';
import { movieSearchTool } from '@/tools/movieSearch';
import { redditTool } from '@/tools/reddit';
import { websiteScraperTool } from '@/tools/websiteScraper';
import { youtubeTranscriberTool } from '@/tools/youtubeTranscriber';

// Import utility classes
import { MessageManager } from '@/utils/message-manager';
import { PersonalityHandler } from '@/utils/personality-handler';
import { ConversationManager } from '@/utils/conversation-manager';
import { ImageProcessingHandler } from '@/utils/image-processing-handler';
import { ChatStreamHandler } from '@/utils/chat-stream-handler';
import { ResponseHandler } from '@/utils/response-handler';

export const maxDuration = 30;

// Define tools for validation
const tools = {
    dad_joke: dadJokeTool,
    generate_image: generateImageValidationTool,
    movie_search: movieSearchTool,
    reddit: redditTool,
    websiteScraper: websiteScraperTool,
    youtubeTranscriber: youtubeTranscriberTool,
};

export async function POST(req: Request) {
    try {
        // Parse and validate request
        const { message, id: chatId } = await req.json() as { message: UIMessage; id: string; };

        if (!chatId || !message) {
            return ResponseHandler.createValidationErrorResponse('Both message and id are required');
        }

        console.log('=== CHAT REQUEST ===');
        console.log('Chat ID:', chatId);

        // Load and merge messages
        const messages = await MessageManager.loadAndMergeMessages(chatId, message);
        console.log('Messages count:', messages.length);

        // Get personality and build system prompt
        const personality = PersonalityHandler.getPersonalityFromRequest(req);
        console.log('Personality from cookie:', personality);

        // Handle conversation summarization
        const { summary, messagesToProcess } = await ConversationManager.handleConversation(chatId, messages);
        const systemPrompt = PersonalityHandler.buildSystemPrompt(personality, summary);

        // Validate messages
        const validatedMessages = await validateUIMessages({
            messages: messagesToProcess,
            tools: tools as any,
        });

        // Handle image processing if needed
        if (ImageProcessingHandler.needsImageProcessing(validatedMessages)) {
            return ImageProcessingHandler.createImageProcessingStream(
                validatedMessages,
                systemPrompt,
                tools,
                chatId,
                summary
            );
        }

        // Normal chat flow
        return ChatStreamHandler.createNormalChatStream(
            validatedMessages,
            systemPrompt,
            tools,
            chatId,
            summary
        );

    } catch (error) {
        console.error('=== API ERROR ===');
        console.error('Error:', error);
        return ResponseHandler.createErrorResponse('Failed to process request', 500, error);
    }
}
