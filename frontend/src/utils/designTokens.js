/**
 * Design Tokens Utility
 *
 * Centralized theme classes and design patterns for consistent styling across the application.
 * Exports reusable design patterns following Tailwind CSS conventions with dark mode support
 * via CSS variables (--theme-*).
 *
 * Usage:
 *   import { components, patterns, spacing } from '../../utils/designTokens'
 *   const cardClass = components.card
 *   const inputClass = getInputClasses({ type: 'input', error: true })
 *
 * @module designTokens
 */

/**
 * Background color tokens
 * @type {Object}
 */
export const backgrounds = {
  primary: 'bg-light dark:bg-primary',
  card: 'bg-card dark:bg-card-dark',
  input: 'bg-white dark:bg-input-dark',
  inputFocus: 'bg-white dark:bg-input-dark focus:ring-accent',
  select: 'bg-white dark:bg-select-dark'
}

/**
 * Text color tokens
 * @type {Object}
 */
export const text = {
  primary: 'theme-text',
  secondary: 'theme-text-secondary',
  muted: 'theme-text-muted'
}

/**
 * Border color tokens
 * @type {Object}
 */
export const borders = {
  default: 'border-primary/10 dark:border-light/10',
  light: 'border-gray-200 dark:border-gray-700',
  medium: 'border-gray-300 dark:border-gray-600'
}

/**
 * Component styling presets
 * @type {Object}
 */
export const components = {
  card: 'theme-card rounded-lg border theme-border',
  input: 'px-3 py-2 border theme-border rounded-lg text-sm theme-text theme-input focus:outline-none focus:ring-2 focus:ring-accent',
  inputSmall: 'px-2 py-1 border theme-border rounded text-xs theme-text theme-input focus:outline-none focus:ring-1 focus:ring-accent',
  textarea: 'px-3 py-2 border theme-border rounded-lg text-sm theme-text theme-input focus:outline-none focus:ring-2 focus:ring-accent resize-none',
  label: 'block text-sm font-medium theme-text mb-2',
  labelSmall: 'block text-xs font-medium theme-text-secondary mb-1',
  select: 'px-3 py-2 border theme-border rounded-lg text-sm theme-text theme-input focus:outline-none focus:ring-2 focus:ring-accent cursor-pointer',
  buttonPrimary: 'px-4 py-2 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
  buttonSecondary: 'px-4 py-2 border border-accent text-accent rounded-lg font-medium hover:bg-accent/10 transition-colors focus:outline-none focus:ring-2 focus:ring-accent/50',
  buttonSmall: 'px-2 py-1 text-sm bg-accent text-white rounded font-medium hover:bg-accent/90 transition-colors'
}

/**
 * Spacing scale tokens
 * @type {Object}
 */
export const spacing = {
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
}

/**
 * Border radius tokens
 * @type {Object}
 */
export const radius = {
  sm: 'rounded',
  md: 'rounded-lg',
  lg: 'rounded-xl',
  full: 'rounded-full'
}

/**
 * Shadow tokens
 * @type {Object}
 */
export const shadows = {
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
  xl: 'shadow-xl',
  modal: 'shadow-2xl'
}

/**
 * Common design patterns
 * @type {Object}
 */
export const patterns = {
  sectionHeader: 'text-2xl font-bold theme-text mb-4',
  subsectionHeader: 'text-lg font-semibold theme-text mb-3',
  formGroup: 'mb-4',
  cardGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4',
  modalBackdrop: 'fixed inset-0 bg-black/50 dark:bg-black/70 z-40',
  modalContent: 'relative bg-white dark:bg-primary rounded-lg shadow-2xl p-6 max-h-[90vh] overflow-y-auto',
  flexCenter: 'flex items-center justify-center',
  flexBetween: 'flex items-center justify-between',
  loadingText: 'text-center text-sm theme-text-secondary',
  emptyState: 'text-center py-12 text-theme-text-secondary',
  badge: {
    success: 'inline-block px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    warning: 'inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    error: 'inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
    info: 'inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
  },
  divider: 'border-t theme-border my-4',
  link: 'text-accent hover:text-accent/80 transition-colors underline',
  focusRing: 'focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-2 dark:focus:ring-offset-primary'
}

/**
 * Combine multiple class groups into a single string
 * Useful for conditional styling and merging design tokens
 *
 * @param {...string} classes - Variable number of class strings to combine
 * @returns {string} Combined class string
 * @example
 * combineClasses(components.card, 'hover:shadow-lg', error && 'ring-2 ring-red-500')
 */
export const combineClasses = (...classes) => {
  return classes.filter(Boolean).join(' ')
}

/**
 * Get card styling classes with customization options
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.padding='md'] - Padding size: 'sm', 'md', 'lg'
 * @param {boolean} [options.border=true] - Include border
 * @param {string} [options.radius='md'] - Border radius: 'sm', 'md', 'lg', 'full'
 * @param {boolean} [options.shadow=true] - Include shadow effect
 * @returns {string} Combined card classes
 * @example
 * getCardClasses({ padding: 'lg', border: true, shadow: true })
 */
export const getCardClasses = (options = {}) => {
  const { padding = 'md', border = true, radius = 'md', shadow = true } = options
  const classes = ['theme-card', spacing[padding] || spacing.md, radius[radius] || radius.md]

  if (border) classes.push('border theme-border')
  if (shadow) classes.push('shadow-md')

  return combineClasses(...classes)
}

/**
 * Get input styling classes with customization options
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.type='input'] - Input type: 'input', 'textarea', 'select', 'small'
 * @param {boolean} [options.error=false] - Show error styling
 * @param {boolean} [options.disabled=false] - Disabled state
 * @returns {string} Combined input classes
 * @example
 * getInputClasses({ type: 'textarea', error: true })
 */
export const getInputClasses = (options = {}) => {
  const { type = 'input', error = false, success = false, disabled = false } = options

  let baseClass = components[type] || components.input

  if (error) {
    baseClass = combineClasses(baseClass, 'border-red-500 dark:border-red-400 focus:ring-red-500 bg-red-50 dark:bg-red-950/20 focus:bg-red-50 dark:focus:bg-red-950/30')
  } else if (success) {
    baseClass = combineClasses(baseClass, 'border-green-500 dark:border-green-400 focus:ring-green-500 bg-green-50 dark:bg-green-950/20 focus:bg-green-50 dark:focus:bg-green-950/30')
  }

  if (disabled) {
    baseClass = combineClasses(baseClass, 'opacity-50 cursor-not-allowed')
  }

  return baseClass
}

/**
 * Get button styling classes with customization options
 *
 * @param {Object} options - Configuration options
 * @param {string} [options.variant='primary'] - Button variant: 'primary', 'secondary', 'small'
 * @param {boolean} [options.disabled=false] - Disabled state
 * @param {string} [options.size='md'] - Button size: 'sm', 'md', 'lg'
 * @returns {string} Combined button classes
 * @example
 * getButtonClasses({ variant: 'secondary', disabled: false })
 */
export const getButtonClasses = (options = {}) => {
  const { variant = 'primary', disabled = false } = options

  let baseClass = components[`button${variant.charAt(0).toUpperCase()}${variant.slice(1)}`] || components.buttonPrimary

  if (disabled) {
    baseClass = combineClasses(baseClass, 'opacity-50 cursor-not-allowed')
  }

  return baseClass
}

export default {
  backgrounds,
  text,
  borders,
  components,
  spacing,
  radius,
  shadows,
  patterns,
  combineClasses,
  getCardClasses,
  getInputClasses,
  getButtonClasses
}
