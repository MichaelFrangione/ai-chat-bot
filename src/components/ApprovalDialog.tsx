'use client';

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
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                    Tool Approval Required
                </h3>

                <div className="mb-4">
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                        {request.message}
                    </p>

                    <div className="bg-gray-100 dark:bg-gray-700 rounded p-3 text-sm">
                        <div className="font-medium text-gray-900 dark:text-white">
                            Tool: {request.toolName}
                        </div>
                        {request.toolArgs && (
                            <div className="mt-2 text-gray-600 dark:text-gray-400">
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
