import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#18201b",
        moss: "#4b6b46",
        leaf: "#7fa368",
        cream: "#f7f3e8",
        wheat: "#e5d6b8",
        clay: "#b26f4a"
      }
    }
  },
  plugins: []
};

export default config;
