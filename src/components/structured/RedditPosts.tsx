'use client';

import { RedditPostsOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface RedditPostsProps {
    output: RedditPostsOutput;
}

export default function RedditPosts({ output }: RedditPostsProps) {
    const { currentTheme } = useTheme();
    const { data } = output;

    return (
        <div
            className="rounded-xl p-6 shadow-lg border"
            style={{
                backgroundColor: currentTheme.colors.surface,
                borderColor: currentTheme.colors.border
            }}
        >
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: currentTheme.colors.accent }}
                    ></div>
                    <h3
                        className="text-lg font-semibold"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {output.metadata.title}
                    </h3>
                </div>
                {output.contextualMessage ? (
                    <p
                        className="text-sm leading-relaxed opacity-80"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {output.contextualMessage}
                    </p>
                ) : (
                    <p
                        className="text-sm opacity-80"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {output.metadata.description}
                    </p>
                )}
            </div>

            {/* All Posts */}
            <div className="space-y-4">
                {data.posts.map((post, index) => (
                    <div
                        key={index}
                        className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.border
                        }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {/* Row 1: Thumbnail + Metadata + Upvotes */}
                            <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
                                {/* Thumbnail */}
                                {post.thumbnail && (
                                    <div style={{ flexShrink: 0 }}>
                                        <a href={post.link} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                                            <img
                                                src={post.thumbnail}
                                                alt={post.title}
                                                className="w-16 h-16 object-cover rounded-lg border"
                                                style={{ borderColor: currentTheme.colors.border }}
                                                onError={(e) => {
                                                    console.log('Thumbnail failed to load:', post.thumbnail);
                                                    // Hide thumbnail if it fails to load
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                                onLoad={() => {
                                                    console.log('Thumbnail loaded successfully:', post.thumbnail);
                                                }}
                                            />
                                        </a>
                                    </div>
                                )}

                                {/* Metadata + Upvotes */}
                                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flex: 1 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                        <h5
                                            className="text-lg font-bold mb-1 break-words"
                                            style={{ color: currentTheme.colors.text }}
                                        >
                                            <a
                                                href={post.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="transition-colors hover:underline"
                                                style={{ color: currentTheme.colors.text }}
                                            >
                                                {post.title}
                                            </a>
                                        </h5>
                                        <div
                                            className="flex flex-wrap items-center gap-2 text-sm mb-2 opacity-80"
                                            style={{ color: currentTheme.colors.text }}
                                        >
                                            <a
                                                href={`https://reddit.com/r/${post.subreddit}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium transition-colors hover:underline"
                                                style={{ color: currentTheme.colors.text }}
                                            >
                                                r/{post.subreddit}
                                            </a>
                                            <span>•</span>
                                            <span>u/{post.author}</span>
                                            {post.domain && (
                                                <>
                                                    <span>•</span>
                                                    <span
                                                        className="text-xs px-1.5 py-0.5 rounded whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: currentTheme.colors.surface,
                                                            color: currentTheme.colors.text
                                                        }}
                                                    >
                                                        {post.domain}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upvotes */}
                                    <div
                                        className="flex items-center gap-1 px-2 py-1 rounded-full flex-shrink-0 ml-4"
                                        style={{ backgroundColor: currentTheme.colors.surface }}
                                    >
                                        <span
                                            className="text-sm"
                                            style={{ color: currentTheme.colors.text }}
                                        >
                                            ↑
                                        </span>
                                        <span
                                            className="text-sm font-medium"
                                            style={{ color: currentTheme.colors.text }}
                                        >
                                            {post.upvotes.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div
                                className="border-t"
                                style={{ borderColor: currentTheme.colors.border }}
                            ></div>

                            {/* Row 2: Comment Count */}
                            {post.redditUrl && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <a
                                        href={post.redditUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm transition-colors hover:underline"
                                        style={{ color: currentTheme.colors.text }}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                        </svg>
                                        {post.comments.toLocaleString()} comment{post.comments !== 1 ? 's' : ''}
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}