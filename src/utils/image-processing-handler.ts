import { UIMessage, isToolUIPart, createUIMessageStream, createUIMessageStreamResponse, streamText, convertToModelMessages } from 'ai';
import { openai } from '@ai-sdk/openai';
import { generateImageTool } from '@/tools/generateImage';
import { PersonalityKey } from '@/constants/personalities';
import { saveChat } from '@/utils/chat-store';

export class ImageProcessingHandler {
    /**
     * Checks if the last message contains approved image generation
     */
    static needsImageProcessing(messages: UIMessage[]): boolean {
        const lastMessage = messages[messages.length - 1];

        if (!lastMessage?.parts) return false;

        return lastMessage.parts.some(part =>
            isToolUIPart(part) &&
            part.type === 'tool-generate_image' &&
            part.state === 'output-available' &&
            part.output === 'APPROVED'
        );
    }

    /**
     * Creates a stream for handling image generation
     */
    static createImageProcessingStream(
        validatedMessages: UIMessage[],
        systemPrompt: string,
        tools: any,
        chatId: string,
        summary: string
    ) {
        return createUIMessageStreamResponse({
            stream: createUIMessageStream({
                originalMessages: validatedMessages,
                execute: async ({ writer }) => {
                    // Process image generation
                    await this.processApprovedImages(validatedMessages, writer);

                    // Continue with normal LLM generation
                    const result = streamText({
                        model: openai('gpt-4o'),
                        messages: convertToModelMessages(validatedMessages),
                        system: systemPrompt,
                        tools,
                    });
                    writer.merge(result.toUIMessageStream({ originalMessages: validatedMessages }));
                },
                onFinish: async ({ messages: finalMessages }) => {
                    await this.saveChatIfNeeded(chatId, finalMessages, summary);
                },
            })
        });
    }

    /**
     * Processes approved image generations
     */
    private static async processApprovedImages(
        messages: UIMessage[],
        writer: any
    ) {
        const lastMessage = messages[messages.length - 1];

        for (const part of lastMessage.parts) {
            if (this.isApprovedImageGeneration(part)) {
                await this.executeImageGeneration(part, writer);
            }
        }
    }

    /**
     * Checks if a part is an approved image generation
     */
    private static isApprovedImageGeneration(part: any): boolean {
        return isToolUIPart(part) &&
            part.type === 'tool-generate_image' &&
            part.state === 'output-available' &&
            part.output === 'APPROVED';
    }

    /**
     * Executes image generation for a single part
     */
    private static async executeImageGeneration(part: any, writer: any) {
        const promptValue = (part as any).input.prompt;

        try {
            const result = await generateImageTool.execute({
                prompt: promptValue,
                approved: true
            }, {
                metadata: {
                    personality: 'assistant', // Default personality for image generation
                    userMessage: promptValue
                }
            });

            console.log('🎨 Image generation result:', typeof result, result);
            console.log('🔍 Sending structured response:', typeof result, result.length || 'N/A');

            // Send the full structured response
            writer.write({
                type: 'tool-output-available',
                toolCallId: part.toolCallId,
                output: result,
            });
        } catch (error) {
            this.handleImageError(error, promptValue, part.toolCallId, writer);
        }
    }

    /**
     * Handles image generation errors
     */
    private static handleImageError(
        error: any,
        promptValue: string,
        toolCallId: string,
        writer: any
    ) {
        console.error('❌ Image generation error:', {
            message: error instanceof Error ? error.message : String(error),
            prompt: promptValue
        });

        writer.write({
            type: 'tool-output-error',
            toolCallId: toolCallId,
            errorText: 'Failed to generate image',
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
