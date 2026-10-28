import type { Config } from "tailwindcss";
import { themeExtend } from "./src/styles/tokens/tailwind.tokens";

const config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: themeExtend,
  },
} satisfies Config;

export default config;
