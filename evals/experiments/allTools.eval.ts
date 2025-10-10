import { runLLM } from '../../src/llm';
import { dadJokeToolDefinition } from '../../src/tools/dadJoke';
import { generateImageToolDefinition } from '../../src/tools/generateImage';
import { movieSearchToolDefinition } from '../../src/tools/movieSearch';
import { redditToolDefinition } from '../../src/tools/reddit';
import { youtubeTranscriberToolDefinition } from '../../src/tools/youtubeTranscriber';
import { websiteScraperToolDefinition } from '../../src/tools/websiteScraper';
import { runEval } from '../evalTools';
import { ToolCallMatch } from '../scorers';

const createToolCallMessage = (toolName: string) => ({
    role: 'assistant',
    tool_calls: [
        {
            type: 'function',
            function: {
                name: toolName,
            },
        },
    ],
});

const allTools = [
    dadJokeToolDefinition,
    generateImageToolDefinition,
    redditToolDefinition,
    movieSearchToolDefinition,
    youtubeTranscriberToolDefinition,
    websiteScraperToolDefinition
];

runEval('allTools', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: allTools,
        }),
    data: [
        {
            input: 'tell me a funny dad joke',
            expected: createToolCallMessage(dadJokeToolDefinition.name),
        },
        {
            input: 'generate an image of mars',
            expected: createToolCallMessage(generateImageToolDefinition.name),
        },
        {
            input: 'what is the most upvoted post on reddit',
            expected: createToolCallMessage(redditToolDefinition.name),
        },
        {
            input: 'what movies did Christopher Nolan direct?',
            expected: createToolCallMessage(movieSearchToolDefinition.name),
        },
        {
            input: 'https://www.youtube.com/watch?v=abc123 what are the main points in this video?',
            expected: createToolCallMessage(youtubeTranscriberToolDefinition.name),
        },
        {
            input: 'summarize this article: https://example.com/news-article',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
    ],
    scorers: [ToolCallMatch],
});