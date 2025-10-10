'use client';

import { YoutubeTranscriberOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface YoutubeTranscriptProps {
    output: YoutubeTranscriberOutput;
}

export default function YoutubeTranscript({ output }: YoutubeTranscriptProps) {
    const { currentTheme } = useTheme();
    const { data } = output;

    // Helper to format timestamp as MM:SS
    const formatTimestamp = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    };

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

            {/* Transcript Chunks */}
            <div className="space-y-4">
                {data.relevant.map((chunk, index) => (
                    <div
                        key={index}
                        className="rounded-lg p-4 border hover:shadow-md transition-shadow"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.border
                        }}
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span
                                    className="text-xs font-mono px-2 py-1 rounded"
                                    style={{
                                        backgroundColor: currentTheme.colors.surface,
                                        color: currentTheme.colors.accent
                                    }}
                                >
                                    {formatTimestamp(chunk.metadata.timestamp)}
                                </span>
                                <span
                                    className="text-xs opacity-60"
                                    style={{ color: currentTheme.colors.text }}
                                >
                                    Relevance: {Math.round(chunk.score * 100)}%
                                </span>
                            </div>
                            <a
                                href={`${chunk.metadata.source}?t=${Math.floor(chunk.metadata.timestamp)}s`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs px-2 py-1 rounded transition-colors hover:underline"
                                style={{
                                    color: currentTheme.colors.accent,
                                }}
                            >
                                Watch at this time →
                            </a>
                        </div>
                        <p
                            className="text-sm leading-relaxed"
                            style={{ color: currentTheme.colors.text }}
                        >
                            {chunk.text}
                        </p>
                        {chunk.metadata.title && (
                            <p
                                className="text-xs mt-2 opacity-60 italic"
                                style={{ color: currentTheme.colors.text }}
                            >
                                From: {chunk.metadata.title}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

