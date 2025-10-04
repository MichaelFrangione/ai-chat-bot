'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface ApprovalDialogProps {
    request: {
        toolName: string;
        toolArgs: any;
        message: string;
    };
    onApprove: (approved: boolean) => void;
    onClose: () => void;
}

export default function ApprovalDialog({ request, onApprove, onClose }: ApprovalDialogProps) {
    const { currentTheme } = useTheme();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div
                className="rounded-lg p-6 max-w-md w-full mx-4"
                style={{ backgroundColor: currentTheme.colors.surface }}
            >
                <h3
                    className="text-lg font-semibold mb-4"
                    style={{ color: currentTheme.colors.text }}
                >
                    Tool Approval Required
                </h3>

                <div className="mb-4">
                    <p
                        className="mb-2 opacity-80"
                        style={{ color: currentTheme.colors.text }}
                    >
                        {request.message}
                    </p>

                    <div
                        className="rounded p-3 text-sm"
                        style={{
                            backgroundColor: currentTheme.colors.background,
                            borderColor: currentTheme.colors.border,
                            borderWidth: '1px'
                        }}
                    >
                        <div
                            className="font-medium"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Tool: {request.toolName}
                        </div>
                        {request.toolArgs && (
                            <div
                                className="mt-2 opacity-70"
                                style={{ color: currentTheme.colors.text }}
                            >
                                <pre className="whitespace-pre-wrap text-xs">
                                    {JSON.stringify(request.toolArgs, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex gap-3 justify-end">
                    <button
                        onClick={() => onApprove(false)}
                        className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                    >
                        Deny
                    </button>
                    <button
                        onClick={() => onApprove(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                        Approve
                    </button>
                </div>
            </div>
        </div>
    );
}
