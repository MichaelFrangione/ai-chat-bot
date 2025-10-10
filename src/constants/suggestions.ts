export const SUGGESTIONS: string[] = [
    'Tell me a bit about yourself',
    'Recommend a sci‑fi movie',
    'Tell me a joke',
    'Generate an image',
    'Show trending Reddit posts',
    'Show me a cute post from reddit',
    'Find movies by director',
    'List top-rated comedies',
    'Create a cyberpunk city image',
    'What can you do?',
    'Suggest an underrated thriller',
    'Summarize a YouTube video for me',
];

export function pickRandomSuggestions(count = 4): string[] {
    const items = [...SUGGESTIONS];
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return items.slice(0, count);
}


