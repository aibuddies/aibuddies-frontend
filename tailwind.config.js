import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      container: { center: true, padding: "1rem" },
      colors: {
        brand: {
          50: "#eef6ff",
          100: "#d9eaff",
          200: "#b7d6ff",
          300: "#89bbff",
          400: "#5b9cff",
          500: "#377fff",
          600: "#1f63f2",
          700: "#174ed1",
          800: "#173fa6",
          900: "#173781"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
