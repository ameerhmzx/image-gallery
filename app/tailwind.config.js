module.exports = {
    purge: [
        './src/**/*.{js,jsx,ts,tsx}',
        './public/index.html'
    ],
    darkMode: false, // or 'media' or 'class'
    theme: {
        extend: {
            minWidth: {
                '0': '0',
                '1/5': '20%',
                '1/4': '25%',
                '2/5': '40%',
                '1/2': '50%',
                '3/4': '75%',
                'full': '100%',
            }
        },
    },
    variants: {
        extend: {},
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@tailwindcss/aspect-ratio')
    ],
}
