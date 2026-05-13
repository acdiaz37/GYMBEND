import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        "gray-title": "#ffffff",
        "gray-subtitle": "#8e8e93",
        "gray-timer": "#aeaeb2",
        "accent-blue": "#0a84ff",
        "accent-red": "#ff453a",
        "separator": "rgba(255, 255, 255, 0.1)",
        "muted-teal": "#5ac8fa",
        "muted-pink": "#ff2d55",
        "muted-purple": "#af52de",
        "muted-beige": "#d4c5a9",
        "muted-darkblue": "#007aff",
      },
      maxWidth: {
        mobile: "430px",
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "'SF Pro Display'",
          "'Segoe UI'",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
export default config;
