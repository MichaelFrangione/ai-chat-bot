import ChatInterface from '@/components/ChatInterface';

export default function Home() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
                        AI Chatbot Agent
                    </h1>
                    <ChatInterface />
                </div>
            </div>
        </div>
    );
}
