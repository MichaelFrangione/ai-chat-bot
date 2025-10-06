import { openai } from '../ai';
import { getPersonalityDirectives, PersonalityKey } from '../constants/personalities';

/**
 * Style text output using the selected personality while preserving factual content
 */
export async function styleWithPersona(
    text: string,
    personality: PersonalityKey,
    context?: string
): Promise<string> {
    if (!text || personality === 'assistant') {
        return text; // No styling needed for assistant or empty text
    }

    try {
        const personaDirectives = getPersonalityDirectives(personality);
        const contextHint = context ? `\n\nContext: ${context}` : '';

        const response = await openai.chat.completions.create({
            model: 'gpt-5-nano',
            temperature: 1,
            messages: [
                {
                    role: 'system',
                    content: `${personaDirectives}

Rewrite the following text to match your personality and speaking style. Preserve all factual information, movie titles, ratings, years, and technical details exactly. Only change the tone, voice, and phrasing to match your character. Do not add extra information or change any facts.${contextHint}`
                },
                {
                    role: 'user',
                    content: text
                }
            ]
        });

        return response.choices[0]?.message?.content?.trim() || text;
    } catch (error) {
        console.error('Persona styling error:', error);
        return text; // Fallback to original text
    }
}
