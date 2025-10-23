import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
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

runEval('websiteScraper', {
    task: async (input) => {
        const result = await generateText({
            model: openai('gpt-4o'),
            messages: [{ role: 'user', content: input }],
            tools: {
                websiteScraper: websiteScraperTool
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
        // Direct article URL with question
        {
            input: 'https://example.com/article what is this article about?',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'can you tell me what https://news.example.com/story is about?',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Summarization requests
        {
            input: 'summarize this article: https://blog.example.com/post',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'give me a summary of https://medium.com/article-title',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'what is the summary of this webpage https://example.com/page',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Specific questions about article content
        {
            input: 'https://news.example.com/politics what are the main arguments in this article?',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'what was the conclusion of this article? https://blog.example.com/analysis',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'can you find what they say about climate change in this article: https://science.example.com/climate',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Key points and takeaways
        {
            input: 'what are the key points from https://example.com/research',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'list the main findings in this article https://journal.example.com/study',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Different phrasing
        {
            input: 'analyze this article: https://news.example.com/breaking',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'read this and tell me the main points: https://blog.example.com/post-2024',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'what does this article say? https://example.com/opinion',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Complex questions
        {
            input: 'https://example.com/comparison compare the different approaches mentioned in this article',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'what evidence does the author provide in this article: https://research.example.com/paper',
            expected: createToolCallMessage('websiteScraper'),
        },

        // News-specific requests
        {
            input: 'what happened according to this news article? https://news.example.com/breaking-news',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'give me the facts from this article: https://nytimes.com/article-title',
            expected: createToolCallMessage('websiteScraper'),
        },

        // Blog/opinion pieces
        {
            input: 'what is the author\'s opinion in this blog post? https://medium.com/@author/post',
            expected: createToolCallMessage('websiteScraper'),
        },
        {
            input: 'summarize the arguments in this opinion piece: https://example.com/opinion-2024',
            expected: createToolCallMessage('websiteScraper'),
        },
    ],
    scorers: [ToolCallMatch],
});

