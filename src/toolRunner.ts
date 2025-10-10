import openai, { OpenAI } from "openai";
import { dadJoke, dadJokeToolDefinition } from "./tools/dadJoke";
import { generateImage, generateImageToolDefinition } from "./tools/generateImage";
import { reddit, redditToolDefinition } from "./tools/reddit";
import { movieSearch, movieSearchToolDefinition } from "./tools/movieSearch";
import { youtubeTranscriber, youtubeTranscriberToolDefinition } from "./tools/YoutubeTranscriber";
import { PersonalityKey } from "./constants/personalities";

export const runTool = async (
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
    userMessage: string,
    personality?: PersonalityKey
) => {
    console.log('=== TOOL RUNNER START ===');
    console.log('Tool call name:', (toolCall as any).function.name);
    console.log('User message:', userMessage.substring(0, 50) + '...');
    console.log('Personality:', personality);

    // Type guard to ensure we have a function tool call
    if (toolCall.type !== 'function') {
        console.error('Invalid tool call type:', toolCall.type);
        return JSON.stringify({
            type: 'error',
            data: {
                error: true,
                message: 'Invalid tool call type'
            },
            metadata: {
                title: 'Tool Error',
                description: 'Tool call is not a function call'
            },
            contextualMessage: 'Sorry, I encountered an error with the tool call.'
        });
    }

    let toolArgs;
    try {
        console.log('Parsing tool arguments...');
        toolArgs = JSON.parse((toolCall as any).function.arguments);
        console.log('Tool arguments parsed successfully:', Object.keys(toolArgs));
    } catch (error) {
        console.error('=== TOOL ARGUMENTS PARSING FAILED ===');
        console.error('Error parsing tool call arguments:', error);
        console.error('Raw arguments:', (toolCall as any).function.arguments);
        console.error('Tool call:', JSON.stringify(toolCall, null, 2));

        // Return a structured error response
        return JSON.stringify({
            type: 'error',
            data: {
                error: true,
                message: 'Invalid tool call arguments'
            },
            metadata: {
                title: 'Tool Error',
                description: 'Unable to parse tool arguments'
            },
            contextualMessage: `Sorry, I encountered an error with the ${(toolCall as any).function.name} tool. The tool call had invalid arguments.`
        });
    }

    const input = {
        userMessage,
        toolArgs,
        personality,
    };

    console.log('=== EXECUTING TOOL ===');
    console.log('Tool name:', (toolCall as any).function.name);

    let result;
    try {
        switch ((toolCall as any).function.name) {
            case dadJokeToolDefinition.name:
                result = await dadJoke(input);
                break;
            case generateImageToolDefinition.name:
                result = await generateImage(input);
                break;
            case redditToolDefinition.name:
                result = await reddit(input);
                break;
            case movieSearchToolDefinition.name:
                result = await movieSearch(input);
                break;
            case youtubeTranscriberToolDefinition.name:
                result = await youtubeTranscriber(input);
                break;
            default:
                result = `Unknown tool do not call this tool: ${(toolCall as any).function.name}`;
        }
        console.log('=== TOOL EXECUTION SUCCESS ===');
        console.log('Result length:', result?.length || 0);
        return result;
    } catch (error) {
        console.error('=== TOOL EXECUTION FAILED ===');
        console.error('Tool execution error:', error);
        throw error;
    }
};