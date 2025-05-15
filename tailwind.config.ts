import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['SF Pro Display', 'system-ui', 'sans-serif'],
				mono: ['SF Mono', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				teampulse: {
					bg: '#F7F1E0',
					card: '#FFFFFF',
					primary: '#000000',
					secondary: '#6B6B6B',
					accent: '#FFCB45',
					success: '#85CC75',
					warning: '#FFB34A',
					danger: '#FF7A7A',
					'muted-foreground': '#8E9196',
				},
				// Add Apple-inspired gray color palette
				'apple-gray': {
					'50': '#F9F9F9',
					'100': '#F2F2F7',
					'200': '#E5E5EA',
					'300': '#D1D1D6',
					'400': '#C7C7CC',
					'500': '#AEAEB2',
					'600': '#8E8E93',
					'700': '#636366',
					'800': '#3A3A3C',
					'900': '#1C1C1E',
				},
				'apple-blue': 'var(--apple-blue)',
				'apple-indigo': 'var(--apple-indigo)',
				'apple-purple': 'var(--apple-purple)',
				'apple-green': 'var(--apple-green)',
				'apple-red': 'var(--apple-red)',
				'apple-orange': 'var(--apple-orange)',
				'apple-yellow': 'var(--apple-yellow)',
				'apple-teal': 'var(--apple-teal)',
				'apple-pink': 'var(--apple-pink)',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
				'2xl': '16px',
				'3xl': '24px',
				'4xl': '32px',
				'5xl': '40px',
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-up': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.95)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'pulse-soft': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'calendar-pull': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(300%)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 3s infinite ease-in-out',
				'calendar-pull': 'calendar-pull 1.5s infinite ease-in-out'
			},
			touchAction: {
				'pan-y': 'pan-y',
				'pan-x': 'pan-x',
				'pinch-zoom': 'pinch-zoom',
				'manipulation': 'manipulation',
				'none': 'none',
			},
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.touch-action-pan-y': {
					'touch-action': 'pan-y',
				},
				'.touch-action-pan-x': {
					'touch-action': 'pan-x',
				},
				'.touch-action-pinch-zoom': {
					'touch-action': 'pinch-zoom',
				},
				'.touch-action-manipulation': {
					'touch-action': 'manipulation',
				},
				'.touch-action-none': {
					'touch-action': 'none',
				},
				'.overscroll-behavior-y-contain': {
					'overscroll-behavior-y': 'contain',
				},
				'.overscroll-behavior-x-contain': {
					'overscroll-behavior-x': 'contain',
				},
				'.overscroll-behavior-contain': {
					'overscroll-behavior': 'contain',
				},
			}
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
