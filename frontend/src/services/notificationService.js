import { toast } from 'react-toastify'
import { logger } from './logger'

/**
 * Comprehensive Notification Service
 *
 * Consolidates all notification patterns and integrates with logging for better
 * debugging and user feedback. Handles success, error, warning, info, and loading
 * states with consistent styling and behavior across the application.
 *
 * @module notificationService
 */

const TOAST_CONFIG = {
  position: 'top-right',
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
}

/**
 * Notification types with configuration
 */
const NOTIFICATION_TYPES = {
  success: {
    className: 'toast-success',
    autoClose: 4000,
    icon: '✅'
  },
  error: {
    className: 'toast-error',
    autoClose: 5000,
    icon: '❌'
  },
  warning: {
    className: 'toast-warning',
    autoClose: 4500,
    icon: '⚠️'
  },
  info: {
    className: 'toast-info',
    autoClose: 3500,
    icon: 'ℹ️'
  },
  loading: {
    className: 'toast-loading',
    autoClose: false,
    icon: '⏳'
  },
  confirmation: {
    className: 'toast-confirmation',
    autoClose: 4000,
    icon: '❓'
  },
  validation: {
    className: 'toast-validation',
    autoClose: 4000,
    icon: '✓'
  }
}

/**
 * Show success notification
 *
 * @param {string} message - Success message to display
 * @param {Object} options - Optional config overrides
 * @param {boolean} options.log - Log to console (default: true)
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.success('Profile updated successfully!')
 */
export const showSuccess = (message, options = {}) => {
  const { log = true, ...toastOptions } = options

  if (log) {
    logger.info(`[NOTIFICATION] ${message}`)
  }

  return toast.success(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.success,
    ...toastOptions
  })
}

/**
 * Show error notification
 *
 * @param {string} message - Error message to display
 * @param {Object} options - Optional config overrides
 * @param {boolean} options.log - Log to console (default: true)
 * @param {string} options.logLevel - Logger level ('error', 'warn', 'info')
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.error('Failed to save changes', { logLevel: 'error' })
 */
export const showError = (message, options = {}) => {
  const { log = true, logLevel = 'error', ...toastOptions } = options

  if (log) {
    logger[logLevel]?.(`[NOTIFICATION] ${message}`) || logger.error(`[NOTIFICATION] ${message}`)
  }

  return toast.error(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.error,
    ...toastOptions
  })
}

/**
 * Show warning notification
 *
 * @param {string} message - Warning message to display
 * @param {Object} options - Optional config overrides
 * @param {boolean} options.log - Log to console (default: true)
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.warning('This action cannot be undone')
 */
export const showWarning = (message, options = {}) => {
  const { log = true, ...toastOptions } = options

  if (log) {
    logger.warn(`[NOTIFICATION] ${message}`)
  }

  return toast.warning(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.warning,
    ...toastOptions
  })
}

/**
 * Show info notification
 *
 * @param {string} message - Info message to display
 * @param {Object} options - Optional config overrides
 * @param {boolean} options.log - Log to console (default: false)
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.info('New updates are available')
 */
export const showInfo = (message, options = {}) => {
  const { log = false, ...toastOptions } = options

  if (log) {
    logger.info(`[NOTIFICATION] ${message}`)
  }

  return toast.info(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.info,
    ...toastOptions
  })
}

/**
 * Show loading notification
 *
 * Use with updateNotification() to change state when async operation completes
 *
 * @param {string} message - Loading message to display
 * @param {Object} options - Optional config overrides
 * @param {boolean} options.log - Log to console (default: false)
 * @returns {string|number} Toast ID - Use to update or dismiss later
 *
 * @example
 * const toastId = notificationService.loading('Saving...')
 * try {
 *   await saveData()
 *   notificationService.update(toastId, { type: 'success', message: 'Saved!' })
 * } catch (err) {
 *   notificationService.update(toastId, { type: 'error', message: 'Failed to save' })
 * }
 */
export const showLoading = (message, options = {}) => {
  const { log = false, ...toastOptions } = options

  if (log) {
    logger.debug(`[NOTIFICATION] ${message}`)
  }

  return toast.loading(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.loading,
    ...toastOptions
  })
}

/**
 * Show confirmation notification
 *
 * Typically used after user confirms an action
 *
 * @param {string} message - Confirmation message
 * @param {Object} options - Optional config overrides
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.confirmation('Changes confirmed')
 */
export const showConfirmation = (message, options = {}) => {
  const { log = false, ...toastOptions } = options

  if (log) {
    logger.info(`[NOTIFICATION] ${message}`)
  }

  return toast.success(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.confirmation,
    ...toastOptions
  })
}

