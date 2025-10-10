import { runLLM } from '../../src/llm';
import { websiteScraperToolDefinition } from '../../src/tools/websiteScraper';
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
    task: (input) =>
        runLLM({
            messages: [{ role: 'user', content: input }],
            tools: [websiteScraperToolDefinition],
        }),
    data: [
        // Direct article URL with question
        {
            input: 'https://example.com/article what is this article about?',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'can you tell me what https://news.example.com/story is about?',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Summarization requests
        {
            input: 'summarize this article: https://blog.example.com/post',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'give me a summary of https://medium.com/article-title',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'what is the summary of this webpage https://example.com/page',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Specific questions about article content
        {
            input: 'https://news.example.com/politics what are the main arguments in this article?',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'what was the conclusion of this article? https://blog.example.com/analysis',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'can you find what they say about climate change in this article: https://science.example.com/climate',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Key points and takeaways
        {
            input: 'what are the key points from https://example.com/research',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'list the main findings in this article https://journal.example.com/study',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Different phrasing
        {
            input: 'analyze this article: https://news.example.com/breaking',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'read this and tell me the main points: https://blog.example.com/post-2024',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'what does this article say? https://example.com/opinion',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Complex questions
        {
            input: 'https://example.com/comparison compare the different approaches mentioned in this article',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'what evidence does the author provide in this article: https://research.example.com/paper',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // News-specific requests
        {
            input: 'what happened according to this news article? https://news.example.com/breaking-news',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'give me the facts from this article: https://nytimes.com/article-title',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },

        // Blog/opinion pieces
        {
            input: 'what is the author\'s opinion in this blog post? https://medium.com/@author/post',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
        {
            input: 'summarize the arguments in this opinion piece: https://example.com/opinion-2024',
            expected: createToolCallMessage(websiteScraperToolDefinition.name),
        },
    ],
    scorers: [ToolCallMatch],
});

