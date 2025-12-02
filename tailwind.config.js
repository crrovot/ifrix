/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // Breakpoints personalizados para diferentes tamaños de celular
    screens: {
      'xs': '360px',      // Teléfonos pequeños (iPhone SE, Galaxy S mini)
      'sm': '480px',      // Teléfonos medianos (iPhone 8, Pixel)
      'md': '640px',      // Teléfonos grandes (iPhone Plus, Galaxy S)
      'lg': '768px',      // Tablets pequeñas (iPad mini)
      'xl': '1024px',     // Tablets grandes (iPad)
      '2xl': '1280px',    // Desktop pequeño
      '3xl': '1536px',    // Desktop grande
      
      // Breakpoints específicos para altura (útil para landscape)
      'short': { 'raw': '(max-height: 600px)' },
      'tall': { 'raw': '(min-height: 800px)' },
      
      // Orientación
      'portrait': { 'raw': '(orientation: portrait)' },
      'landscape': { 'raw': '(orientation: landscape)' },
      
      // Para hover solo en dispositivos que lo soporten
      'hover-hover': { 'raw': '(hover: hover)' },
      'hover-none': { 'raw': '(hover: none)' },
      
      // Touch vs no-touch
      'touch': { 'raw': '(pointer: coarse)' },
      'pointer': { 'raw': '(pointer: fine)' },
    },
    extend: {
      // Colores de marca Ifrix
      colors: {
        ifrix: {
          'blue-dark': '#1a365d',
          'blue': '#2563eb',
          'cyan': '#06b6d4',
          'cyan-light': '#22d3ee',
          'orange': '#f97316',
          'orange-light': '#fb923c',
          'gray-dark': '#1e293b',
          'gray': '#475569',
        }
      },
      // Espaciado adicional
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Tamaños de fuente responsive
      fontSize: {
        'xxs': ['0.625rem', { lineHeight: '0.875rem' }],   // 10px
        'mobile-sm': ['0.8125rem', { lineHeight: '1.25rem' }], // 13px
        'mobile-base': ['0.875rem', { lineHeight: '1.375rem' }], // 14px
      },
      // Min-height para touch targets
      minHeight: {
        'touch': '44px',  // Mínimo recomendado para touch
        'touch-lg': '48px',
      },
      // Min-width para touch targets
      minWidth: {
        'touch': '44px',
        'touch-lg': '48px',
      },
      // Border radius responsive
      borderRadius: {
        'mobile': '0.5rem',
        'mobile-lg': '0.75rem',
      },
      // Container queries sizes
      containers: {
        'xs': '360px',
        'sm': '480px',
        'md': '640px',
        'lg': '768px',
      },
      // Animaciones
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
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
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/container-queries'),
  ],
}
