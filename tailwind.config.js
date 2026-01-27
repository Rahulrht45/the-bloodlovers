/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'brand-dark': '#020014',
                'brand-cyan': '#00f0ff',
                'brand-purple': '#b026ff',
            },
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                exo: ['Exo', 'sans-serif'],
                inter: ['Inter', 'sans-serif'],
                bebas: ['Bebas Neue', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
