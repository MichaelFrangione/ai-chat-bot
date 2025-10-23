import { runLLM } from '../../src/llm';
import { generateImageTool } from '../../src/tools/generateImage';
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

runEval('generateImage', {
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [generateImageTool],
        }),
    data: [
        {
            input: 'generate an image of a sunset',
            expected: createToolCallMessage('generate_image'),
        },
    ],
    scorers: [ToolCallMatch],
});