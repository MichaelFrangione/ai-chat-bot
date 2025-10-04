import { runLLM } from '../../src/llm';
import { redditToolDefinition } from '../../src/tools/reddit';
import { runEval } from '../evalTools';
import { ToolCallMatch, ToolCallWithParams, RedditParamsMatch } from '../scorers';

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

runEval('reddit', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [redditToolDefinition],
        }),
    data: [
        // Basic Reddit requests - AI provides default parameters
        {
            input: 'find me something interesting on reddit',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'show me the top posts from reddit',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'what\'s trending on reddit today?',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },

        // Single post requests
        {
            input: 'show me the #1 post on reddit today',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'give me the top reddit post',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'what is the most popular post right now?',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },

        // Limited posts requests
        {
            input: 'show me the top 5 posts',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5 }),
        },
        {
            input: 'get me 3 trending posts',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 3 }),
        },

        // Subreddit-specific requests
        {
            input: 'show me posts from r/funny',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedSubreddit: 'funny' }),
        },
        {
            input: 'what\'s happening in r/news?',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedSubreddit: 'news' }),
        },
        {
            input: 'show me the top post from r/technology',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedSubreddit: 'technology', expectedLimit: 1 }),
        },
        {
            input: 'get me 5 posts from r/movies',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedSubreddit: 'movies', expectedLimit: 5 }),
        },

        // Edge cases - AI provides default parameters
        {
            input: 'reddit posts please',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'can you browse reddit for me?',
            expected: createToolCallMessage(redditToolDefinition.name),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
    ],
    scorers: [ToolCallMatch, ToolCallWithParams, RedditParamsMatch],
});