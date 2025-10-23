import { runLLM } from '../../src/llm';
import { dadJokeTool } from '../../src/tools/dadJoke';
import { generateImageTool } from '../../src/tools/generateImage';
import { movieSearchTool } from '../../src/tools/movieSearch';
import { redditTool } from '../../src/tools/reddit';
import { youtubeTranscriberTool } from '../../src/tools/youtubeTranscriber';
import { websiteScraperTool } from '../../src/tools/websiteScraper';
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
    dadJokeTool,
    generateImageTool,
    redditTool,
    movieSearchTool,
    youtubeTranscriberTool,
    websiteScraperTool
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
            expected: createToolCallMessage('dad_joke'),
        },
        {
            input: 'generate an image of mars',
            expected: createToolCallMessage('generate_image'),
        },
        {
            input: 'what is the most upvoted post on reddit',
            expected: createToolCallMessage('reddit'),
        },
        {
            input: 'what movies did Christopher Nolan direct?',
            expected: createToolCallMessage('movie_search'),
        },
        {
            input: 'https://www.youtube.com/watch?v=abc123 what are the main points in this video?',
            expected: createToolCallMessage('youtubeTranscriber'),
        },
        {
            input: 'summarize this article: https://example.com/news-article',
            expected: createToolCallMessage('websiteScraper'),
        },
    ],
    scorers: [ToolCallMatch],
});