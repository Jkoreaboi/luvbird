import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EE",
        ink: "#24464A",
        sky: "#DEE9E8",
        coral: "#B76850",
        envelope: "#FFFEFA",
      },
      boxShadow: {
        letter: "0 20px 60px rgba(36,70,74,.12)",
      },
      fontFamily: {
        sans: ["Arial", "Helvetica", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px) rotate(-1deg)" },
          "50%": { transform: "translateY(-8px) rotate(1deg)" }
        },
        drift: {
          "0%": { transform: "translateX(-6px)" },
          "50%": { transform: "translateX(6px)" },
          "100%": { transform: "translateX(-6px)" }
        }
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        drift: "drift 8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
