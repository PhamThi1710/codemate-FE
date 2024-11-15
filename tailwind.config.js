const config = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{vue,ts}',
    './components/**/*.{vue,ts}',
    './app/**/*.{vue,ts}',
    './src/**/*.{vue,ts}',
  ],
  theme: {
    fontFamily: {
      sans: ["Public Sans", 'sans-serif'],
      mono: ['Public Sans Mono', 'monospace']
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)'
    },
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' }
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' }
      }
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out'
    },
    extend: {
      colors: {
        primary: 'hsl(var(--primary) / <alpha-value>)',
        'primary-variant': 'hsl(var(--primary-variant) / <alpha-value>)',
        secondary: 'hsl(var(--secondary) / <alpha-value>)',
        'secondary-variant': 'hsl(var(--secondary-variant) / <alpha-value>)',
        background: 'hsl(var(--background) / <alpha-value>)',
        surface: 'hsl(var(--surface) / <alpha-value>)',
        error: 'hsl(var(--error) / <alpha-value>)',
        'on-primary': 'hsl(var(--on-primary) / <alpha-value>)',
        'on-secondary': 'hsl(var(--on-secondary) / <alpha-value>)',
        'on-background': 'hsl(var(--on-background) / <alpha-value>)',
        'on-surface': 'hsl(var(--on-surface) / <alpha-value>)',
        'on-error': 'hsl(var(--on-error) / <alpha-value>)',

        // Additional colors
        'text-primary': 'hsl(var(--text-primary) / <alpha-value>)',
        'text-secondary': 'hsl(var(--text-secondary) / <alpha-value>)',
        'text-tetiary': 'hsl(var(--text-tetiary) / <alpha-value>)',
        border: 'hsl(var(--border) / <alpha-value>)',
        input: 'hsl(var(--input) / <alpha-value>)',
        ring: 'hsl(var(--ring) / <alpha-value>)',
        foreground: 'hsl(var(--foreground) / <alpha-value>)',
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
};

module.exports = config;
