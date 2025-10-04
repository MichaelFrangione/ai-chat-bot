import type { ToolFn } from "../../types";
import fetch from "node-fetch";
import { z } from "zod";

export const redditToolDefinition = {
    name: "reddit",
    parameters: z.object({
        limit: z.number().nullable().describe("Number of posts to return (default: 10, max: 25). Use null for default."),
        subreddit: z.string().nullable().describe("Specific subreddit to search (e.g., 'funny', 'news'). Use null for r/all.")
    }),
    description: "Search for posts on Reddit. Can filter by subreddit or limit results.",
};

type Args = z.infer<typeof redditToolDefinition.parameters>;

export const reddit: ToolFn<Args, string> = async ({ toolArgs }: { toolArgs: Args; userMessage: string; }) => {
    const { limit, subreddit } = toolArgs;

    // Handle nullable values
    const actualLimit = limit ?? 10;
    const actualSubreddit = subreddit ?? null;

    // Build the URL based on parameters
    const subredditPath = actualSubreddit ? `r/${actualSubreddit}` : 'r/all';
    const { data } = await fetch(`https://www.reddit.com/${subredditPath}.json`)
        .then(res => res.json()) as any;

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
        contextualMessage: `Found ${posts.length} ${actualSubreddit ? `posts from r/${actualSubreddit}` : 'trending Reddit posts'}`
    };

    return JSON.stringify(structuredOutput);
};