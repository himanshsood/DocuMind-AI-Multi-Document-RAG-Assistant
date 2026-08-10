/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#202124",
        muted: "#667085",
        line: "#E4E7EC",
        paper: "#FFFFFF",
        page: "#F6FAFC",
        sky: "#87CEEB",
        skySoft: "#EAF8FE",
        accent: "#1E3A8A",
        accentDark: "#172554",
      },
      boxShadow: {
        soft: "0 18px 50px rgba(30, 58, 138, 0.14)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Segoe UI",
          "Arial",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
