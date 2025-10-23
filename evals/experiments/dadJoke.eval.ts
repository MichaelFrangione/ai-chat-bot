import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
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
    task: async (input) => {
        const result = await generateText({
            model: openai('gpt-4o'),
            messages: [{ role: 'user', content: input }],
            tools: {
                dad_joke: dadJokeTool
            },
            temperature: 1
        });

        // Transform AI SDK result to match scorer expectations
        if (result.toolCalls && result.toolCalls.length > 0) {
            return {
                role: 'assistant',
                tool_calls: result.toolCalls.map((toolCall: any) => ({
                    type: 'function',
                    function: {
                        name: toolCall.toolName,
                        arguments: JSON.stringify(toolCall.args)
                    }
                }))
            };
        } else {
            return {
                role: 'assistant',
                content: result.text
            };
        }
    },
    data: [
        {
            input: 'tell me a funny dad joke',
            expected: createToolCallMessage('dad_joke'),
        },
    ],
    scorers: [ToolCallMatch],
});