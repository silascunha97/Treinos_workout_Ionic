/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        // --- Tokens originais do app (mantidos: usados em home/profile/tabs/login já construídos) ---
        volt: {
          DEFAULT: '#b2f500',
          hover: '#9cd800',
          light: '#c2f733',
        },
        dark: {
          bg: '#0b0c0e',
          card: '#15171c',
          input: '#1e2027',
          border: '#252830',
        },
        // 'muted' já existia como cor de texto "apagado" (text-muted). Vira DEFAULT aqui, e
        // ganha 'foreground' pra também resolver `text-muted-foreground` (convenção do protótipo
        // Lovable) com o MESMO valor — não é uma cor nova, é o mesmo tom com dois nomes.
        muted: {
          DEFAULT: '#8b92a0',
          foreground: '#8b92a0',
        },

        // --- Design system trazido do protótipo Lovable (FORJA), em oklch no protótipo original,
        // aproximado aqui pros equivalentes hex mais próximos dos tokens que já existem no app,
        // pra manter as duas paletas coerentes entre si. ---
        background: '#0b0c0e',
        foreground: '#ffffff',
        surface: {
          DEFAULT: '#15171c',
          elevated: '#1c1f26',
        },
        card: {
          DEFAULT: '#15171c',
          foreground: '#ffffff',
        },
        popover: {
          DEFAULT: '#20232b',
          foreground: '#ffffff',
        },
        primary: {
          DEFAULT: '#b2f500',
          foreground: '#0b0c0e',
        },
        secondary: {
          DEFAULT: '#23262d',
          foreground: '#ffffff',
        },
        accent: {
          DEFAULT: '#23262d',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: '#ef4444',
          foreground: '#ffffff',
        },
        success: '#34d399',
        warning: '#f5b93d',
        info: '#5eb3f5',
        border: 'rgba(255,255,255,0.09)',
        input: 'rgba(255,255,255,0.13)',
        ring: 'rgba(178,245,0,0.55)',
      },
      fontFamily: {
        sans: ['Archivo', 'system-ui', 'sans-serif'],
        display: ['Archivo', 'system-ui', 'sans-serif'],
        numeric: ['"Barlow Condensed"', 'Archivo', 'sans-serif'],
      },
      borderRadius: {
        // Nomes originais do app (mantidos)
        'app-sm': '8px',
        'app-md': '16px',
        'app-lg': '24px',
        // Escala do protótipo Lovable, derivada de --radius: 1rem (16px), pra classes
        // `rounded-*` padrão do Tailwind baterem com o desenho original tela a tela.
        sm: '12px',
        md: '14px',
        lg: '16px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '28px',
        '4xl': '32px',
      },
      boxShadow: {
        lift: '0 12px 32px -16px rgba(0,0,0,0.7)',
      },
    },
  },
  plugins: [],
};
