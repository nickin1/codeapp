/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ['class'],
	content: [
		"./app/**/*.{js,ts,jsx,tsx,mdx}",
		"./pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./components/**/*.{js,ts,jsx,tsx,mdx}",
		"./lib/**/*.{js,ts,jsx,tsx,mdx}",
		"./@/**/*.{ts,tsx}"
	],
	theme: {
		extend: {
			colors: {
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				chart: {
					'1': 'hsl(var(--chart-1))',
					'2': 'hsl(var(--chart-2))',
					'3': 'hsl(var(--chart-3))',
					'4': 'hsl(var(--chart-4))',
					'5': 'hsl(var(--chart-5))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				typing: {
					"0%": {
						width: "0%",
						visibility: "hidden"
					},
					"100%": {
						width: "100%",
						borderRight: "transparent"
					}
				}
			},
			animation: {
				typing: "typing 2s steps(20) forwards"
			}
		}
	},
	plugins: [
		require('@tailwindcss/typography'),
		require("tailwindcss-animate")
	],
	safelist: [
		// Layout
		'flex-1',
		'flex',
		'flex-col',
		'items-center',
		'justify-between',
		'gap-2',
		'gap-3',
		'gap-4',
		'gap-6',
		'space-y-3',
		'space-y-4',
		'grid',
		'grid-cols-1',
		'md:grid-cols-2',
		'md:grid-cols-[2fr,1fr]',

		// Spacing
		'p-2',
		'p-4',
		'p-6',
		'px-4',
		'py-2',
		'py-6',
		'pb-3',
		'pb-6',
		'pl-4',
		'pt-3',
		'sm:p-6',
		'sm:pb-10',

		// Typography
		'text-sm',
		'text-lg',
		'text-xl',
		'text-3xl',
		'text-muted-foreground',
		'font-bold',
		'font-semibold',
		'tracking-tight',
		'sm:text-4xl',
		'sm:text-5xl',
		'sm:text-xl',

		// Colors & Backgrounds
		'bg-primary/10',
		'text-primary',
		'border-0',

		// Sizing
		'h-4',
		'h-5',
		'h-6',
		'w-4',
		'w-5',
		'w-6',
		'min-h-[48px]',
		'min-h-[200px]',
		'max-w-6xl',

		// Utilities
		'rounded-lg',
		'shadow-none',
		'mx-auto',
		'flex-shrink-0',
		'mt-0.5',

		// Dark mode
		'dark:text-gray-400',
		'dark:hover:text-gray-200',
		'dark:hover:bg-gray-700',

		// Responsive
		'sm:flex-row',
		'sm:gap-4',
		'sm:px-6',
		'sm:py-12',
		'lg:px-8'
	]
};
