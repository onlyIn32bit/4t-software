/* eslint-disable @typescript-eslint/no-require-imports */
/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			backgroundImage: {
				'bg-1': "url('/src/lib/image/bg-1.png')",
				'bg-2': "url('/src/lib/image/bg-2.jpg')",
				'bg-3': "url('/src/lib/image/bg-3.png')",
				'bg-rule': "url('/src/lib/image/rule.png')",
				'bg-kd': "url('/src/lib/image/kd-bg.png')"
			},
			fontFamily: {
				'header-text': ['SVN-HEAD'],
				'number-display': ['SVN-TV'],
				'game-display': ['HANZEL'],
				futuristic: ['Tektur', 'sans-serif'],
				header: ['Inter', 'sans-serif']
			},
			animation: {
				wiggle: 'wiggle 0.5s ease-in-out infinite'
			},
			keyframes: {
				wiggle: {
					'0%, 100%': { transform: 'rotate(-5deg)' },
					'50%': { transform: 'rotate(5deg)' }
				}
			}
		}
	},
	plugins: [require('daisyui')]
};
