import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'root': 'var(--root)',
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'blue': 'var(--paper-blue)',
        'muted-foreground': 'var(--muted-foreground)',
      },
      screens: {
        container: '1300px',
      },
      height: {
        nav: '72px',
      },
    },
  },
  plugins: [],
} satisfies Config;
