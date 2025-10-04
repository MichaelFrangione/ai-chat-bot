'use client';

import { MovieRecommendationsOutput } from '@/types/structured';

interface MovieRecommendationsProps {
    output: MovieRecommendationsOutput;
}

export default function MovieRecommendations({ output }: MovieRecommendationsProps) {
    const { data } = output;
    const topPick = output.aiChosenMovie || data.recommendations[0];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
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

            {/* Top Pick Highlight */}
            {topPick && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-200">Top Pick</h4>
                    </div>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {topPick.title}
                            </h5>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {topPick.year}
                                {topPick.director && (
                                    <span className="ml-2">• Directed by {topPick.director}</span>
                                )}
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                                {topPick.description}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                            {topPick.rating && (
                                <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                                    <span className="text-yellow-600 text-sm">★</span>
                                    <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                                        {topPick.rating}/10
                                    </span>
                                </div>
                            )}
                            {topPick.metascore && (
                                <div className="flex items-center gap-1 bg-green-100 dark:bg-green-900/30 px-3 py-1 rounded-full">
                                    <span className="text-green-600 text-sm">M</span>
                                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                                        {topPick.metascore}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* All Recommendations */}
            <div className="space-y-4">
                {data.recommendations
                    .filter(movie => !output.aiChosenMovie || movie.title !== output.aiChosenMovie.title)
                    .map((movie, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h5 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                        {movie.title}
                                    </h5>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        <span>{movie.year}</span>
                                        {movie.director && (
                                            <>
                                                <span>•</span>
                                                <span>Directed by {movie.director}</span>
                                            </>
                                        )}
                                    </div>
                                    {movie.genre && (
                                        <div className="flex flex-wrap gap-1">
                                            {movie.genre.split(',').map((genre, genreIndex) => (
                                                <span
                                                    key={genreIndex}
                                                    className="inline-block px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                                                >
                                                    {genre.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {movie.rating && (
                                        <div className="flex items-center gap-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 py-1 rounded-full">
                                            <span className="text-yellow-500 text-sm">★</span>
                                            <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                                                {movie.rating}/10
                                            </span>
                                        </div>
                                    )}
                                    {movie.metascore && (
                                        <div className="flex items-center gap-1 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                                            <span className="text-green-500 text-sm">M</span>
                                            <span className="text-sm font-medium text-green-700 dark:text-green-300">
                                                {movie.metascore}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                                {movie.description}
                            </p>

                            {movie.tags && movie.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {movie.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
}
