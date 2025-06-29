// Design System - Consistent styling patterns for the entire application

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: 'bg-blue-50 dark:bg-blue-950',
    100: 'bg-blue-900',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text: 'text-blue-400'
  },
  
  // Secondary Colors
  secondary: {
    50: 'bg-purple-950',
    100: 'bg-purple-900',
    600: 'bg-purple-600',
    text: 'text-purple-400'
  },

  // Neutral Colors (Most Used)
  neutral: {
    // Backgrounds
    background: 'bg-gray-900',
    backgroundSecondary: 'bg-gray-800',
    backgroundTertiary: 'bg-gray-700',
    
    // Surfaces
    surface: 'bg-gray-800',
    surfaceHover: 'hover:bg-gray-700',
    
    // Borders
    border: 'border-gray-700',
    borderLight: 'border-gray-800',
    borderHover: 'hover:border-gray-600',
    
    // Text Colors
    textPrimary: 'text-white',
    textSecondary: 'text-gray-300',
    textTertiary: 'text-gray-400',
    textMuted: 'text-gray-500'
  },

  // Status Colors
  success: {
    background: 'bg-green-950',
    text: 'text-green-400',
    600: 'bg-green-600'
  },
  
  warning: {
    background: 'bg-yellow-950',
    text: 'text-yellow-400'
  },
  
  error: {
    background: 'bg-red-950',
    text: 'text-red-400'
  }
};

// Typography Scale - Mobile Optimized
export const typography = {
  // Headings - Mobile First with Responsive Scaling
  h1: 'text-3xl sm:text-4xl lg:text-6xl font-bold leading-tight',
  h2: 'text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight',
  h3: 'text-xl sm:text-2xl font-bold leading-tight',
  h4: 'text-lg sm:text-xl font-semibold leading-tight',
  h5: 'text-base sm:text-lg font-semibold leading-tight',
  h6: 'text-sm sm:text-base font-semibold leading-tight',
  
  // Body Text - Mobile Optimized
  bodyLarge: 'text-lg sm:text-xl leading-relaxed',
  bodyBase: 'text-sm sm:text-base leading-relaxed',
  bodySmall: 'text-xs sm:text-sm leading-relaxed',
  bodyXSmall: 'text-xs leading-relaxed',
  
  // Special
  caption: 'text-xs font-medium uppercase tracking-wide',
  overline: 'text-xs font-semibold uppercase tracking-wider'
};

// Spacing System - Mobile First
export const spacing = {
  // Padding - Responsive
  paddingXSmall: 'p-1 sm:p-2',
  paddingSmall: 'p-2 sm:p-4',
  paddingMedium: 'p-4 sm:p-6',
  paddingLarge: 'p-6 sm:p-8',
  paddingXLarge: 'p-8 sm:p-12',
  
  // Margins - Responsive
  marginXSmall: 'm-1 sm:m-2',
  marginSmall: 'm-2 sm:m-4',
  marginMedium: 'm-4 sm:m-6',
  marginLarge: 'm-6 sm:m-8',
  marginXLarge: 'm-8 sm:m-12',
  
  // Gaps - Responsive
  gapXSmall: 'gap-1 sm:gap-2',
  gapSmall: 'gap-2 sm:gap-4',
  gapMedium: 'gap-4 sm:gap-6',
  gapLarge: 'gap-6 sm:gap-8'
};

// Component Styles - Mobile Optimized
export const components = {
  // Buttons - Mobile Friendly
  button: {
    base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation',
    primary: `${colors.primary[600]} text-white hover:${colors.primary[700]} focus:ring-blue-500`,
    secondary: `${colors.neutral.border} ${colors.neutral.textSecondary} ${colors.neutral.surfaceHover} focus:ring-gray-500`,
    ghost: `${colors.neutral.textSecondary} ${colors.neutral.surfaceHover} focus:ring-gray-500`,
    sizes: {
      small: 'px-2 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm',
      medium: 'px-3 py-2 sm:px-4 sm:py-2 text-sm sm:text-base',
      large: 'px-4 py-2.5 sm:px-6 sm:py-3 text-base sm:text-lg'
    }
  },
  
  // Cards - Mobile Responsive
  card: {
    base: `${colors.neutral.surface} ${colors.neutral.border} rounded-lg shadow-sm transition-all duration-200`,
    hover: 'hover:shadow-lg hover:border-blue-700',
    padding: 'p-4 sm:p-6'
  },

  // Form Elements - Mobile Optimized
  input: {
    base: `w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 ${colors.neutral.border} rounded-lg ${colors.neutral.surface} 
           placeholder:${colors.neutral.textMuted} 
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
           hover:border-blue-600
           transition-all duration-200 
           text-white text-sm sm:text-base`,
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
    disabled: 'bg-gray-800 cursor-not-allowed opacity-60',
    sizes: {
      small: 'px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm',
      medium: 'px-3 py-2.5 sm:px-4 sm:py-3 text-sm sm:text-base',
      large: 'px-4 py-3 sm:px-5 sm:py-4 text-base sm:text-lg'
    }
  },
  
  // Form Labels - Mobile Friendly
  label: {
    base: `block text-xs sm:text-sm font-semibold ${colors.neutral.textPrimary} mb-1.5 sm:mb-2`,
    required: 'after:content-["*"] after:text-red-500 after:ml-1',
    optional: 'after:content-["(optional)"] after:text-gray-400 after:ml-1 after:text-xs after:font-normal'
  },
  
  // Form Groups - Mobile Layout
  formGroup: {
    base: 'space-y-1.5 sm:space-y-2',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6',
    inline: 'flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4'
  },
  
  // Textarea - Mobile Optimized
  textarea: {
    base: `w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 ${colors.neutral.border} rounded-lg ${colors.neutral.surface} 
           placeholder:${colors.neutral.textMuted} 
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
           hover:border-blue-300 dark:hover:border-blue-600
           transition-all duration-200 resize-vertical
           text-white text-sm sm:text-base`,
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500'
  },
  
  // Navigation - Mobile Responsive
  nav: {
    link: `${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} transition-colors text-sm sm:text-base`,
    activeLink: `${colors.neutral.textPrimary} font-medium text-sm sm:text-base`
  }
};

// Layout Constants - Mobile First
export const layout = {
  container: 'container mx-auto px-3 sm:px-4 lg:px-6',
  maxWidth: 'max-w-7xl mx-auto',
  section: 'py-8 sm:py-12 lg:py-20',
  grid: {
    responsive: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    sidebar: 'grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8'
  },
  // Mobile specific layouts
  mobile: {
    padding: 'px-3 py-2',
    margin: 'mx-3 my-2',
    fullWidth: 'w-full',
    stack: 'flex flex-col space-y-3',
    center: 'flex items-center justify-center'
  }
};

// Animation & Transitions
export const animations = {
  transition: 'transition-all duration-200',
  transitionSlow: 'transition-all duration-300',
  hover: 'hover:scale-105 transition-transform duration-200',
  fadeIn: 'opacity-0 animate-fade-in',
  slideIn: 'transform translate-y-4 animate-slide-in'
};

// Helper Functions
export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

// Gradient Utilities
export const gradients = {
  primary: 'bg-gradient-to-r from-blue-600 to-purple-600',
  hero: 'bg-gradient-to-br from-gray-900 to-gray-800'
};
