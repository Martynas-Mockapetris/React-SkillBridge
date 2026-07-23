import { toast } from 'react-toastify'

/**
 * Toast notification helper with consistent styling and timing
 * Replaces hardcoded alert() and console messages with professional toast notifications
 */

const TOAST_CONFIG = {
  position: 'top-right',
  autoClose: 4000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true
}

/**
 * Show success toast notification
 * @param {string} message - Success message to display
 * @param {object} options - Optional config overrides
 */
export const showSuccessToast = (message, options = {}) => {
  toast.success(message, {
    ...TOAST_CONFIG,
    className: 'toast-success',
    ...options
  })
}

/**
 * Show error toast notification
 * @param {string} message - Error message to display
 * @param {object} options - Optional config overrides
 */
export const showErrorToast = (message, options = {}) => {
  toast.error(message, {
    ...TOAST_CONFIG,
    className: 'toast-error',
    autoClose: 5000, // Errors stay longer
    ...options
  })
}

/**
 * Show warning toast notification
 * @param {string} message - Warning message to display
 * @param {object} options - Optional config overrides
 */
export const showWarningToast = (message, options = {}) => {
  toast.warning(message, {
    ...TOAST_CONFIG,
    className: 'toast-warning',
    autoClose: 4500,
    ...options
  })
}

/**
 * Show info toast notification
 * @param {string} message - Info message to display
 * @param {object} options - Optional config overrides
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(message, {
    ...TOAST_CONFIG,
    className: 'toast-info',
    ...options
  })
}

/**
 * Show loading toast notification (typically dismissed by success/error)
 * @param {string} message - Loading message to display
 * @param {object} options - Optional config overrides
 * @returns {number} toastId - Use to update or remove the toast
 */
export const showLoadingToast = (message, options = {}) => {
  return toast.loading(message, {
    ...TOAST_CONFIG,
    className: 'toast-loading',
    autoClose: false, // Don't auto-close for loading
    ...options
  })
}

/**
 * Update an existing toast (commonly used with loading toasts)
 * @param {number} toastId - The ID of the toast to update
 * @param {object} options - Update options (message, type, etc)
 */
export const updateToast = (toastId, options = {}) => {
  toast.update(toastId, {
    ...TOAST_CONFIG,
    ...options
  })
}

/**
 * Dismiss a specific toast or all toasts
 * @param {number|string} toastId - Toast ID to dismiss, or undefined to dismiss all
 */
export const dismissToast = (toastId) => {
  if (toastId !== undefined) {
    toast.dismiss(toastId)
  } else {
    toast.dismiss()
  }
}

/**
 * Promise-based toast for async operations
 * @param {Promise} promise - The async operation
 * @param {object} messages - { pending, success, error } messages
 * @param {object} options - Optional config overrides
 */
export const toastPromise = (promise, messages, options = {}) => {
  return toast.promise(promise, {
    pending: {
      render: messages.pending || 'Loading...',
      icon: '⏳'
    },
    success: {
      render: messages.success || 'Success!',
      icon: '✅'
    },
    error: {
      render: messages.error || 'Error occurred',
      icon: '❌'
    },
    ...options
  })
}

export default {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  loading: showLoadingToast,
  update: updateToast,
  dismiss: dismissToast,
  promise: toastPromise
}
