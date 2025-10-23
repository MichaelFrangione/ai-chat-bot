'use client';

import { YoutubeTranscriberOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface YoutubeTranscriptProps {
    output: YoutubeTranscriberOutput;
}

export default function YoutubeTranscript({ output }: YoutubeTranscriptProps) {
    const { currentTheme } = useTheme();

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

            {/* Video Link */}
            {output.data.relevant.length > 0 && (
                <div className="mb-4">
                    <a
                        href={output.data.relevant[0].metadata.source}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm transition-colors hover:underline"
                        style={{ color: currentTheme.colors.accent }}
                    >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                        </svg>
                        Watch on YouTube
                    </a>
                </div>
            )}
        </div>
    );
}

