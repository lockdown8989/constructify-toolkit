
import type { Config } from "tailwindcss";

export default {
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
					bg: 'hsl(45 100% 93%)',
					card: 'hsl(0 0% 100%)',
					primary: 'hsl(0 0% 0%)',
					secondary: 'hsl(0 0% 42%)',
					accent: 'hsl(var(--teampulse-accent))',
					success: 'hsl(var(--teampulse-success))',
					warning: 'hsl(33 100% 64%)',
					danger: 'hsl(0 100% 74%)',
					'muted-foreground': 'hsl(215 14% 58%)',
				},
				// Add Apple-inspired gray color palette
				'apple-gray': {
					'50': 'hsl(var(--apple-gray-50))',
					'100': 'hsl(var(--apple-gray-100))',
					'200': 'hsl(var(--apple-gray-200))',
					'300': 'hsl(var(--apple-gray-300))',
					'400': 'hsl(var(--apple-gray-400))',
					'500': 'hsl(var(--apple-gray-500))',
					'600': 'hsl(var(--apple-gray-600))',
					'700': 'hsl(var(--apple-gray-700))',
					'800': 'hsl(var(--apple-gray-800))',
					'900': 'hsl(var(--apple-gray-900))',
				},
				'apple-blue': 'hsl(var(--apple-blue))',
				'apple-indigo': 'hsl(var(--apple-indigo))',
				'apple-purple': 'hsl(var(--apple-purple))',
				'apple-green': 'hsl(var(--apple-green))',
				'apple-red': 'hsl(var(--apple-red))',
				'apple-orange': 'hsl(var(--apple-orange))',
				'apple-yellow': 'hsl(var(--apple-yellow))',
				'apple-teal': 'hsl(var(--apple-teal))',
				'apple-pink': 'hsl(var(--apple-pink))',
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
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-up': 'fade-up 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'pulse-soft': 'pulse-soft 3s infinite ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
