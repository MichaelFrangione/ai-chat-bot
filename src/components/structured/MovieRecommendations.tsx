'use client';

import { MovieRecommendationsOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface MovieRecommendationsProps {
    output: MovieRecommendationsOutput;
}

export default function MovieRecommendations({ output }: MovieRecommendationsProps) {
    const { currentTheme } = useTheme();
    const { data } = output;
    const topPick = output.aiChosenMovie || data.recommendations[0];

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

            {/* Top Pick Highlight */}
            {topPick && (
                <div
                    className="mb-6 p-4 rounded-lg border"
                    style={{
                        background: `linear-gradient(to right, ${currentTheme.colors.gradient.from}20, ${currentTheme.colors.gradient.to}20)`,
                        borderColor: currentTheme.colors.border
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: currentTheme.colors.accent }}
                        ></div>
                        <h4
                            className="text-sm font-semibold"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Top Pick
                        </h4>
                    </div>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h5
                                className="text-lg font-bold mb-1"
                                style={{ color: currentTheme.colors.text }}
                            >
                                {topPick.title}
                            </h5>
                            <p
                                className="text-sm mb-2 opacity-80"
                                style={{ color: currentTheme.colors.text }}
                            >
                                {topPick.year}
                                {topPick.director && (
                                    <span className="ml-2">• Directed by {topPick.director}</span>
                                )}
                            </p>
                            <p
                                className="text-sm leading-relaxed opacity-90"
                                style={{ color: currentTheme.colors.text }}
                            >
                                {topPick.description}
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                            {topPick.rating && (
                                <div
                                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.accent}20`,
                                        color: currentTheme.colors.text
                                    }}
                                >
                                    <span className="text-sm">★</span>
                                    <span className="text-sm font-medium">
                                        {topPick.rating}/10
                                    </span>
                                </div>
                            )}
                            {topPick.metascore && (
                                <div
                                    className="flex items-center gap-1 px-3 py-1 rounded-full"
                                    style={{
                                        backgroundColor: `${currentTheme.colors.secondary}20`,
                                        color: currentTheme.colors.text
                                    }}
                                >
                                    <span className="text-sm">M</span>
                                    <span className="text-sm font-medium">
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
                        <div
                            key={index}
                            className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                            style={{
                                backgroundColor: currentTheme.colors.background,
                                borderColor: currentTheme.colors.border
                            }}
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h5
                                        className="text-lg font-bold mb-1"
                                        style={{ color: currentTheme.colors.text }}
                                    >
                                        {movie.title}
                                    </h5>
                                    <div
                                        className="flex items-center gap-2 text-sm mb-2 opacity-80"
                                        style={{ color: currentTheme.colors.text }}
                                    >
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
                                                    className="inline-block px-2 py-1 text-xs rounded-full"
                                                    style={{
                                                        backgroundColor: `${currentTheme.colors.primary}40`,
                                                        color: currentTheme.colors.text
                                                    }}
                                                >
                                                    {genre.trim()}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {movie.rating && (
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `${currentTheme.colors.accent}20`,
                                                color: currentTheme.colors.text
                                            }}
                                        >
                                            <span className="text-sm">★</span>
                                            <span className="text-sm font-medium">
                                                {movie.rating}/10
                                            </span>
                                        </div>
                                    )}
                                    {movie.metascore && (
                                        <div
                                            className="flex items-center gap-1 px-2 py-1 rounded-full"
                                            style={{
                                                backgroundColor: `${currentTheme.colors.secondary}20`,
                                                color: currentTheme.colors.text
                                            }}
                                        >
                                            <span className="text-sm">M</span>
                                            <span className="text-sm font-medium">
                                                {movie.metascore}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <p
                                className="text-sm leading-relaxed mb-3 opacity-90"
                                style={{ color: currentTheme.colors.text }}
                            >
                                {movie.description}
                            </p>

                            {movie.tags && movie.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                    {movie.tags.map((tag, tagIndex) => (
                                        <span
                                            key={tagIndex}
                                            className="px-2 py-1 text-xs rounded-full"
                                            style={{
                                                backgroundColor: currentTheme.colors.surface,
                                                color: currentTheme.colors.text,
                                                borderColor: currentTheme.colors.border
                                            }}
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
