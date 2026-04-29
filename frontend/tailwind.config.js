/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eef4ff",
          100: "#dae6ff",
          200: "#bdd1ff",
          300: "#92b1ff",
          400: "#6188ff",
          500: "#3a62fb",
          600: "#2541ef",
          700: "#1d31cc",
          800: "#1d2ea3",
          900: "#1e2c81",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(16,24,40,.04), 0 1px 3px rgba(16,24,40,.06)",
      },
      keyframes: {
        "fade-in": { from: { opacity: 0 }, to: { opacity: 1 } },
        "slide-up": {
          from: { opacity: 0, transform: "translateY(8px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in .15s ease-out",
        "slide-up": "slide-up .2s ease-out",
      },
    },
  },
  plugins: [],
};
