/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Theme-aware colors that will be dynamically set via CSS variables
                'theme-bg': 'var(--theme-bg)',
                'theme-surface': 'var(--theme-surface)',
                'theme-text': 'var(--theme-text)',
                'theme-border': 'var(--theme-border)',
                'theme-primary': 'var(--theme-primary)',
                'theme-secondary': 'var(--theme-secondary)',
                'theme-accent': 'var(--theme-accent)',
                'theme-gradient-from': 'var(--theme-gradient-from)',
                'theme-gradient-to': 'var(--theme-gradient-to)',
            },
        },
    },
    plugins: [],
};
