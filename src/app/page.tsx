'use client';

import ChatLoader from '@/components/ChatLoader';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import { useTheme } from '@/contexts/ThemeContext';

export default function Home() {
    const { currentTheme } = useTheme();

    return (
        <div
            className="min-h-screen flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
        >
            <div className="container mx-auto px-4 py-8 flex-1">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <h1
                            className="text-3xl font-bold"
                            style={{ color: currentTheme.colors.text }}
                        >
                            EchoBot (AI SDK)
                        </h1>
                        <div className="flex items-center gap-3">
                            <span
                                className="text-sm font-medium"
                                style={{ color: currentTheme.colors.text }}
                            >
                                Theme:
                            </span>
                            <ThemeSwitcher />
                        </div>
                    </div>
                    <ChatLoader />
                </div>
            </div>

            {/* Footer */}
            <footer
                className="py-6 border-t mt-auto"
                style={{
                    borderTopColor: currentTheme.colors.border,
                    backgroundColor: currentTheme.colors.surface
                }}
            >
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center">
                        <p
                            className="text-sm opacity-70"
                            style={{ color: currentTheme.colors.text }}
                        >
                            Built with Next.js, OpenAI, Upstash
                        </p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
