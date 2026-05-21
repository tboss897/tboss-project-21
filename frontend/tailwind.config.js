/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // SmartSchool Wallet Brand Palette
        primary: {
          50:  '#EBF2FA',
          100: '#D1E2F3',
          200: '#A3C5E7',
          300: '#75A8DB',
          400: '#478BCF',
          500: '#2E75B6',   // primary_light
          600: '#1F4E79',   // primary (main brand)
          700: '#1A4166',
          800: '#143350',
          900: '#0F263B',
          950: '#091A2A',
        },
        accent: {
          50:  '#E6F9FC',
          100: '#CDF3F9',
          200: '#9AE7F3',
          300: '#68DBED',
          400: '#35CFE7',
          500: '#00B4D8',   // accent
          600: '#0090AD',
          700: '#006C82',
          800: '#004856',
          900: '#00242B',
        },
        success: {
          50:  '#EAFAF1',
          100: '#D5F5E3',
          200: '#ABEBC6',
          300: '#82E0AA',
          400: '#58D68D',
          500: '#27AE60',   // success
          600: '#1E8B4D',
          700: '#16683A',
          800: '#0F4626',
          900: '#072313',
        },
        warning: {
          50:  '#FEF9E7',
          100: '#FDF3CF',
          200: '#FBE79F',
          300: '#F9DB6F',
          400: '#F7CF3F',
          500: '#F39C12',   // warning
          600: '#C27D0E',
          700: '#925E0B',
          800: '#613E07',
          900: '#311F04',
        },
        danger: {
          50:  '#FDECEC',
          100: '#FBDADA',
          200: '#F7B5B5',
          300: '#F28F8F',
          400: '#EE6A6A',
          500: '#E74C3C',   // danger
          600: '#B93D30',
          700: '#8B2E24',
          800: '#5C1F18',
          900: '#2E0F0C',
        },
        // Dark mode / sidebar surfaces
        surface: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          950: '#020617',
        },
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 78, 121, 0.08)',
        'card':  '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)',
        'sidebar': '4px 0 24px 0 rgba(15, 23, 42, 0.06)',
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-soft': 'pulseSoft 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
}
