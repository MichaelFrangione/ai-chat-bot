'use client';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Thinking...</span>
        </div>
    );
}
