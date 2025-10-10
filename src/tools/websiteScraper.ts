import type { ToolFn } from "../../types";
import { z } from "zod";
import { PersonalityKey, getPersonalityDirectives } from "../constants/personalities";
import { createEmbeddings, search } from "./utils";
import { openai } from "../ai";
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';

export const websiteScraperToolDefinition = {
    name: "websiteScraper",
    parameters: z.object({
        url: z.string().describe("The URL of the article/website to analyze."),
        question: z.string().describe("The user's question or request about the article (e.g., 'what are the main points?', 'summarize this article')"),
    }),
    description: "Answer questions about articles or web pages by analyzing their content. Use this tool when users ask questions about articles, request summaries, or want to find specific information from a webpage.",
};

type Args = z.infer<typeof websiteScraperToolDefinition.parameters>;
export const websiteScraper: ToolFn<Args, string> = async ({ toolArgs, userMessage, personality }: { toolArgs: Args; userMessage: string; personality?: PersonalityKey; }) => {
    const { url, question } = toolArgs;

    console.log(`🌐 Processing article: ${url}`);
    console.log(`❓ Question: ${question}`);

    // Load and process article
    const article = await loadArticleContent(url);
    const documents = await createEmbeddings(article.chunks);

    // Find most relevant sections (get more chunks for better context)
    const relevant = await search(question, documents, 5);

    console.log(`✅ Found ${relevant.length} relevant article sections`);

    // Build context from relevant chunks
    const context = relevant
        .map((chunk: any, idx: number) => {
            return `Section ${chunk.metadata.position + 1}: ${chunk.text}`;
        })
        .join('\n\n');

    // Build system prompt with personality if provided
    const basePrompt = `You are a helpful assistant that answers questions about articles and web pages. 

Instructions:
- Answer the user's question using ONLY the provided article sections
- Be specific and reference the content directly
- If the article doesn't contain enough information to fully answer the question, say so
- For summaries, organize your response with clear structure
- Be concise but thorough`;

    const systemPrompt = personality && personality !== 'assistant'
        ? `${getPersonalityDirectives(personality)}

${basePrompt}

IMPORTANT: Maintain your personality throughout the ENTIRE response, not just at the beginning and end.`
        : basePrompt;

    // Use LLM to answer the question based on the article
    const response = await openai.chat.completions.create({
        model: 'gpt-5-nano',
        messages: [
            {
                role: 'system',
                content: systemPrompt
            },
            {
                role: 'user',
                content: `Article: ${url}
Article Title: ${article.title}

Question: ${question}

Relevant article sections:
${context}

Please answer the question based on these article sections.`
            }
        ],
        temperature: 1,
    });

    const answer = response.choices[0].message.content || "I couldn't generate an answer based on the article.";

    console.log(`💬 Generated answer (${answer.length} chars)`);
    if (personality && personality !== 'assistant') {
        console.log(`🎭 Generated with ${personality} personality integrated`);
    }

    return answer;
};

async function loadArticleContent(url: string) {
    console.log(`📄 Fetching article content from: ${url}`);

    // Fetch the HTML
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch article: ${response.statusText}`);
    }
    const html = await response.text();

    // Parse with JSDOM
    const dom = new JSDOM(html, { url });

    // Extract clean content with Readability
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.textContent) {
        throw new Error('Could not extract article content');
    }

    console.log(`✅ Extracted article: "${article.title}"`);

    // Chunk the text
    const chunks = chunkText(article.textContent);

    console.log(`📝 Created ${chunks.length} chunks from article`);

    return {
        title: article.title || 'Unknown',
        author: article.byline || 'Unknown',
        chunks: chunks.map((text, idx) => ({
            text: text.trim(),
            metadata: {
                source: url,
                title: article.title || 'Unknown',
                position: idx
            }
        }))
    };
}

function chunkText(text: string, wordsPerChunk: number = 600): string[] {
    const words = text.split(/\s+/);
    const chunks: string[] = [];

    for (let i = 0; i < words.length; i += wordsPerChunk) {
        const chunk = words.slice(i, i + wordsPerChunk).join(' ');
        chunks.push(chunk);
    }

    return chunks;
}