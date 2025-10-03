'use client';

import { ImageGenerationOutput } from '@/types/structured';

interface ImageGenerationProps {
    output: ImageGenerationOutput;
}

export default function ImageGeneration({ output }: ImageGenerationProps) {
    const { data } = output;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
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

            {/* Generated Image */}
            <div className="space-y-4">
                <div className="relative group">
                    <img
                        src={data.url}
                        alt={data.alt || 'Generated image'}
                        className="w-full h-auto rounded-lg shadow-md transition-transform group-hover:scale-105"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const errorDiv = target.nextElementSibling as HTMLElement;
                            if (errorDiv) errorDiv.style.display = 'block';
                        }}
                    />
                    <div
                        className="hidden w-full h-64 bg-gray-100 dark:bg-gray-700 rounded-lg items-center justify-center text-gray-500 dark:text-gray-400"
                    >
                        <div className="text-center">
                            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Failed to load image</p>
                        </div>
                    </div>
                </div>

                {/* Image Details */}
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Prompt</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        "{data.prompt}"
                    </p>
                </div>

                {/* Download Link */}
                <div className="flex justify-center">
                    <a
                        href={data.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Full Size
                    </a>
                </div>
            </div>
        </div>
    );
}
