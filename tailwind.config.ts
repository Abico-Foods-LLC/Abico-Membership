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
        "abico-navy": "#001C3B",
        "abico-gold": "#F5C518",
        "abico-sky": "#BFE0F3",
      },
      boxShadow: {
        card: "0 20px 50px -20px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
