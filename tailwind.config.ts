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
        // premium — soft, layered, faintly brand-tinted elevation
        soft: "0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -8px rgba(15, 23, 42, 0.08)",
        elevated: "0 4px 12px rgba(15, 23, 42, 0.05), 0 24px 48px -16px rgba(15, 23, 42, 0.14)",
        glow: "0 8px 30px -8px rgba(21, 114, 190, 0.35)",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        marquee: "marquee 22s linear infinite",
        "fade-up": "fade-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) both",
      },
      transitionTimingFunction: {
        premium: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};
export default config;
