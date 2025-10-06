import { addMessages, getMessages, saveToolResponse } from './memory';
import { runApprovalCheck, runLLM } from './llm';
import { showLoader, logMessage } from './ui';
import { runTool } from './toolRunner';
import { generateImageToolDefinition } from './tools/generateImage';
import { parseToolResponse, parseAssistantResponse } from './lib/structured-parser';
import type { AIMessage } from '../types';
import { getPersonalityDirectives, PersonalityKey } from './constants/personalities';

const handleImageApprovalFlow = async (
    history: AIMessage[],
    userMessage: string,
    sessionId?: string
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
        await saveToolResponse(toolCall.id, toolResponse, sessionId);
    } else {
        await saveToolResponse(
            toolCall.id,
            'User did not approve image generation at this time.',
            sessionId
        );
    }

    loader.stop();
    return true;
};

export const runAgent = async ({
    userMessage,
    tools,
    isApproval = false,
    sessionId,
    personality,
}: {
    userMessage: string;
    tools: any[];
    isApproval?: boolean;
    sessionId?: string;
    personality?: PersonalityKey;
}) => {
    const history = await getMessages(sessionId);

    // Handle approval flow if this is an approval response
    if (isApproval) {
        const lastMessage = history.at(-1);
        const toolCall = (lastMessage as any)?.tool_calls?.[0];

        if (toolCall && toolCall.function.name === generateImageToolDefinition.name) {
            const approved = userMessage.toLowerCase() === 'yes' || userMessage.toLowerCase() === 'y';
            let structuredOutput: any = null;

            if (approved) {
                const toolResponse = await runTool(toolCall, userMessage);
                await saveToolResponse(toolCall.id, toolResponse, sessionId);

                // Parse structured output from tool response
                structuredOutput = parseToolResponse(toolCall.function.name, toolResponse);
                if (structuredOutput) {
                    // Add structured output to the last message
                    const lastMessage = (await getMessages(sessionId)).at(-1);
                    if (lastMessage) {
                        (lastMessage as any).structuredOutput = structuredOutput;
                    }
                }
            } else {
                await saveToolResponse(
                    toolCall.id,
                    'User did not approve image generation at this time.',
                    sessionId
                );
            }

            // Continue with the conversation
            const newHistory = await getMessages(sessionId);
            const response = await runLLM({ messages: newHistory, tools });

            // Attach structured output to the final response if available
            if (structuredOutput) {
                (response as any).structuredOutput = structuredOutput;
                // Clear text content to avoid duplication
                response.content = "";
            }

            await addMessages([response], sessionId);
            return getMessages(sessionId);
        }
    }

    // Regular message flow
    if (!isApproval) {
        await addMessages([{ role: 'user', content: userMessage }], sessionId);
    }

    const loader = showLoader('🤔');

    let pendingStructuredOutput: any = null;

    while (true) {
        const history = await getMessages(sessionId);
        const systemDirectives = getPersonalityDirectives(personality);
        const response = await runLLM({ messages: history, tools, systemPrompt: systemDirectives });

        if (response.content) {
            loader.stop();
            logMessage(response);

            console.log('Assistant response content:', response.content);
            console.log('Pending structured output:', pendingStructuredOutput);

            if (pendingStructuredOutput) {
                console.log('Using pending structured output from tool');
                // Attach any pending structured output from tools
                (response as any).structuredOutput = pendingStructuredOutput;
                // If we have structured output, clear the text content to avoid duplication
                response.content = "";
            } else {
                console.log('No pending structured output, checking assistant response');
                // Only check for assistant structured output if no tool output is pending
                const assistantStructuredOutput = parseAssistantResponse(response.content);
                if (assistantStructuredOutput) {
                    console.log('Found assistant structured output:', assistantStructuredOutput.type);
                    (response as any).structuredOutput = assistantStructuredOutput;
                    // Clear the text content to avoid duplication
                    response.content = "";
                }
            }

            await addMessages([response], sessionId);
            return getMessages(sessionId);
        }

        // Only add tool call messages if they're not the final response
        if (response.tool_calls) {
            await addMessages([response], sessionId);
        }

        if (response.tool_calls) {
            const toolCall = response.tool_calls[0];

            if ((toolCall as any).function.name === generateImageToolDefinition.name) {
                loader.stop();
                logMessage(response);
                // Return with approval needed flag
                return {
                    messages: await getMessages(sessionId),
                    needsApproval: true,
                    approvalType: 'image',
                    toolCall: toolCall
                };
            }

            logMessage(response);

            loader.update(`executing: ${(toolCall as any).function.name}`);
            const toolResponse = await runTool(toolCall, userMessage);
            await saveToolResponse((toolCall as any).id, toolResponse, sessionId);
            loader.update(`done: ${(toolCall as any).function.name}`);

            // Parse structured output from tool response and store for later
            const structuredOutput = parseToolResponse((toolCall as any).function.name, toolResponse);
            if (structuredOutput) {
                pendingStructuredOutput = structuredOutput;
            }
        }
    }
};