'use client';

import { WebsiteScraperOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface WebsiteScraperProps {
    output: WebsiteScraperOutput;
}

export default function WebsiteScraper({ output }: WebsiteScraperProps) {
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

            {/* Source URL */}
            <div className="mb-4">
                <a
                    href={output.data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm transition-colors hover:underline"
                    style={{ color: currentTheme.colors.accent }}
                >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                    </svg>
                    {output.data.url}
                </a>
            </div>
        </div>
    );
}
