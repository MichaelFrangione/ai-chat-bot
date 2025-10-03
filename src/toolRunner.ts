import openai, { OpenAI } from "openai";
import { dadJoke, dadJokeToolDefinition } from "./tools/dadJoke";
import { generateImage, generateImageToolDefinition } from "./tools/generateImage";
import { reddit, redditToolDefinition } from "./tools/reddit";
import { movieSearch, movieSearchToolDefinition } from "./tools/movieSearch";

export const runTool = async (
    toolCall: OpenAI.Chat.Completions.ChatCompletionMessageToolCall,
    userMessage: string
) => {

    const input = {
        userMessage,
        toolArgs: JSON.parse(toolCall.function.arguments),
    };

    switch (toolCall.function.name) {
        case dadJokeToolDefinition.name:
            return dadJoke(input);
        case generateImageToolDefinition.name:
            return generateImage(input);
        case redditToolDefinition.name:
            return reddit(input);
        case movieSearchToolDefinition.name:
            return movieSearch(input);
        default:
            return `Unknown tool do not call this tool: ${toolCall.function.name}`;
    }
};