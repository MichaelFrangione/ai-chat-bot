import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { movieSearchTool } from '../../src/tools/movieSearch';
import { runEval } from '../evalTools';
import { ToolCallMatch, ToolCallWithParams, MovieSearchParamsMatch } from '../scorers';

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
    task: async (input) => {
        // Add delay to avoid rate limits (2 seconds for movieSearch due to complex queries)
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const result = await generateText({
                model: openai('gpt-4o'),
                messages: [{ role: 'user', content: input }],
                tools: {
                    movie_search: movieSearchTool
                },
                temperature: 1
            });

            // Transform AI SDK result to match scorer expectations
            if (result.steps && result.steps.length > 0) {
                const toolCalls = result.steps[0].content.filter((item: any) => item.type === 'tool-call');
                if (toolCalls.length > 0) {
                    return {
                        role: 'assistant',
                        tool_calls: toolCalls.map((toolCall: any) => ({
                            type: 'function',
                            function: {
                                name: toolCall.toolName,
                                arguments: JSON.stringify(toolCall.input)
                            }
                        }))
                    };
                }
            }

            return {
                role: 'assistant',
                content: result.text || 'No content'
            };
        } catch (error: any) {
            // Handle rate limit errors gracefully
            if (error.message?.includes('rate limit') || error.message?.includes('429')) {
                console.log('Rate limit hit, waiting 5 seconds...');
                await new Promise(resolve => setTimeout(resolve, 5000));
                // Retry once
                const retryResult = await generateText({
                    model: openai('gpt-4o'),
                    messages: [{ role: 'user', content: input }],
                    tools: {
                        movie_search: movieSearchTool
                    },
                    temperature: 1
                });

                // Transform retry result to match scorer expectations
                if (retryResult.steps && retryResult.steps.length > 0) {
                    const toolCalls = retryResult.steps[0].content.filter((item: any) => item.type === 'tool-call');
                    if (toolCalls.length > 0) {
                        return {
                            role: 'assistant',
                            tool_calls: toolCalls.map((toolCall: any) => ({
                                type: 'function',
                                function: {
                                    name: toolCall.toolName,
                                    arguments: JSON.stringify(toolCall.input)
                                }
                            }))
                        };
                    }
                }

                return {
                    role: 'assistant',
                    content: retryResult.text || 'No content'
                };
            }
            throw error;
        }
    },
    data: [
        // Basic movie requests - AI uses keyword search and defaults to limit=1
        {
            input: 'suggest me a good action movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Action', expectedLimit: 1 }),
        },

        // Single movie requests (should use limit=1)
        {
            input: 'give me the ultimate sci-fi movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },
        {
            input: 'recommend me one comedy movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: 1 }),
        },

        // Genre-specific requests
        {
            input: 'I want to watch a horror movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Horror', expectedLimit: 1 }),
        },
        {
            input: 'show me drama movies',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Drama', expectedLimit: null }),
        },

        // Director-specific requests
        {
            input: 'show me movies by Christopher Nolan',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Christopher Nolan', expectedLimit: null }),
        },

        // Thematic requests (should use keyword search, not genre filters)
        {
            input: 'movies about space exploration',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedGenre: 'Sci-Fi', expectedLimit: null }),
        },
        {
            input: 'movies set in the 1920s',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedLimit: null }),
        },

        // Complex requests
        {
            input: 'show me the best Christopher Nolan sci-fi movie',
            expected: createToolCallMessage('movie_search'),
            reference: JSON.stringify({ expectedDirector: 'Christopher Nolan', expectedLimit: 1 }),
        },
    ],
    scorers: [ToolCallMatch, ToolCallWithParams, MovieSearchParamsMatch],
});