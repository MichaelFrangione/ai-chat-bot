import type { ToolFn } from "../../types";
import fetch from "node-fetch";
import { z } from "zod";
import { styleWithPersona } from "../lib/persona-styler";
import { PersonalityKey } from "../constants/personalities";

export const redditToolDefinition = {
    name: "reddit",
    parameters: z.object({
        limit: z.number().nullable().describe("Number of posts to return (default: 10, max: 25). Use null for default."),
        subreddit: z.string().nullable().describe("Specific subreddit to search (e.g., 'funny', 'news'). Use null for r/all.")
    }),
    description: "Search for posts on Reddit. Can filter by subreddit or limit results.",
};

type Args = z.infer<typeof redditToolDefinition.parameters>;

export const reddit: ToolFn<Args, string> = async ({ toolArgs, personality }: { toolArgs: Args; userMessage: string; personality?: PersonalityKey; }) => {
    const { limit, subreddit } = toolArgs;

    // Handle nullable values
    const actualLimit = limit ?? 10;
    const actualSubreddit = subreddit ?? null;

    // Build the URL based on parameters
    const subredditPath = actualSubreddit ? `r/${actualSubreddit}` : 'r/all';

    try {
        const response = await fetch(`https://www.reddit.com/${subredditPath}.json`, {
            headers: {
                'User-Agent': 'Chatbot-Agent/1.0 (Educational Project)',
            }
        });

        if (!response.ok) {
            throw new Error(`Reddit API returned ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            throw new Error('Reddit API returned non-JSON response');
        }

        const responseData = await response.json() as any;

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

        // Apply limit
        posts = posts.slice(0, Math.min(actualLimit, 25));

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

        return JSON.stringify(structuredOutput);
    } catch (error) {
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
};