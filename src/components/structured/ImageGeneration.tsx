'use client';

import { ImageGenerationOutput } from '@/types/structured';
import { useTheme } from '@/contexts/ThemeContext';

interface ImageGenerationProps {
    output: ImageGenerationOutput;
}

export default function ImageGeneration({ output }: ImageGenerationProps) {
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
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
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

            {/* Generated Image */}
            <div className="space-y-4">
                <div className="relative">
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer"
                    >
                        <img
                            src={data.url}
                            alt={data.alt || 'Generated image'}
                            className="w-full h-auto rounded-lg shadow-md"
                            onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                const errorDiv = target.nextElementSibling as HTMLElement;
                                if (errorDiv) errorDiv.style.display = 'block';
                            }}
                        />
                    </a>
                    <div
                        className="hidden w-full h-64 rounded-lg items-center justify-center"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            color: currentTheme.colors.text,
                            opacity: 0.7
                        }}
                    >
                        <div className="text-center flex flex-col items-center justify-center h-full" >
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Failed to load image</p>
                        </div>
                    </div>
                </div>

                {/* Image Details */}
                <div
                    className="rounded-lg p-4"
                    style={{ backgroundColor: currentTheme.colors.background }}
                >
                    <h4
                        className="text-sm font-semibold mb-2"
                        style={{ color: currentTheme.colors.text }}
                    >
                        Prompt
                    </h4>
                    <p
                        className="text-sm italic opacity-80"
                        style={{ color: currentTheme.colors.text }}
                    >
                        "{data.prompt}"
                    </p>
                </div>

            </div>
        </div>
    );
}
