import { runLLM } from '../../src/llm';
import { movieSearchToolDefinition } from '../../src/tools/movieSearch';
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

runEval('movieSearch', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [movieSearchToolDefinition],
        }),
    data: [
        {
            input: 'suggest me a good action movie',
            expected: createToolCallMessage(movieSearchToolDefinition.name),
        },
        {
            input: "i want to find a movie about aliens coming to earth can you give me some recommendations?",
            expected: createToolCallMessage(movieSearchToolDefinition.name),
        },
        {
            input: 'find me some movies based in italy and heist themed movies',
            expected: createToolCallMessage(movieSearchToolDefinition.name),
        },
    ],
    scorers: [ToolCallMatch],
});