import { runLLM } from '../../src/llm';
import { dadJokeTool } from '../../src/tools/dadJoke';
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

runEval('dadJoke', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [dadJokeTool],
        }),
    data: [
        {
            input: 'tell me a funny dad joke',
            expected: createToolCallMessage('dad_joke'),
        },
    ],
    scorers: [ToolCallMatch],
});