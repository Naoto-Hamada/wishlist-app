import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
    },
  },
  plugins: [],
};
export default config;

// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          start: '#00FFFF',
          end: '#008080',
        },
        accent: {
          1: '#FF6B6B',
          2: '#FFD93D',
        },
        text: {
          primary: '#333333',
          secondary: '#666666',
          inverted: '#FFFFFF',
        },
        background: {
          main: '#F0F8FF',
          secondary: '#E0FFFF',
        },
      },
      gradientColorStops: theme => ({
        'primary-start': theme('colors.primary.start'),
        'primary-end': theme('colors.primary.end'),
      }),
    },
  },
  variants: {},
  plugins: [],
}