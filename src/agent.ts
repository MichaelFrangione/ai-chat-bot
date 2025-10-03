import { addMessages, getMessages, saveToolResponse } from './memory';
import { runApprovalCheck, runLLM } from './llm';
import { showLoader, logMessage } from './ui';
import { runTool } from './toolRunner';
import { generateImageToolDefinition } from './tools/generateImage';
import { parseToolResponse } from './lib/structured-parser';
import type { AIMessage } from '../types';

const handleImageApprovalFlow = async (
    history: AIMessage[],
    userMessage: string
) => {
    const lastMessage = history.at(-1);
    const toolCall = (lastMessage as any)?.tool_calls?.[0];

    if (
        !toolCall ||
        toolCall.function.name !== generateImageToolDefinition.name
    ) {
        return false;
    }

    const loader = showLoader('Processing approval...');
    const approved = await runApprovalCheck(userMessage);

    if (approved) {
        loader.update(`executing tool: ${toolCall.function.name}`);
        const toolResponse = await runTool(toolCall, userMessage);

        loader.update(`done: ${toolCall.function.name}`);
        await saveToolResponse(toolCall.id, toolResponse);
    } else {
        await saveToolResponse(
            toolCall.id,
            'User did not approve image generation at this time.'
        );
    }

    loader.stop();
    return true;
};

export const runAgent = async ({
    userMessage,
    tools,
    isApproval = false,
}: {
    userMessage: string;
    tools: any[];
    isApproval?: boolean;
}) => {
    const history = await getMessages();

    // Handle approval flow if this is an approval response
    if (isApproval) {
        const lastMessage = history.at(-1);
        const toolCall = (lastMessage as any)?.tool_calls?.[0];

        if (toolCall && toolCall.function.name === generateImageToolDefinition.name) {
            const approved = userMessage.toLowerCase() === 'yes' || userMessage.toLowerCase() === 'y';
            let structuredOutput: any = null;

            if (approved) {
                const toolResponse = await runTool(toolCall, userMessage);
                await saveToolResponse(toolCall.id, toolResponse);

                // Parse structured output from tool response
                structuredOutput = parseToolResponse(toolCall.function.name, toolResponse);
                if (structuredOutput) {
                    // Add structured output to the last message
                    const lastMessage = (await getMessages()).at(-1);
                    if (lastMessage) {
                        (lastMessage as any).structuredOutput = structuredOutput;
                    }
                }
            } else {
                await saveToolResponse(
                    toolCall.id,
                    'User did not approve image generation at this time.'
                );
            }

            // Continue with the conversation
            const newHistory = await getMessages();
            const response = await runLLM({ messages: newHistory, tools });

            // Attach structured output to the final response if available
            if (structuredOutput) {
                (response as any).structuredOutput = structuredOutput;
                // Clear text content to avoid duplication
                response.content = "";
            }

            await addMessages([response]);
            return getMessages();
        }
    }

    // Regular message flow
    if (!isApproval) {
        await addMessages([{ role: 'user', content: userMessage }]);
    }

    const loader = showLoader('🤔');

    let pendingStructuredOutput: any = null;

    while (true) {
        const history = await getMessages();
        const response = await runLLM({ messages: history, tools });

        if (response.content) {
            loader.stop();
            logMessage(response);

            // Attach any pending structured output to the final response before saving
            if (pendingStructuredOutput) {
                (response as any).structuredOutput = pendingStructuredOutput;
                // If we have structured output, clear the text content to avoid duplication
                // The structured output will handle the display
                response.content = "";
            }

            await addMessages([response]);
            return getMessages();
        }

        // Only add tool call messages if they're not the final response
        if (response.tool_calls) {
            await addMessages([response]);
        }

        if (response.tool_calls) {
            const toolCall = response.tool_calls[0];

            if ((toolCall as any).function.name === generateImageToolDefinition.name) {
                loader.stop();
                logMessage(response);
                // Return with approval needed flag
                return {
                    messages: await getMessages(),
                    needsApproval: true,
                    approvalType: 'image',
                    toolCall: toolCall
                };
            }

            logMessage(response);

            loader.update(`executing: ${(toolCall as any).function.name}`);
            const toolResponse = await runTool(toolCall, userMessage);
            await saveToolResponse((toolCall as any).id, toolResponse);
            loader.update(`done: ${(toolCall as any).function.name}`);

            // Parse structured output from tool response and store for later
            const structuredOutput = parseToolResponse((toolCall as any).function.name, toolResponse);
            if (structuredOutput) {
                pendingStructuredOutput = structuredOutput;
            }
        }
    }
};