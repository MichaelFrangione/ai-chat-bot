'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ImageGenerationApprovalProps {
    prompt: string;
    onApprove: () => void;
    onDeny: () => void;
}

export default function ImageGenerationApproval({ prompt, onApprove, onDeny }: ImageGenerationApprovalProps) {
    const { currentTheme } = useTheme();

    return (
        <div
            className="my-2 p-4 border rounded-lg shadow-sm"
            style={{
                backgroundColor: currentTheme.colors.background,
                borderColor: currentTheme.colors.border
            }}
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: currentTheme.colors.componentColor }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: 'white' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                </div>

                <div className="flex-1">
                    <div className="text-sm font-medium mb-1" style={{ color: currentTheme.colors.text }}>
                        Image Generation Request
                    </div>
                    <div className="text-xs opacity-75 mb-3 italic" style={{ color: currentTheme.colors.text }}>
                        "{prompt}"
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={onApprove}
                            className="px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: '#10b981',
                                color: 'white'
                            }}
                        >
                            ✓ Generate
                        </button>
                        <button
                            onClick={onDeny}
                            className="px-4 py-2 rounded text-sm font-medium transition-opacity hover:opacity-90"
                            style={{
                                backgroundColor: '#ef4444',
                                color: 'white'
                            }}
                        >
                            ✗ Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}