export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        /* Primary: Royal Blue */
        "primary": "#2563EB",
        "primary-dim": "#1d4ed8",
        "primary-container": "#dbeafe",
        "primary-fixed": "#dbeafe",
        "primary-fixed-dim": "#bfdbfe",
        "on-primary": "#ffffff",
        "on-primary-container": "#1e40af",
        "on-primary-fixed": "#1e3a8a",
        "on-primary-fixed-variant": "#1d4ed8",
        "inverse-primary": "#60a5fa",

        /* Secondary: Slate Gray */
        "secondary": "#52525b",
        "secondary-dim": "#3f3f46",
        "secondary-container": "#e4e4e7",
        "secondary-fixed": "#e4e4e7",
        "secondary-fixed-dim": "#d4d4d8",
        "on-secondary": "#fafafa",
        "on-secondary-container": "#3f3f46",
        "on-secondary-fixed": "#27272a",
        "on-secondary-fixed-variant": "#52525b",

        /* Tertiary: Neutral */
        "tertiary": "#71717a",
        "tertiary-dim": "#52525b",
        "tertiary-container": "#f4f4f5",
        "tertiary-fixed": "#f4f4f5",
        "tertiary-fixed-dim": "#e4e4e7",
        "on-tertiary": "#fafafa",
        "on-tertiary-container": "#52525b",
        "on-tertiary-fixed": "#3f3f46",
        "on-tertiary-fixed-variant": "#71717a",

        /* Error */
        "error": "#dc2626",
        "error-dim": "#991b1b",
        "error-container": "#fee2e2",
        "on-error": "#ffffff",
        "on-error-container": "#7f1d1d",

        /* Surface & Background */
        "surface": "#fafafa",
        "surface-dim": "#e4e4e7",
        "surface-bright": "#ffffff",
        "surface-tint": "#2563EB",
        "surface-variant": "#f4f4f5",
        "surface-container": "#f5f5f5",
        "surface-container-low": "#fafafa",
        "surface-container-high": "#f0f0f2",
        "surface-container-highest": "#e4e4e7",
        "surface-container-lowest": "#ffffff",
        "background": "#f0f0f2",
        "on-surface": "#18181b",
        "on-surface-variant": "#52525b",
        "on-background": "#18181b",
        "inverse-surface": "#18181b",
        "inverse-on-surface": "#a1a1aa",

        /* Outline */
        "outline": "#d4d4d8",
        "outline-variant": "#e4e4e7",
        "outline-dark": "#18181b",
      },
      fontFamily: {
        headline: ["Manrope", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"],
        label: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "Consolas", "Courier New", "monospace"],
      },
      borderRadius: {
        none: "0px",
        sm: "0px",
        md: "0px",
        lg: "0px",
        xl: "0px",
        "2xl": "0px",
        "3xl": "0px",
        full: "0px",
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
