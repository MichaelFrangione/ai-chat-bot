'use client';

import { RedditPostsOutput } from '@/types/structured';

interface RedditPostsProps {
    output: RedditPostsOutput;
}

export default function RedditPosts({ output }: RedditPostsProps) {
    const { data } = output;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {output.metadata.title}
                    </h3>
                </div>
                {output.contextualMessage ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {output.contextualMessage}
                    </p>
                ) : (
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {output.metadata.description}
                    </p>
                )}
            </div>

            {/* All Posts */}
            <div className="space-y-4">
                {data.posts.map((post, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
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
                                                className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
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
                                        <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1 break-words">
                                            <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                                {post.title}
                                            </a>
                                        </h5>
                                        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                            <a
                                                href={`https://reddit.com/r/${post.subreddit}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                            >
                                                r/{post.subreddit}
                                            </a>
                                            <span>•</span>
                                            <span>u/{post.author}</span>
                                            {post.domain && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-xs bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap">
                                                        {post.domain}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upvotes */}
                                    <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full flex-shrink-0 ml-4">
                                        <span className="text-blue-600 dark:text-blue-400 text-sm">↑</span>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {post.upvotes.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-gray-200 dark:border-gray-600"></div>

                            {/* Row 2: Comment Count */}
                            {post.redditUrl && (
                                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                                    <a
                                        href={post.redditUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
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