import { z } from "zod";
import { PersonalityKey, getPersonalityDirectives } from "../constants/personalities";
import { createEmbeddings, search } from "./utils";
import { openai } from "../ai";
import { Readability } from '@mozilla/readability';
import { JSDOM } from 'jsdom';


async function loadArticleContent(url: string): Promise<any | string> {
    console.log(`📄 Fetching article content from: ${url}`);

    try {
        // Fetch the HTML
        const response = await fetch(url);
        if (!response.ok) {
            return `Failed to fetch article: ${response.statusText}`;
        }
        const html = await response.text();

        // Parse with JSDOM
        const dom = new JSDOM(html, { url });

        // Extract clean content with Readability
        const reader = new Readability(dom.window.document);
        const article = reader.parse();

        if (!article || !article.textContent) {
            return 'Could not extract article content from this webpage. The page may not be a readable article or may have restricted access.';
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
    } catch (error) {
        console.error('Error loading article:', error);
        return `Failed to load article: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
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

// AI SDK tool - proper format with inputSchema
export const websiteScraperTool = {
    description: "Answer questions about articles or web pages by analyzing their text content. Use this tool for news articles, blog posts, and regular web pages. DO NOT use this for YouTube URLs.",
    inputSchema: z.object({
        url: z.string().describe("The URL of the article/website to analyze (NOT YouTube URLs)."),
        question: z.string().describe("The user's question or request about the article"),
    }),
    execute: async ({ url, question }: { url: string; question: string; }, { metadata }: any) => {
        const personality = metadata?.personality as PersonalityKey | undefined;
        const userMessage = metadata?.userMessage as string;

        try {
            console.log(`🌐 Processing article: ${url}`);
            console.log(`❓ Question: ${question}`);

            // Load and process article
            const article = await loadArticleContent(url);

            // Check if we got an error response
            if (typeof article === 'string') {
                return article; // Return the error message
            }

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

            // Return structured output instead of plain text
            const structuredOutput = {
                type: 'website_scraper' as const,
                data: {
                    relevant: relevant.map((chunk: any) => ({
                        text: chunk.text,
                        score: chunk.score,
                        metadata: chunk.metadata
                    })),
                    url,
                    question
                },
                metadata: {
                    title: `Analysis of ${article.title}`,
                    description: `Found ${relevant.length} relevant sections from the article`
                },
                contextualMessage: answer
            };

            return JSON.stringify(structuredOutput);
        } catch (error) {
            console.error('❌ Error in websiteScraper:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return `I couldn't analyze the article. ${errorMessage}`;
        }
    }
};