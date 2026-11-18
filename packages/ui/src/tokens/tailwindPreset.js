/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        page: 'var(--p-bg)',
        surface: {
          DEFAULT: 'var(--p-surface)',
          elevated: 'var(--p-surface-elevated)',
        },
        ink: {
          DEFAULT: 'var(--p-ink)',
          muted: 'var(--p-muted)',
        },
        border: {
          DEFAULT: 'var(--p-border)',
          subtle: 'var(--p-border-subtle)',
        },
        accent: {
          DEFAULT: 'var(--p-accent)',
          ink: 'var(--p-accent-ink)',
        },
        action: {
          DEFAULT: 'var(--p-action)',
          hover: 'var(--p-action-hover)',
          ink: 'var(--p-action-ink)',
        },
        status: {
          sell: 'var(--color-sell)',
          'sell-ink': 'var(--color-sell-ink)',
          hold: 'var(--color-hold)',
          'hold-ink': 'var(--color-hold-ink)',
          pod: 'var(--color-pod-cold)',
          solar: 'var(--color-solar)',
        },
        grade: {
          a: 'var(--color-grade-a)',
          'a-bg': 'var(--color-grade-a-bg)',
          b: 'var(--color-grade-b)',
          'b-bg': 'var(--color-grade-b-bg)',
          c: 'var(--color-grade-c)',
          'c-bg': 'var(--color-grade-c-bg)',
        },
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-text)'],
        tamil: ['var(--font-tamil)'],
        devanagari: ['var(--font-devanagari)'],
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        full: 'var(--radius-full)',
      },
      minHeight: {
        touch: 'var(--min-touch-target)',
      },
      minWidth: {
        touch: 'var(--min-touch-target)',
      },
    },
  },
};
