/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                kalvium: {
                    red: '#D32F2F',
                    dark: '#1A1A1A',
                    gray: '#F5F5F5'
                }
            }
        },
    },
    plugins: [],
}
