import { openai } from '@ai-sdk/openai';
import { streamText, convertToModelMessages, UIMessage } from 'ai';
import { dadJokeTool } from '@/tools/dadJoke';
import { getPersonalityDirectives, PersonalityKey } from '@/constants/personalities';

export const maxDuration = 30;

export async function POST(req: Request) {
    const body = await req.json();
    const { messages } = body as { messages: UIMessage[]; };

    // Read personality from cookie (simple, reliable, server-side) 
    // workaround: https://github.com/vercel/ai/issues/7109#issuecomment-3168842681
    const cookieHeader = req.headers.get('cookie') || '';
    const personalityCookie = cookieHeader
        .split(';')
        .find(c => c.trim().startsWith('personality='))
        ?.split('=')[1]
        ?.trim();

    const personality = (personalityCookie as PersonalityKey) || 'assistant';

    console.log('=== CHAT REQUEST ===');
    console.log('Cookie header:', cookieHeader);
    console.log('Personality from cookie:', personality);
    console.log('Messages count:', messages.length);

    const systemPrompt = getPersonalityDirectives(personality);
    console.log('System prompt (first 200 chars):', systemPrompt.substring(0, 200));

    const result = streamText({
        model: openai('gpt-5-nano'),
        messages: convertToModelMessages(messages),
        system: systemPrompt,
        tools: {
            dad_joke: dadJokeTool,
        },
    });

    return result.toUIMessageStreamResponse();
}
