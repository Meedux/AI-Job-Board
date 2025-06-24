// Design System - Consistent styling patterns for the entire application

// Color Palette
export const colors = {
  // Primary Brand Colors
  primary: {
    50: 'bg-blue-50 dark:bg-blue-950',
    100: 'bg-blue-100 dark:bg-blue-900',
    500: 'bg-blue-500',
    600: 'bg-blue-600',
    700: 'bg-blue-700',
    text: 'text-blue-600 dark:text-blue-400'
  },
  
  // Secondary Colors
  secondary: {
    50: 'bg-purple-50 dark:bg-purple-950',
    100: 'bg-purple-100 dark:bg-purple-900',
    600: 'bg-purple-600',
    text: 'text-purple-600 dark:text-purple-400'
  },

  // Neutral Colors (Most Used)
  neutral: {
    // Backgrounds
    background: 'bg-white dark:bg-gray-900',
    backgroundSecondary: 'bg-gray-50 dark:bg-gray-800',
    backgroundTertiary: 'bg-gray-100 dark:bg-gray-700',
    
    // Surfaces
    surface: 'bg-white dark:bg-gray-800',
    surfaceHover: 'hover:bg-gray-50 dark:hover:bg-gray-700',
    
    // Borders
    border: 'border-gray-200 dark:border-gray-700',
    borderLight: 'border-gray-100 dark:border-gray-800',
    borderHover: 'hover:border-gray-300 dark:hover:border-gray-600',
    
    // Text Colors
    textPrimary: 'text-gray-900 dark:text-white',
    textSecondary: 'text-gray-700 dark:text-gray-300',
    textTertiary: 'text-gray-600 dark:text-gray-400',
    textMuted: 'text-gray-500 dark:text-gray-500'
  },

  // Status Colors
  success: {
    background: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    600: 'bg-green-600'
  },
  
  warning: {
    background: 'bg-yellow-50 dark:bg-yellow-950',
    text: 'text-yellow-700 dark:text-yellow-300'
  },
  
  error: {
    background: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300'
  }
};

// Typography Scale
export const typography = {
  // Headings
  h1: 'text-4xl lg:text-6xl font-bold leading-tight',
  h2: 'text-3xl lg:text-4xl font-bold leading-tight',
  h3: 'text-2xl font-bold leading-tight',
  h4: 'text-xl font-semibold leading-tight',
  h5: 'text-lg font-semibold leading-tight',
  h6: 'text-base font-semibold leading-tight',
  
  // Body Text
  bodyLarge: 'text-xl leading-relaxed',
  bodyBase: 'text-base leading-relaxed',
  bodySmall: 'text-sm leading-relaxed',
  bodyXSmall: 'text-xs leading-relaxed',
  
  // Special
  caption: 'text-xs font-medium uppercase tracking-wide',
  overline: 'text-xs font-semibold uppercase tracking-wider'
};

// Spacing System
export const spacing = {
  // Padding
  paddingXSmall: 'p-2',
  paddingSmall: 'p-4',
  paddingMedium: 'p-6',
  paddingLarge: 'p-8',
  paddingXLarge: 'p-12',
  
  // Margins
  marginXSmall: 'm-2',
  marginSmall: 'm-4',
  marginMedium: 'm-6',
  marginLarge: 'm-8',
  marginXLarge: 'm-12',
  
  // Gaps
  gapXSmall: 'gap-2',
  gapSmall: 'gap-4',
  gapMedium: 'gap-6',
  gapLarge: 'gap-8'
};

// Component Styles
export const components = {
  // Buttons
  button: {
    base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    primary: `${colors.primary[600]} text-white hover:${colors.primary[700]} focus:ring-blue-500`,
    secondary: `${colors.neutral.border} ${colors.neutral.textSecondary} ${colors.neutral.surfaceHover} focus:ring-gray-500`,
    ghost: `${colors.neutral.textSecondary} ${colors.neutral.surfaceHover} focus:ring-gray-500`,
    sizes: {
      small: 'px-3 py-1.5 text-sm',
      medium: 'px-4 py-2 text-base',
      large: 'px-6 py-3 text-lg'
    }
  },
  
  // Cards
  card: {
    base: `${colors.neutral.surface} ${colors.neutral.border} rounded-lg shadow-sm transition-all duration-200`,
    hover: 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700',
    padding: spacing.paddingMedium
  },
  // Form Elements
  input: {
    base: `w-full px-4 py-3 border-2 ${colors.neutral.border} rounded-lg ${colors.neutral.surface} 
           placeholder:${colors.neutral.textMuted} 
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
           hover:border-blue-300 dark:hover:border-blue-600
           transition-all duration-200 
           text-gray-900 dark:text-white`,
    error: 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-400 dark:border-green-500 focus:ring-green-500 focus:border-green-500',
    disabled: 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60',
    sizes: {
      small: 'px-3 py-2 text-sm',
      medium: 'px-4 py-3 text-base',
      large: 'px-5 py-4 text-lg'
    }
  },
  
  // Form Labels
  label: {
    base: `block text-sm font-semibold ${colors.neutral.textPrimary} mb-2`,
    required: 'after:content-["*"] after:text-red-500 after:ml-1',
    optional: 'after:content-["(optional)"] after:text-gray-400 after:ml-1 after:text-xs after:font-normal'
  },
  
  // Form Groups
  formGroup: {
    base: 'space-y-2',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
    inline: 'flex items-center space-x-4'
  },
  
  // Textarea
  textarea: {
    base: `w-full px-4 py-3 border-2 ${colors.neutral.border} rounded-lg ${colors.neutral.surface} 
           placeholder:${colors.neutral.textMuted} 
           focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
           hover:border-blue-300 dark:hover:border-blue-600
           transition-all duration-200 resize-vertical
           text-gray-900 dark:text-white`,
    error: 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500'
  },
  
  // Navigation
  nav: {
    link: `${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} transition-colors`,
    activeLink: `${colors.neutral.textPrimary} font-medium`
  }
};

// Layout Constants
export const layout = {
  container: 'container mx-auto px-4',
  maxWidth: 'max-w-7xl mx-auto',
  section: 'py-12 lg:py-20',
  grid: {
    responsive: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    sidebar: 'grid grid-cols-12 gap-8'
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
  primaryLight: 'bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950',
  hero: 'bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800'
};
