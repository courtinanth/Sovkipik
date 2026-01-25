/** @type {import('tailwindcss').Config} */
export default {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
        extend: {
            colors: {
                forest: {
                    DEFAULT: '#3A5A40', // Hunter Green - Main elements
                    light: '#A3B18A',   // Sage Green - Soft highlights/backgrounds
                    dark: '#1A2F23',    // Deep Moss - Text/Headers/Footer
                },
                earth: {
                    DEFAULT: '#BC6C25', // Tiger's Eye - Buttons/Accents
                    light: '#DDA15E',   // Buff - Secondary accents
                    dark: '#603813',    // Dark Wood - Text
                },
                beige: {
                    DEFAULT: '#F5F5DC', // Classic Beige - Body background
                    softer: '#DAD7CD',  // Muted Sage/Grey - Alternate backgrounds
                    dark: '#E8E0D5',
                },
                highlight: {
                    DEFAULT: '#E76F51', // Burnt Sienna - Urgent buttons/Alerts
                    hover: '#D65A3B',
                }
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                display: ['Outfit', 'sans-serif'], // Optional: adding a display font if we wanted, but sticking to Inter for now is safe.
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'sway': 'sway 4s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                sway: {
                    '0%, 100%': { transform: 'rotate(-3deg)' },
                    '50%': { transform: 'rotate(3deg)' },
                }
            }
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
}
