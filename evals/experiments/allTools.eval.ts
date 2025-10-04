import { runLLM } from '../../src/llm';
import { dadJokeToolDefinition } from '../../src/tools/dadJoke';
import { generateImageToolDefinition } from '../../src/tools/generateImage';
import { movieSearchToolDefinition } from '../../src/tools/movieSearch';
import { redditToolDefinition } from '../../src/tools/reddit';
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

const allTools = [dadJokeToolDefinition, generateImageToolDefinition, redditToolDefinition, movieSearchToolDefinition];

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
    ],
    scorers: [ToolCallMatch],
});