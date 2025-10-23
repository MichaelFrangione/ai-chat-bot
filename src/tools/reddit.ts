import fetch from "node-fetch";
import { z } from "zod";
import { styleWithPersona } from "../lib/persona-styler";
import { PersonalityKey } from "../constants/personalities";


// AI SDK tool - proper format with inputSchema
export const redditTool = {
    description: "Fetch actual posts from Reddit. Use this tool whenever the user asks for Reddit posts, content, or links - even for single posts. Always use this tool for Reddit-related requests.",
    inputSchema: z.object({
        limit: z.number().nullable().describe("Number of posts to return. Use 1 for single post requests, higher numbers for multiple posts (max: 25). Use null for default (5)."),
        subreddit: z.string().nullable().describe("Specific subreddit to search (e.g., 'funny', 'news'). Use null for r/all.")
    }),
    execute: async ({ limit, subreddit }: { limit: number | null; subreddit: string | null; }, context: any) => {
        console.log('reddit context:', context);
        // TODO: Personality not available in AI SDK tools context
        const personality = undefined; // Temporarily disabled until we find a way to pass personality to tools

        // Handle nullable values
        const actualLimit = limit ?? 5;
        const actualSubreddit = subreddit ?? null;

        // Check for Reddit API credentials
        if (!process.env.REDDIT_CLIENT_ID || !process.env.REDDIT_CLIENT_SECRET) {
            console.error('Reddit API credentials not configured');
            return JSON.stringify({
                type: 'reddit_posts' as const,
                data: {
                    posts: [],
                    sortBy: 'hot',
                    subreddit: actualSubreddit || undefined,
                    error: true
                },
                metadata: {
                    title: 'Reddit Posts',
                    description: 'Reddit API not configured'
                },
                contextualMessage: 'Sorry, Reddit integration is not configured. Please set up Reddit API credentials.'
            });
        }

        // Build the URL based on parameters
        const subredditPath = actualSubreddit ? `r/${actualSubreddit}` : 'r/all';

        try {
            console.log('=== REDDIT API CALL START ===');
            console.log('Using official Reddit API');
            console.log('Subreddit:', subredditPath);
            console.log('Limit:', actualLimit);
            console.log('Full URL:', `https://oauth.reddit.com/r/${actualSubreddit || 'all'}/hot?limit=${actualLimit}`);

            // First, get an access token
            const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${Buffer.from(`${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`).toString('base64')}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Chatbot-Agent/1.0 by YourUsername'
                },
                body: 'grant_type=client_credentials'
            });
            if (!tokenResponse.ok) {
                throw new Error(`Failed to get Reddit access token: ${tokenResponse.status}`);
            }

            const tokenData = await tokenResponse.json() as any;
            const accessToken = tokenData.access_token;

            console.log('Reddit access token obtained');

            // Now fetch posts using the official API
            const response = await fetch(`https://oauth.reddit.com/r/${actualSubreddit || 'all'}/hot?limit=${actualLimit}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'User-Agent': 'Chatbot-Agent/1.0 by YourUsername'
                }
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                console.error('Reddit API returned error status:', response.status, response.statusText);
                // Let's see what error we're getting
                const errorText = await response.text();
                console.error('Reddit API error response:', errorText.substring(0, 500));
                throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
            }

            const contentType = response.headers.get('content-type');
            console.log('Content-Type:', contentType);

            if (!contentType || !contentType.includes('application/json')) {
                console.error('Reddit API returned non-JSON content type:', contentType);
                const text = await response.text();
                console.error('Non-JSON response body (first 200 chars):', text.substring(0, 200));
                throw new Error('Reddit API returned non-JSON response');
            }

            console.log('Attempting to parse JSON response...');
            const responseData = await response.json() as any;
            console.log('JSON parsing successful');

            if (!responseData || !responseData.data) {
                throw new Error('Invalid Reddit API response format');
            }

            const { data } = responseData;

            let posts = data.children.map((child: any) => ({
                title: child.data.title,
                link: child.data.url,
                subreddit: child.data.subreddit,
                author: child.data.author,
                upvotes: child.data.ups,
                comments: child.data.num_comments || 0,
                redditUrl: `https://reddit.com${child.data.permalink}`,
                thumbnail: child.data.thumbnail && child.data.thumbnail !== 'self' && child.data.thumbnail !== 'default' ?
                    child.data.thumbnail.replace(/&amp;/g, '&') : null,
                isVideo: child.data.is_video || false,
                domain: child.data.domain,
            }));

            console.log(`Reddit API returned ${posts.length} posts (requested ${actualLimit})`);

            const title = actualSubreddit ? `Top Posts from r/${actualSubreddit}` : "Top Reddit Posts";
            const description = actualSubreddit
                ? `Current trending posts from r/${actualSubreddit}`
                : "Current trending posts from across Reddit";

            let contextualMessage = `Found ${posts.length} ${actualSubreddit ? `posts from r/${actualSubreddit}` : 'trending Reddit posts'}`;

            if (personality && personality !== 'assistant') {
                contextualMessage = await styleWithPersona(contextualMessage, personality, 'reddit posts');
            }

            const structuredOutput = {
                type: 'reddit_posts' as const,
                data: {
                    posts,
                    sortBy: 'hot',
                    subreddit: actualSubreddit || undefined
                },
                metadata: {
                    title,
                    description
                },
                contextualMessage
            };

            console.log('=== REDDIT API CALL SUCCESS ===');
            return JSON.stringify(structuredOutput);
        } catch (error) {
            console.error('=== REDDIT API CALL FAILED ===');
            console.error('Reddit API error:', error);

            // Return a structured error response
            const errorOutput = {
                type: 'reddit_posts' as const,
                data: {
                    posts: [],
                    sortBy: 'hot',
                    subreddit: actualSubreddit || undefined,
                    error: true
                },
                metadata: {
                    title: 'Reddit Posts',
                    description: 'Unable to fetch Reddit posts at this time'
                },
                contextualMessage: `Sorry, I couldn't fetch Reddit posts right now. ${error instanceof Error ? error.message : 'Unknown error occurred'}.`
            };

            return JSON.stringify(errorOutput);
        }
    }
};