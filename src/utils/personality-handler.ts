import { getPersonalityDirectives, PersonalityKey } from '@/constants/personalities';

export class PersonalityHandler {
    /**
     * Extracts personality preference from request cookies
     */
    static getPersonalityFromRequest(req: Request): PersonalityKey {
        const cookieHeader = req.headers.get('cookie') || '';
        const personalityCookie = cookieHeader
            .split(';')
            .find(c => c.trim().startsWith('personality='))
            ?.split('=')[1]
            ?.trim();

        return (personalityCookie as PersonalityKey) || 'assistant';
    }

    /**
     * Builds system prompt with personality directives and optional conversation summary
     */
    static buildSystemPrompt(personality: PersonalityKey, summary?: string): string {
        let systemPrompt = getPersonalityDirectives(personality);

        if (summary && summary.length > 0) {
            systemPrompt = `Previous conversation summary: ${summary}\n\n${systemPrompt}`;
        }

        return systemPrompt;
    }
}
