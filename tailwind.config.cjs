const { heroui } = require('@heroui/react')

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary Palette
        'obsidian': '#2D2218',
        'charcoal': '#2C241F',
        'bronze': '#E8C99A',
        'amber': '#8C6A43',
        'ivory': '#FAF4E8',
        // Accents
        'cinnabar': '#C0392B',
        'gold': '#C9A84C',
        'jade': '#4A7C6F',
        // Extended
        'smoke': '#4A4540',
        'ink': '#3A3530',
        'parchment': '#EDE4D3',
        'lacquer': '#1A1410',
      },
      fontFamily: {
        'display': ['Cinzel', 'serif'],
        'heading': ['Playfair Display', 'serif'],
        'body': ['Be Vietnam Pro', 'sans-serif'],
      },
      fontSize: {
        'hero': ['clamp(3rem, 8vw, 7rem)', { lineHeight: '1', letterSpacing: '0.05em' }],
        'display': ['clamp(2rem, 5vw, 4.5rem)', { lineHeight: '1.1', letterSpacing: '0.03em' }],
        'cinematic': ['clamp(1.5rem, 3.5vw, 3rem)', { lineHeight: '1.2', letterSpacing: '0.02em' }],
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      backgroundImage: {
        'bronze-glow': 'radial-gradient(ellipse at center, rgba(232,201,154,0.25) 0%, transparent 70%)',
        'temple-smoke': 'linear-gradient(180deg, #2D2218 0%, #2C241F 40%, #1A1410 100%)',
        'warm-dusk': 'linear-gradient(135deg, #2C241F 0%, #2D2218 50%, #1A1410 100%)',
        'lacquer-wood': 'linear-gradient(180deg, #2C241F, #1A1410)',
        'gold-shimmer': 'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)',
      },
      boxShadow: {
        'bronze': '0 0 30px rgba(232,201,154,0.3), 0 0 60px rgba(232,201,154,0.15)',
        'bronze-sm': '0 0 15px rgba(232,201,154,0.25)',
        'glow': '0 0 40px rgba(232,201,154,0.4)',
        'deep': '0 20px 60px rgba(0,0,0,0.5)',
        'glass': '0 4px 30px rgba(0,0,0,0.3)',
      },
      borderColor: {
        'bronze-faint': 'rgba(232,201,154,0.2)',
        'bronze-light': 'rgba(232,201,154,0.35)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'smoke-drift': 'smokeDrift 8s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        smokeDrift: {
          '0%': { transform: 'translateX(0) translateY(0)', opacity: '0.3' },
          '50%': { transform: 'translateX(20px) translateY(-15px)', opacity: '0.15' },
          '100%': { transform: 'translateX(0) translateY(0)', opacity: '0.3' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  darkMode: 'class',
  plugins: [
    heroui({
      themes: {
        dark: {
          colors: {
            background: '#2D2218',
            foreground: '#FAF4E8',
            primary: {
              DEFAULT: '#E8C99A',
              foreground: '#2D2218',
              50: '#FBF7F1',
              100: '#FAF4E8',
              200: '#EDE4D3',
              300: '#DFCFB8',
              400: '#D6B98C',
              500: '#C9A070',
              600: '#B8874E',
              700: '#8C6A43',
              800: '#6B4F33',
              900: '#4A3525',
            },
            secondary: {
              DEFAULT: '#8C6A43',
              foreground: '#F5EFE6',
            },
            danger: {
              DEFAULT: '#C0392B',
              foreground: '#F5EFE6',
            },
            success: {
              DEFAULT: '#4A7C6F',
              foreground: '#F5EFE6',
            },
          },
        },
      },
    }),
  ],
}