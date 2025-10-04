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
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                                <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                    <a href={post.link} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600 transition-colors">
                                        {post.title}
                                    </a>
                                </h5>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    <span className="font-medium">r/{post.subreddit}</span>
                                    <span>•</span>
                                    <span>u/{post.author}</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full ml-4">
                                <span className="text-blue-600 dark:text-blue-400 text-sm">↑</span>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {post.upvotes.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {post.redditUrl && (
                            <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                                <a
                                    href={post.redditUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                                    </svg>
                                    View Discussion
                                </a>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}