import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        grit: {
          50: "#F7F5FF",
          100: "#EEE9FF",
          200: "#DDD4FF",
          300: "#C5B5FF",
          400: "#A78BFA",
          500: "#7C3AED",
          600: "#6D28D9",
          700: "#5B21B6",
          800: "#45209A",
          900: "#32156F"
        }
      }
    }
  },
  plugins: []
};

export default config;
