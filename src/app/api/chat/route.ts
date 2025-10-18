import { openai } from '@ai-sdk/openai';
import {
    streamText,
    convertToModelMessages,
    UIMessage,
    createUIMessageStream,
    createUIMessageStreamResponse,
    isToolUIPart,
    validateUIMessages,
    createIdGenerator
} from 'ai';
import { dadJokeTool } from '@/tools/dadJoke';
import { generateImage } from '@/tools/generateImage';
import { getPersonalityDirectives, PersonalityKey } from '@/constants/personalities';
import { loadChat, saveChat, getChatSummary } from '@/util/chat-store';
import {
    shouldSummarize,
    splitMessagesForSummarization,
    summarizeConversation
} from '../../../../src/util/summarization';
import { z } from 'zod';

export const maxDuration = 30;

// Define tools for validation
const tools = {
    dad_joke: dadJokeTool,
    generate_image: {
        description: 'Generate an image from a text prompt. Use this when user asks to create, generate, or make an image.',
        inputSchema: z.object({
            prompt: z.string().describe('The prompt to generate the image'),
        }),
    },
};

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { message, id: chatId } = body as { message?: UIMessage; id?: string; messages?: UIMessage[]; };

        // Support both old format (messages array) and new format (single message + id)
        let messages: UIMessage[];

        if (chatId && message) {
            // New format with persistence
            const previousMessages = await loadChat(chatId);
            // Append new message and deduplicate by ID (keeps last occurrence)
            // This handles tool calls where client sends updated assistant message
            const allMessages = [...previousMessages, message];
            messages = Array.from(
                new Map(allMessages.map(msg => [msg.id, msg])).values()
            );
        } else if (body.messages) {
            // Old format for backward compatibility
            messages = body.messages;
        } else {
            return new Response(JSON.stringify({
                error: 'Either provide { message, id } or { messages }',
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Read personality from cookie (simple, reliable, server-side) 
        const cookieHeader = req.headers.get('cookie') || '';
        const personalityCookie = cookieHeader
            .split(';')
            .find(c => c.trim().startsWith('personality='))
            ?.split('=')[1]
            ?.trim();

        const personality = (personalityCookie as PersonalityKey) || 'assistant';

        console.log('=== CHAT REQUEST ===');
        console.log('Chat ID:', chatId);
        console.log('Cookie header:', cookieHeader);
        console.log('Personality from cookie:', personality);
        console.log('Messages count:', messages.length);

        // Check if we need to summarize
        let summary = '';
        let messagesToProcess = messages;

        if (chatId && shouldSummarize(messages.length)) {
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

        // Build system prompt with summary if available
        let systemPrompt = getPersonalityDirectives(personality);
        if (summary && summary.length > 0) {
            systemPrompt = `Previous conversation summary: ${summary}\n\n${systemPrompt}`;
        }

        console.log('System prompt (first 200 chars):', systemPrompt.substring(0, 200));

        // Validate messages if they contain tools (use trimmed messages if summarized)
        const validatedMessages = await validateUIMessages({
            messages: messagesToProcess,
            tools: tools as any,
        });

        // Generate server-side message IDs for persistence
        const messageIdGenerator = createIdGenerator({
            prefix: 'msg',
            size: 16,
        });

        // Check if we need to handle image generation approval
        const lastMessage = validatedMessages[validatedMessages.length - 1];
        let needsImageProcessing = false;

        if (lastMessage && lastMessage.parts) {
            for (const part of lastMessage.parts) {
                if (isToolUIPart(part) && part.type === 'tool-generate_image' && part.state === 'output-available' && part.output === 'APPROVED') {
                    needsImageProcessing = true;
                    break;
                }
            }
        }

        if (needsImageProcessing) {
            // Use createUIMessageStream to handle image generation
            const stream = createUIMessageStream({
                originalMessages: validatedMessages,
                execute: async ({ writer }) => {
                    // Process image generation
                    for (const part of lastMessage.parts) {
                        if (isToolUIPart(part) && part.type === 'tool-generate_image' && part.state === 'output-available' && part.output === 'APPROVED') {
                            console.log('✅ Fresh approval - generating image with your existing tool');

                            try {
                                const promptValue = (part as any).input.prompt;
                                const result = await generateImage({
                                    toolArgs: { prompt: promptValue },
                                    userMessage: promptValue,
                                    personality
                                });

                                console.log('🎨 Image generation result:', result.substring(0, 100));

                                // Parse the structured response to get the image URL
                                const parsed = JSON.parse(result);
                                const imageUrl = parsed.data?.url;

                                if (imageUrl) {
                                    // Update the tool result with real image URL
                                    writer.write({
                                        type: 'tool-output-available',
                                        toolCallId: part.toolCallId,
                                        output: imageUrl,
                                    });
                                }
                            } catch (error) {
                                console.error('❌ Image generation error:', error);
                                writer.write({
                                    type: 'tool-output-error',
                                    toolCallId: part.toolCallId,
                                    errorText: 'Failed to generate image',
                                });
                            }
                        }
                    }

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
                    if (chatId) {
                        console.log('💾 Saving messages. Count:', finalMessages.length);
                        // Save with summary if we generated one
                        await saveChat({
                            chatId,
                            messages: finalMessages,
                            summary: summary || undefined
                        });
                    }
                },
            });

            return createUIMessageStreamResponse({ stream });
        } else {
            // Normal flow for all other cases
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
                    if (chatId) {
                        console.log('💾 Saving messages. Count:', finalMessages.length);
                        // Save with summary if we generated one
                        await saveChat({
                            chatId,
                            messages: finalMessages,
                            summary: summary || undefined
                        });
                    }
                },
            });
        }
    } catch (error) {
        console.error('=== API ERROR ===');
        console.error('Error:', error);

        // Return a proper error response that the frontend can handle
        return new Response(JSON.stringify({
            error: 'Failed to process request',
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
