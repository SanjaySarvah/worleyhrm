// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        primary: '#1E3A8A',   
        secondary: '#2563EB',   
        accent: '#10B981',      
        muted: '#6B7280',      
        background: '#F9FAFB',
        border: '#E5E7EB',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        xl: '1rem',
      },
    },
  },
  plugins: [],
};
