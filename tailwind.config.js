/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{html,js,svelte,ts}"],
    theme: {
        extend: {
            fontFamily: {
                Inter: ['"Inter"', "sans-serif"],
            },
            colors: {
                "figma-color-bg-tertiary": "#e6e6e6",
                "figma-color-text-main": "#1a1a1a",
                "figma-color-black8": "#333333",
                "figma-color-icon-danger": "#F24822",
                "figma-color-bg-brand": "#0d99ff",
                "figma-color-bg-secondary": "#f5f5f5",
                "figma-color-bg-brand-hover": "#007be5",
                "figma-color-bg-disabled-secondary": "#b3b3b3",
                "figma-color-bg-brand-tertiary": "#e5f4ff",
                "figma-color-bg-success": "#14ae5c",
                "figma-color-bg-danger": "#f24822",
                "figma-color-bg-selected": "#e5f4ff",
                "figma-color-bg-inverse": "#2c2c2c",
                "figma-color-text-secondary": "#7f7f7f",
            },
            fontSize: {
                xxs: "11px",
            },
            spacing: {
                88: "22rem",
            },
        },
    },
    plugins: [],
};
