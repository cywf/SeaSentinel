/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        nightfall: {
          "primary": "#3b82f6",
          "secondary": "#8b5cf6",
          "accent": "#06b6d4",
          "neutral": "#1e293b",
          "base-100": "#0f172a",
          "info": "#3b82f6",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
        },
      },
      "dracula",
      "cyberpunk",
      {
        "dark-neon": {
          "primary": "#ff00ff",
          "secondary": "#00ffff",
          "accent": "#ffff00",
          "neutral": "#1a0033",
          "base-100": "#0d001a",
          "info": "#00d4ff",
          "success": "#00ff88",
          "warning": "#ffaa00",
          "error": "#ff0055",
        },
      },
      {
        "hackerman": {
          "primary": "#00ff00",
          "secondary": "#00cc00",
          "accent": "#00ff88",
          "neutral": "#001a00",
          "base-100": "#000d00",
          "info": "#00ccff",
          "success": "#00ff00",
          "warning": "#ffcc00",
          "error": "#ff3300",
        },
      },
      {
        "gamecore": {
          "primary": "#ff6b35",
          "secondary": "#f7931e",
          "accent": "#fbb13c",
          "neutral": "#2b1a0f",
          "base-100": "#1a0f08",
          "info": "#4ecdc4",
          "success": "#95e1d3",
          "warning": "#f38181",
          "error": "#aa4465",
        },
      },
      {
        "neon-accent": {
          "primary": "#ff006e",
          "secondary": "#8338ec",
          "accent": "#3a86ff",
          "neutral": "#1a1423",
          "base-100": "#0f0a1a",
          "info": "#06ffa5",
          "success": "#06ffa5",
          "warning": "#ffbe0b",
          "error": "#fb5607",
        },
      },
    ],
  },
}
