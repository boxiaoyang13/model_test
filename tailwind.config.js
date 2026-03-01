/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0b0f',
        surface: '#111318',
        'surface2': '#181c24',
        border: '#1e2433',
        'border2': '#2a3147',
        'accent-gemini': '#8b5cf6',
        'accent-anthropic': '#e8673c',
        'accent-openai': '#10a37f',
        'accent-active': '#60a5fa',
        text: '#e2e8f0',
        'text-muted': '#64748b',
        'text-dim': '#94a3b8',
        success: '#22c55e',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        syne: ['"Syne"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
