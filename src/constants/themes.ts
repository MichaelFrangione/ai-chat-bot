export interface Theme {
    id: string;
    name: string;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        surface: string;
        text: string;
        border: string;
        headerText: string;
        gradient: {
            from: string;
            to: string;
        };
        componentColor: string;
        scrollbar: {
            thumb: string;
            track: string;
        };
    };
    fontFamily?: string;
    fontSize?: string;
    description: string;
}

export const themes: Record<string, Theme> = {
    default: {
        id: 'default',
        name: 'Default',
        description: 'Clean blue and purple theme',
        colors: {
            primary: '#2563eb',
            secondary: '#9333ea',
            accent: '#6366f1',
            background: '#111827',
            surface: '#1f2937', // gray-800 hex (dark surface)
            text: 'white',
            border: '#4b5563', // gray-600 hex
            headerText: 'white',
            gradient: {
                from: '#3b82f6', // blue-500 hex
                to: '#9333ea', // purple-600 hex
            },
            componentColor: '#3b82f6', // blue-500 hex
            scrollbar: {
                thumb: '#6b7280', // gray-500
                track: 'transparent'
            },
        },
        fontFamily: 'Inter, sans-serif',
    },
    eightBit: {
        id: 'eightBit',
        name: 'Eight Bit',
        description: 'Classic 8-bit neon retro theme',
        colors: {
            primary: '#ff00ff',
            secondary: '#00ff00',
            accent: '#0000ff',
            background: '#000000',
            surface: '#1a1a1a',
            text: '#00ff00',
            border: '#ff00ff',
            headerText: '#00ff00',
            gradient: {
                from: '#000000',
                to: 'transparent',
            },
            componentColor: 'transparent',
            scrollbar: {
                thumb: '#ff00ff',
                track: 'transparent'
            },
        },
        fontFamily: 'var(--font-vt323)',
        fontSize: '18px',
    },
    autumn: {
        id: 'autumn',
        name: 'Autumn',
        description: 'Warm autumn pastels with cozy vibes',
        colors: {
            primary: '#f97316',
            secondary: '#a0522d',
            accent: '#f59e0b',
            background: '#faf5f0',
            surface: '#f0e6d2',
            text: '#8b4513',
            border: '#d2b48c',
            headerText: '#8b4513',
            gradient: {
                from: '#deb887',
                to: '#f4a460'
            },
            componentColor: '#f0e6d2',
            scrollbar: {
                thumb: '#cd853f',
                track: 'transparent'
            },
        },
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
    },
    forest: {
        id: 'forest',
        name: 'Forest',
        description: 'Deep forest greens with earthy tones',
        colors: {
            primary: '#22c55e',
            secondary: '#10b981',
            accent: '#14b8a6',
            background: '#0f1419',
            surface: '#1a2332',
            text: '#a7c7a7',
            border: '#2d4a3e',
            headerText: '#a7c7a7',
            gradient: {
                from: '#2d5a27',
                to: '#1e3a1e'
            },
            componentColor: '#1a2332',
            scrollbar: {
                thumb: '#2d5a27',
                track: 'transparent'
            },
        },
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
    },
    monochrome: {
        id: 'monochrome',
        name: 'Monochrome',
        description: 'Clean black, white, and gray tones',
        colors: {
            primary: '#6b7280',
            secondary: '#475569',
            accent: '#71717a',
            background: '#000000',
            surface: '#1a1a1a',
            text: '#ffffff',
            border: '#404040',
            headerText: '#000000',
            gradient: {
                from: '#ffffff',
                to: '#a3a3a3'
            },
            componentColor: '#1a1a1a',
            scrollbar: {
                thumb: '#404040',
                track: 'transparent'
            },
        },
        fontFamily: 'Inter, sans-serif',
        fontSize: '16px',
    },
    murderbot: {
        id: 'SecUnit',
        name: 'SecUnit',
        description: 'Industrial steel with safety orange accents',
        colors: {
            primary: '#ff6a00',
            secondary: '#1f9d8f',
            accent: '#14b8a6',
            background: '#d9dbd7',
            surface: '#e7e9e6',
            text: '#111417',
            border: '#b9bdb9',
            headerText: '#111417',
            gradient: {
                from: '#eceeec',
                to: '#d3d7d6',
            },
            // Use orange for prominent components (send button, user bubble)
            componentColor: '#ff6a00',
            scrollbar: {
                thumb: '#a6aaaf',
                track: 'transparent',
            },
        },
        fontFamily: 'var(--font-michroma), Inter, sans-serif',
        fontSize: '16px',
    },
};

export const defaultTheme = themes.default;
