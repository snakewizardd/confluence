/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Colors from nature - earth, water, sky, growth
      colors: {
        earth: {
          50: '#faf8f3',
          100: '#f5f1e7',
          200: '#e8dfc7',
          300: '#dbc9a0',
          400: '#c8a968',
          500: '#b8934a',
          600: '#a07e3e',
          700: '#856535',
          800: '#6f5430',
          900: '#5e462a',
        },
        water: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#b9e6fe',
          300: '#7cd4fd',
          400: '#36bffa',
          500: '#0ba5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        growth: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
      },
      fontFamily: {
        // Typography as philosophy - clear, intentional, beautiful
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'Consolas', 'monospace'],
        serif: ['var(--font-crimson-pro)', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
