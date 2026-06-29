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
        "abico-navy":  "#001C3B",
        "abico-blue":  "#1572BE",
        "abico-dark":  "#0E5A9C",
        "abico-light": "#6FC4EE",
        "abico-sky":   "#00b5f5",
        // legacy alias — бүх газар солигдтол
        "abico-gold":  "#1572BE",
      },
      boxShadow: {
        card: "0 20px 50px -20px rgba(0, 0, 0, 0.45)",
      },
    },
  },
  plugins: [],
};
export default config;
