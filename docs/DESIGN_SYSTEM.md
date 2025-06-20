# Design System Documentation

## Overview

This design system ensures consistent styling across all components in the GetGetHired job site application. It follows atomic design principles and provides a centralized system for colors, typography, spacing, and component styles.

## 🎨 Color Palette

### Primary Colors (Blue)
- **Primary 50**: `bg-blue-50 dark:bg-blue-950` - Very light background
- **Primary 100**: `bg-blue-100 dark:bg-blue-900` - Light background
- **Primary 500**: `bg-blue-500` - Medium blue
- **Primary 600**: `bg-blue-600` - Primary brand color
- **Primary 700**: `bg-blue-700` - Darker primary
- **Primary Text**: `text-blue-600 dark:text-blue-400`

### Secondary Colors (Purple)
- **Secondary 50**: `bg-purple-50 dark:bg-purple-950`
- **Secondary 100**: `bg-purple-100 dark:bg-purple-900`
- **Secondary 600**: `bg-purple-600`
- **Secondary Text**: `text-purple-600 dark:text-purple-400`

### Neutral Colors (Gray Scale)
- **Background**: `bg-white dark:bg-gray-900` - Main page background
- **Background Secondary**: `bg-gray-50 dark:bg-gray-800` - Cards, sections
- **Background Tertiary**: `bg-gray-100 dark:bg-gray-700` - Subtle backgrounds
- **Surface**: `bg-white dark:bg-gray-800` - Card surfaces
- **Surface Hover**: `hover:bg-gray-50 dark:hover:bg-gray-700`

### Text Colors
- **Primary Text**: `text-gray-900 dark:text-white` - Headings, important text
- **Secondary Text**: `text-gray-700 dark:text-gray-300` - Body text
- **Tertiary Text**: `text-gray-600 dark:text-gray-400` - Supporting text
- **Muted Text**: `text-gray-500 dark:text-gray-500` - Least important text

### Status Colors
- **Success**: `bg-green-50 dark:bg-green-950` (background), `text-green-700 dark:text-green-300` (text)
- **Warning**: `bg-yellow-50 dark:bg-yellow-950` (background), `text-yellow-700 dark:text-yellow-300` (text)
- **Error**: `bg-red-50 dark:bg-red-950` (background), `text-red-700 dark:text-red-300` (text)

## 📝 Typography Scale

### Headings
- **H1**: `text-4xl lg:text-6xl font-bold leading-tight` - Hero headings
- **H2**: `text-3xl lg:text-4xl font-bold leading-tight` - Section headings
- **H3**: `text-2xl font-bold leading-tight` - Subsection headings
- **H4**: `text-xl font-semibold leading-tight` - Card titles
- **H5**: `text-lg font-semibold leading-tight` - Small headings
- **H6**: `text-base font-semibold leading-tight` - Micro headings

### Body Text
- **Body Large**: `text-xl leading-relaxed` - Hero descriptions
- **Body Base**: `text-base leading-relaxed` - Standard body text
- **Body Small**: `text-sm leading-relaxed` - Supporting text
- **Body X-Small**: `text-xs leading-relaxed` - Fine print

### Special Text
- **Caption**: `text-xs font-medium uppercase tracking-wide`
- **Overline**: `text-xs font-semibold uppercase tracking-wider`

## 📐 Spacing System

### Padding
- **Extra Small**: `p-2` (8px)
- **Small**: `p-4` (16px)
- **Medium**: `p-6` (24px) - Default card padding
- **Large**: `p-8` (32px)
- **Extra Large**: `p-12` (48px)

### Margins
- **Extra Small**: `m-2` (8px)
- **Small**: `m-4` (16px)
- **Medium**: `m-6` (24px)
- **Large**: `m-8` (32px)
- **Extra Large**: `m-12` (48px)

### Gaps
- **Extra Small**: `gap-2` (8px)
- **Small**: `gap-4` (16px)
- **Medium**: `gap-6` (24px)
- **Large**: `gap-8` (32px)

## 🧩 Component Styles

### Buttons
```javascript
// Base button classes
const button = {
  base: 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
  secondary: 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500',
  ghost: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-gray-500'
}

// Button sizes
const buttonSizes = {
  small: 'px-3 py-1.5 text-sm',
  medium: 'px-4 py-2 text-base',
  large: 'px-6 py-3 text-lg'
}
```

### Cards
```javascript
const card = {
  base: 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-all duration-200',
  hover: 'hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-700',
  padding: 'p-6'
}
```

### Form Elements
```javascript
const input = {
  base: 'w-full px-4 py-2 border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors',
  error: 'border-red-300 dark:border-red-600 focus:ring-red-500'
}
```

### Navigation
```javascript
const nav = {
  link: 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors',
  activeLink: 'text-gray-900 dark:text-white font-medium'
}
```

## 🎭 Gradients

### Primary Gradient
- **Brand Gradient**: `bg-gradient-to-r from-blue-600 to-purple-600`
- **Light Background**: `bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950`
- **Hero Background**: `bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800`

## 📱 Layout Constants

### Container & Max Width
- **Container**: `container mx-auto px-4`
- **Max Width**: `max-w-7xl mx-auto`
- **Section Spacing**: `py-12 lg:py-20`

### Grid Systems
- **Responsive Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Sidebar Layout**: `grid grid-cols-12 gap-8`

## ✨ Animations & Transitions

### Standard Transitions
- **Fast**: `transition-all duration-200`
- **Medium**: `transition-all duration-300`
- **Hover Scale**: `hover:scale-105 transition-transform duration-200`

## 📋 Usage Guidelines

### 1. Consistent Color Usage
- Use `colors.neutral.textPrimary` for all main headings
- Use `colors.neutral.textSecondary` for navigation and body text
- Use `colors.neutral.textTertiary` for supporting information
- Use `colors.primary.text` for interactive elements and accents

### 2. Typography Hierarchy
- H1 for page titles and hero headings
- H3-H4 for section headings
- H5 for card titles and component headings
- Body text should use consistent line-height with `leading-relaxed`

### 3. Spacing Consistency
- Use the predefined spacing system rather than arbitrary values
- Maintain consistent padding within similar component types
- Use `gap` utilities for flex and grid layouts

### 4. Component Composition
- Build complex components from the base design system tokens
- Extend components with additional classes rather than overriding base styles
- Use the `combineClasses` helper function for dynamic class composition

### 5. Dark Mode Support
- All components include both light and dark mode variants
- Test components in both themes during development
- Use semantic color names rather than specific color values

## 🔧 Implementation Example

```javascript
import { colors, typography, components, layout } from '../utils/designSystem';

const MyComponent = () => {
  return (
    <div className={`${layout.container} ${layout.section}`}>
      <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-6`}>
        Section Title
      </h2>
      <div className={`${components.card.base} ${components.card.padding}`}>
        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
          Card content goes here
        </p>
        <button className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium} mt-4`}>
          Action Button
        </button>
      </div>
    </div>
  );
};
```

This design system ensures that all components maintain visual consistency while being flexible enough to accommodate various design needs throughout the application.
