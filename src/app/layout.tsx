import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { VT323 } from 'next/font/google';
import { Michroma } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { PersonalityProvider } from '@/contexts/PersonalityContext';
import ThemeWrapper from '@/components/ThemeWrapper';
import { Analytics } from "@vercel/analytics/next";


const inter = Inter({ subsets: ['latin'] });
const vt323 = VT323({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-vt323'
});
const michroma = Michroma({
    subsets: ['latin'],
    weight: '400',
    variable: '--font-michroma'
});

export const metadata: Metadata = {
    title: 'AI Chatbot Agent',
    description: 'Interactive AI agent with tools',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={`${inter.className} ${vt323.variable} ${michroma.variable}`}>
                <ThemeProvider>
                    <PersonalityProvider>
                        <ThemeWrapper>
                            {children}
                            <Analytics />
                        </ThemeWrapper>
                    </PersonalityProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