/**
 * Show validation notification
 *
 * Typically used for form validation feedback
 *
 * @param {string} message - Validation message
 * @param {Object} options - Optional config overrides
 * @returns {string|number} Toast ID
 *
 * @example
 * notificationService.validation('Please check your email address')
 */
export const showValidation = (message, options = {}) => {
  const { log = false, ...toastOptions } = options

  if (log) {
    logger.debug(`[NOTIFICATION] ${message}`)
  }

  return toast.warning(message, {
    ...TOAST_CONFIG,
    ...NOTIFICATION_TYPES.validation,
    ...toastOptions
  })
}

/**
 * Update an existing notification
 *
 * Useful for changing state of loading notifications
 *
 * @param {string|number} toastId - Toast ID to update
 * @param {Object} options - Update options
 * @param {string} options.type - Notification type (success, error, warning, info, loading)
 * @param {string} options.message - New message to display
 * @param {number} options.autoClose - Auto-close time in ms
 * @param {Object} options.data - Additional data to pass
 *
 * @example
 * notificationService.update(toastId, {
 *   type: 'success',
 *   message: 'Operation completed!',
 *   autoClose: 3000
 * })
 */
export const updateNotification = (toastId, options = {}) => {
  const { type = 'info', message, ...rest } = options
  const typeConfig = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.info

  toast.update(toastId, {
    ...TOAST_CONFIG,
    ...typeConfig,
    render: message,
    ...rest
  })
}

/**
 * Dismiss a specific notification or all notifications
 *
 * @param {string|number} [toastId] - Toast ID to dismiss. If omitted, dismisses all
 *
 * @example
 * notificationService.dismiss(toastId)  // Dismiss specific
 * notificationService.dismiss()          // Dismiss all
 */
export const dismissNotification = (toastId) => {
  toast.dismiss(toastId)
}

/**
 * Promise-based notification for async operations
 *
 * Automatically shows loading → success/error based on promise result
 *
 * @param {Promise} promise - Async operation promise
 * @param {Object} messages - { pending, success, error } notification messages
 * @param {Object} options - Optional config overrides
 * @returns {Promise} Result of the promise
 *
 * @example
 * await notificationService.promise(
 *   fetch('/api/data').then(r => r.json()),
 *   {
 *     pending: 'Loading data...',
 *     success: 'Data loaded successfully!',
 *     error: 'Failed to load data'
 *   }
 * )
 */
export const promiseNotification = (promise, messages, options = {}) => {
  return toast.promise(promise, {
    pending: {
      render: messages.pending || 'Processing...',
      icon: NOTIFICATION_TYPES.loading.icon
    },
    success: {
      render: messages.success || 'Success!',
      icon: NOTIFICATION_TYPES.success.icon
    },
    error: {
      render: messages.error || 'Error occurred',
      icon: NOTIFICATION_TYPES.error.icon
    },
    ...options
  })
}

/**
 * Notify user of operation status with automatic loading state management
 *
 * Combines loading notification with success/error handling
 *
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} messages - { pending, success, error } messages
 * @param {Object} options - Optional config overrides
 * @returns {Promise} Result of async operation
 *
 * @example
 * await notificationService.async(
 *   () => saveUser(userData),
 *   {
 *     pending: 'Saving user...',
 *     success: 'User saved successfully!',
 *     error: 'Failed to save user'
 *   }
 * )
 */
export const asyncNotification = async (asyncFn, messages = {}, options = {}) => {
  const toastId = showLoading(messages.pending || 'Processing...')

  try {
    const result = await asyncFn()
    updateNotification(toastId, {
      type: 'success',
      message: messages.success || 'Success!',
      autoClose: NOTIFICATION_TYPES.success.autoClose,
      ...options
    })
    return result
  } catch (error) {
    updateNotification(toastId, {
      type: 'error',
      message: messages.error || 'Operation failed',
      autoClose: NOTIFICATION_TYPES.error.autoClose,
      ...options
    })
    throw error
  }
}

/**
 * Default export with all notification methods
 */
const notificationService = {
  // Core notification types
  success: showSuccess,
  error: showError,
  warning: showWarning,
  info: showInfo,
  loading: showLoading,
  confirmation: showConfirmation,
  validation: showValidation,

  // Management methods
  update: updateNotification,
  dismiss: dismissNotification,
  promise: promiseNotification,
  async: asyncNotification,

  // Backward compatibility with toastHelper
  dismiss: dismissNotification,
  update: updateNotification,

  // Configuration export
  NOTIFICATION_TYPES,
  TOAST_CONFIG
}

export default notificationService

// Named exports for convenience
export {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  showConfirmation,
  showValidation,
  updateNotification,
  dismissNotification,
  promiseNotification,
  asyncNotification
}
