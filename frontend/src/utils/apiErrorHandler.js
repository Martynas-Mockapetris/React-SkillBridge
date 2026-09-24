import { logger } from '../utils/logger'

/**
 * API Error Handler Utility
 *
 * Maps API error responses to user-friendly messages and integrates with logging
 * for better error tracking and debugging. Provides standardized error handling
 * across all API interactions.
 *
 * @module apiErrorHandler
 */

/**
 * HTTP Status Codes and Their User-Friendly Messages
 */
const STATUS_MESSAGES = {
  // 1xx Informational
  100: 'Continue',
  101: 'Switching Protocols',

  // 2xx Success
  200: 'Success',
  201: 'Created',
  202: 'Accepted',
  204: 'No Content',

  // 3xx Redirection
  300: 'Multiple Choices',
  301: 'Moved Permanently',
  302: 'Found',
  304: 'Not Modified',
  307: 'Temporary Redirect',

  // 4xx Client Errors
  400: 'Bad Request - Please check your input',
  401: 'Your session has expired. Please log in again',
  402: 'Payment Required',
  403: 'You do not have permission to perform this action',
  404: 'The requested resource was not found',
  405: 'Method Not Allowed',
  408: 'Request Timeout - Please try again',
  409: 'This item already exists',
  410: 'The requested resource is no longer available',
  413: 'File is too large',
  414: 'URL is too long',
  415: 'Unsupported file format',
  416: 'Range Not Satisfiable',
  418: "I'm a teapot",
  422: 'Validation Failed - Please check your input',
  429: 'Too many requests - Please wait before trying again',

  // 5xx Server Errors
  500: 'Server Error - Please try again later',
  501: 'Not Implemented',
  502: 'Bad Gateway - Connection issue',
  503: 'Service Unavailable - Please try again later',
  504: 'Gateway Timeout - Please try again later',
  505: 'HTTP Version Not Supported'
}

/**
 * Error Type Mapping
 * Maps error types to appropriate user messages
 */
const ERROR_TYPES = {
  VALIDATION_ERROR: {
    status: 422,
    message: 'Please check the information you entered and try again'
  },
  AUTHENTICATION_ERROR: {
    status: 401,
    message: 'Please log in to continue'
  },
  AUTHORIZATION_ERROR: {
    status: 403,
    message: 'You do not have permission to perform this action'
  },
  NOT_FOUND_ERROR: {
    status: 404,
    message: 'The requested item could not be found'
  },
  CONFLICT_ERROR: {
    status: 409,
    message: 'This item already exists'
  },
  RATE_LIMIT_ERROR: {
    status: 429,
    message: 'Too many requests. Please wait before trying again'
  },
  SERVER_ERROR: {
    status: 500,
    message: 'Something went wrong. Please try again later'
  },
  NETWORK_ERROR: {
    status: 0,
    message: 'Network connection error. Please check your connection'
  },
  TIMEOUT_ERROR: {
    status: 408,
    message: 'Request took too long. Please try again'
  },
  UNKNOWN_ERROR: {
    status: 0,
    message: 'An unexpected error occurred. Please try again'
  }
}

/**
 * Get user-friendly error message from status code
 *
 * @param {number} statusCode - HTTP status code
 * @returns {string} User-friendly error message
 *
 * @example
 * const message = getStatusMessage(404)
 * // Returns: "The requested resource was not found"
 */
export const getStatusMessage = (statusCode) => {
  return STATUS_MESSAGES[statusCode] || STATUS_MESSAGES[500]
}

/**
 * Extract field-specific validation errors
 *
 * Handles various API error formats:
 * - { fieldName: 'error message' }
 * - { errors: { fieldName: 'error message' } }
 * - { details: [...{ field, message }] }
 *
 * @param {Object} errorData - Error response data from API
 * @returns {Object} Normalized field errors { fieldName: 'error' }
 *
 * @example
 * const errors = extractValidationErrors(response.data)
 * // Returns: { email: 'Invalid email format', password: 'Too short' }
 */
export const extractValidationErrors = (errorData) => {
  if (!errorData) return {}

  // Handle { fieldName: 'error' } format
  if (errorData.errors && typeof errorData.errors === 'object') {
    return errorData.errors
  }

  // Handle { details: [{field, message}] } format
  if (Array.isArray(errorData.details)) {
    return errorData.details.reduce((acc, err) => {
      acc[err.field || err.fieldName] = err.message
      return acc
    }, {})
  }

  // Handle flat { fieldName: 'error' } format
  return errorData
}

/**
 * Parse API error response and extract relevant information
 *
 * @param {Object} error - Axios error or Error object
 * @param {Object} options - Additional options
 * @param {boolean} [options.includeDetails=false] - Include full error details
 * @param {string} [options.context] - Contextual info about the operation
 * @returns {Object} Parsed error with message and details
 *
 * @typedef {Object} ParsedError
 * @property {string} message - User-friendly error message
 * @property {number} statusCode - HTTP status code
 * @property {string} type - Error type (VALIDATION_ERROR, AUTHENTICATION_ERROR, etc)
 * @property {Object} [details] - Detailed error information (if includeDetails=true)
 * @property {Object} [validationErrors] - Field-specific validation errors
 * @property {string} [timestamp] - Error occurrence time
 *
 * @example
 * try {
 *   await submitForm(data)
 * } catch (error) {
 *   const parsed = parseError(error, { context: 'form submission' })
 *   console.error(parsed.message)  // User-friendly message
 *   showErrorToast(parsed.message)
 * }
 */
