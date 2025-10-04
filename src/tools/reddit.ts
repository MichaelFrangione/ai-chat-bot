import type { ToolFn } from "../../types";
import fetch from "node-fetch";
import { z } from "zod";

export const redditToolDefinition = {
    name: "reddit",
    parameters: z.object({}),
    description: "Search for posts on Reddit",
};

type Args = z.infer<typeof redditToolDefinition.parameters>;

export const reddit: ToolFn<Args, string> = async ({ toolArgs }: { toolArgs: Args; userMessage: string; }) => {
    const { data } = await fetch("https://www.reddit.com/r/all.json")
        .then(res => res.json()) as any;

    const posts = data.children.map((child: any) => ({
        title: child.data.title,
        link: child.data.url,
        subreddit: child.data.subreddit,
        author: child.data.author,
        upvotes: child.data.ups,
        redditUrl: `https://reddit.com${child.data.permalink}`,
    }));

    const structuredOutput = {
        type: 'reddit_posts' as const,
        data: {
            posts,
            sortBy: 'hot'
        },
        metadata: {
            title: "Top Reddit Posts",
            description: "Current trending posts from across Reddit"
        },
        contextualMessage: `Found ${posts.length} trending Reddit posts`
    };

    return JSON.stringify(structuredOutput);
};