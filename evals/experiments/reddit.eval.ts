import { runLLM } from '../../src/llm';
import { redditTool } from '../../src/tools/reddit';
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
            tools: [redditTool],
        }),
    data: [
        // Basic Reddit requests - AI provides default parameters
        {
            input: 'find me something interesting on reddit',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'show me the top posts from reddit',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'what\'s trending on reddit today?',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },

        // Single post requests
        {
            input: 'show me the #1 post on reddit today',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'give me the top reddit post',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'what is the most popular post right now?',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },

        // Limited posts requests
        {
            input: 'show me the top 5 posts',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5 }),
        },
        {
            input: 'get me 3 trending posts',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 3 }),
        },

        // Subreddit-specific requests
        {
            input: 'show me posts from r/funny',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedSubreddit: 'funny' }),
        },
        {
            input: 'what\'s happening in r/news?',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedSubreddit: 'news' }),
        },
        {
            input: 'show me the top post from r/technology',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedSubreddit: 'technology', expectedLimit: 1 }),
        },
        {
            input: 'get me 5 posts from r/movies',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedSubreddit: 'movies', expectedLimit: 5 }),
        },

        // Edge cases - AI provides default parameters
        {
            input: 'reddit posts please',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
        {
            input: 'can you browse reddit for me?',
            expected: createToolCallMessage('reddit'),
            reference: JSON.stringify({ expectedLimit: 5, expectedSubreddit: null }),
        },
    ],
    scorers: [ToolCallMatch, ToolCallWithParams, RedditParamsMatch],
});