export const parseError = (error, options = {}) => {
  const { includeDetails = false, context = '' } = options

  const result = {
    message: '',
    statusCode: 0,
    type: 'UNKNOWN_ERROR',
    timestamp: new Date().toISOString()
  }

  try {
    // Handle Axios error
    if (error.response) {
      const { status, data } = error.response

      result.statusCode = status
      result.message = data?.message || getStatusMessage(status)

      // Map common error types
      if (status === 401) {
        result.type = 'AUTHENTICATION_ERROR'
      } else if (status === 403) {
        result.type = 'AUTHORIZATION_ERROR'
      } else if (status === 404) {
        result.type = 'NOT_FOUND_ERROR'
      } else if (status === 409) {
        result.type = 'CONFLICT_ERROR'
      } else if (status === 422) {
        result.type = 'VALIDATION_ERROR'
        result.validationErrors = extractValidationErrors(data)
      } else if (status === 429) {
        result.type = 'RATE_LIMIT_ERROR'
      } else if (status >= 500) {
        result.type = 'SERVER_ERROR'
      }

      if (includeDetails) {
        result.details = {
          status,
          statusText: error.response.statusText,
          data: data,
          headers: error.response.headers
        }
      }
    }
    // Handle timeout
    else if (error.code === 'ECONNABORTED') {
      result.statusCode = 408
      result.type = 'TIMEOUT_ERROR'
      result.message = 'Request timeout - Please try again'
    }
    // Handle network error
    else if (!error.response && error.message === 'Network Error') {
      result.statusCode = 0
      result.type = 'NETWORK_ERROR'
      result.message = 'Unable to connect - Please check your internet connection'
    }
    // Handle generic error
    else if (error.message) {
      result.message = error.message
    }
  } catch (parseErr) {
    logger.error('[API_ERROR_HANDLER] Error parsing error response:', parseErr)
    result.message = 'An unexpected error occurred'
  }

  // Log for debugging
  logger.error(`[API_ERROR] ${context}`, {
    type: result.type,
    statusCode: result.statusCode,
    message: result.message
  })

  return result
}

/**
 * Handle API error and log it with context
 *
 * @param {Object} error - Error object
 * @param {Object} options - Handler options
 * @param {string} [options.context='API Error'] - Context description
 * @param {Function} [options.onError] - Custom error handler callback
 * @param {boolean} [options.throwError=true] - Whether to re-throw after handling
 * @param {Object} [options.fallback] - Fallback error message
 * @returns {Object} Parsed error details
 *
 * @example
 * try {
 *   await api.deleteProject(id)
 * } catch (error) {
 *   const errorInfo = handleError(error, {
 *     context: 'Project Deletion',
 *     fallback: { message: 'Failed to delete project' }
 *   })
 *   // errorInfo can be shown to user
 * }
 */
export const handleError = (error, options = {}) => {
  const { context = 'API Error', onError, throwError = true, fallback } = options

  const parsed = parseError(error, { context, includeDetails: true })

  // Use fallback message if provided and main message unavailable
  if (fallback && !parsed.message) {
    parsed.message = fallback.message
  }

  // Log with full context
  logger.error(`[API_HANDLER] ${context}:`, {
    type: parsed.type,
    statusCode: parsed.statusCode,
    message: parsed.message,
    validationErrors: parsed.validationErrors,
    details: parsed.details
  })

  // Call custom error handler if provided
  if (onError && typeof onError === 'function') {
    try {
      onError(parsed)
    } catch (handlerErr) {
      logger.error('[API_HANDLER] Error in custom handler:', handlerErr)
    }
  }

  // Re-throw if requested
  if (throwError) {
    throw parsed
  }

  return parsed
}

/**
 * Safe API call wrapper with automatic error handling
 *
 * Wraps API calls with consistent error handling and logging
 *
 * @param {Function} apiCall - Async API call function
 * @param {Object} options - Handler options (see handleError)
 * @returns {Promise} Result of API call
 *
 * @example
 * const data = await safeApiCall(
 *   () => api.getProjects(),
 *   { context: 'Fetch Projects' }
 * )
 */
export const safeApiCall = async (apiCall, options = {}) => {
  try {
    return await apiCall()
  } catch (error) {
    return handleError(error, { ...options, throwError: options.throwError !== false })
  }
}

/**
 * Map specific error responses to actions (e.g., logout on 401)
 *
 * @param {Object} error - Parsed error object
 * @param {Object} actions - Action handlers by type
 * @param {Function} [actions.AUTHENTICATION_ERROR] - Handle auth errors
 * @param {Function} [actions.SERVER_ERROR] - Handle server errors
 * @returns {void}
 *
 * @example
 * mapErrorToAction(parsedError, {
 *   AUTHENTICATION_ERROR: () => logout(),
 *   AUTHORIZATION_ERROR: () => redirect('/403'),
 *   SERVER_ERROR: () => reportError(error)
 * })
 */
export const mapErrorToAction = (error, actions = {}) => {
  if (!error || !error.type) return

  const handler = actions[error.type]
  if (handler && typeof handler === 'function') {
    try {
      handler(error)
    } catch (err) {
      logger.error('[ERROR_MAPPER] Error in action handler:', err)
    }
  }
}

/**
 * Default export with all error handling functions
 */
const apiErrorHandler = {
  getStatusMessage,
  extractValidationErrors,
  parseError,
  handleError,
  safeApiCall,
  mapErrorToAction,
  ERROR_TYPES,
  STATUS_MESSAGES
}

export default apiErrorHandler
