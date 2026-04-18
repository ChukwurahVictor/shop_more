import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/**/*.blade.php",
        "./resources/**/*.{js,ts,jsx,tsx}",
        "./resources/**/*.vue",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ["Figtree", ...defaultTheme.fontFamily.sans],
            },
            colors: {
                brand: "#1d9e75",
            },
            keyframes: {
                "toast-in": {
                    from: { opacity: "0", transform: "translateY(12px)" },
                    to: { opacity: "1", transform: "translateY(0)" },
                },
                "confetti-fall": {
                    "0%": {
                        transform: "translateY(-10px) rotate(0deg)",
                        opacity: "1",
                    },
                    "100%": {
                        transform: "translateY(110vh) rotate(720deg)",
                        opacity: "0",
                    },
                },
                "modal-in": {
                    from: {
                        opacity: "0",
                        transform: "scale(0.85) translateY(20px)",
                    },
                    to: { opacity: "1", transform: "scale(1) translateY(0)" },
                },
                "pulse-ring": {
                    "0%, 100%": { boxShadow: "0 0 0 0 rgba(29, 158, 117, 0.25)" },
                    "50%": { boxShadow: "0 0 0 6px rgba(29, 158, 117, 0)" },
                },
                celebrate: {
                    "0%, 100%": { transform: "scale(1)" },
                    "50%": { transform: "scale(1.04)" },
                },
            },
            animation: {
                "toast-in": "toast-in 0.25s ease-out",
                "confetti-fall":
                    "confetti-fall var(--duration,3s) ease-in forwards",
                "modal-in":
                    "modal-in 0.3s cubic-bezier(0.34,1.56,0.64,1) forwards",
                "pulse-ring": "pulse-ring 2s ease-in-out infinite",
                celebrate: "celebrate 1.6s ease-in-out infinite",
            },
        },
    },
    plugins: [],
};
