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
    console.log('=== AGENT START ===');
    console.log('User message:', userMessage.substring(0, 100) + '...');
    console.log('Is approval:', isApproval);
    console.log('Session ID:', sessionId);
    console.log('Personality:', personality);
    console.log('Tools count:', tools.length);

    try {
        const history = await getMessages(sessionId);
        console.log('History loaded, message count:', history.length);
    } catch (error) {
        console.error('Failed to load message history:', error);
        throw error;
    }

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
        console.log('=== LLM CALL START ===');
        const history = await getMessages(sessionId);
        console.log('Current history length:', history.length);

        const systemDirectives = getPersonalityDirectives(personality);
        console.log('System directives length:', systemDirectives?.length || 0);

        let response;
        try {
            response = await runLLM({ messages: history, tools, systemPrompt: systemDirectives });
            console.log('=== LLM CALL SUCCESS ===');
            console.log('Response has content:', !!response.content);
            console.log('Response has tool_calls:', !!response.tool_calls);
            if (response.tool_calls) {
                console.log('Tool calls count:', response.tool_calls.length);
                console.log('First tool call name:', (response.tool_calls[0] as any)?.function?.name);
            }
        } catch (error) {
            console.error('=== LLM CALL FAILED ===');
            console.error('LLM error:', error);
            throw error;
        }

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
            console.log('=== TOOL EXECUTION START ===');
            const toolCall = response.tool_calls[0];
            console.log('Tool call name:', (toolCall as any).function.name);
            console.log('Tool call arguments:', (toolCall as any).function.arguments);

            if ((toolCall as any).function.name === generateImageToolDefinition.name) {
                console.log('=== IMAGE GENERATION APPROVAL NEEDED ===');
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

            let toolResponse;
            try {
                console.log('=== RUNNING TOOL ===');
                toolResponse = await runTool(toolCall, userMessage, personality);
                console.log('=== TOOL EXECUTION SUCCESS ===');
                console.log('Tool response length:', toolResponse?.length || 0);
            } catch (error) {
                console.error('=== TOOL EXECUTION FAILED ===');
                console.error('Tool error:', error);
                throw error;
            }

            try {
                await saveToolResponse((toolCall as any).id, toolResponse, sessionId);
                console.log('Tool response saved successfully');
            } catch (error) {
                console.error('Failed to save tool response:', error);
                throw error;
            }

            loader.update(`done: ${(toolCall as any).function.name}`);

            // Parse structured output from tool response and store for later
            try {
                const structuredOutput = parseToolResponse((toolCall as any).function.name, toolResponse);
                if (structuredOutput) {
                    console.log('Structured output parsed:', structuredOutput.type);
                    pendingStructuredOutput = structuredOutput;
                }
            } catch (error) {
                console.error('Failed to parse tool response:', error);
            }
        }
    }
};