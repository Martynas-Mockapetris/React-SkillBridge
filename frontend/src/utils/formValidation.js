/**
 * Form Validation Utilities
 *
 * Reusable validation functions for common form fields with customizable options.
 * Supports individual field validation, bulk form validation, and both sync/async patterns.
 *
 * Usage:
 *   import { validateField, validateFormData } from '../../utils/formValidation'
 *   const { isValid, error } = validateField('email', value)
 *   const errors = validateFormData(formData, { email: 'email', password: 'password' })
 *
 * @module formValidation
 */

/**
 * Common validation patterns
 * @type {Object}
 */
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/[\w-]*)*\/?$/,
  phone: /^\d{7,}$/,
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /\d/,
  special: /[!@#$%^&*()_+=\[\]{};':"\\|,.<>/?-]/,
  username: /^[a-zA-Z0-9_]{3,20}$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
}

/**
 * Validate email format
 *
 * @param {string} email - Email address to validate
 * @returns {boolean} True if email is valid
 * @example
 * isValidEmail('user@example.com') // true
 */
export const isValidEmail = (email) => {
  return patterns.email.test(String(email).toLowerCase())
}

/**
 * Validate URL format
 *
 * @param {string} url - URL to validate
 * @returns {boolean} True if URL is valid
 * @example
 * isValidUrl('https://example.com') // true
 */
export const isValidUrl = (url) => {
  return patterns.url.test(String(url))
}

/**
 * Validate phone number format
 *
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if phone is valid (7+ digits)
 * @example
 * isValidPhone('1234567890') // true
 */
export const isValidPhone = (phone) => {
  return patterns.phone.test(String(phone).replace(/\D/g, ''))
}

/**
 * Validate password strength with customizable requirements
 *
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options
 * @param {number} [options.minLength=8] - Minimum password length
 * @param {boolean} [options.requireUppercase=true] - Require uppercase letters
 * @param {boolean} [options.requireLowercase=true] - Require lowercase letters
 * @param {boolean} [options.requireNumber=true] - Require numbers
 * @param {boolean} [options.requireSpecial=false] - Require special characters
 * @returns {Object} { isValid: boolean, errors: string[] }
 * @example
 * validatePassword('Pass123', { minLength: 6, requireNumber: true })
 */
export const validatePassword = (password, options = {}) => {
  const { minLength = 8, requireUppercase = true, requireLowercase = true, requireNumber = true, requireSpecial = false } = options

  const errors = []

  if (!password || password.length < minLength) {
    errors.push(`Password must be at least ${minLength} characters`)
  }

  if (requireUppercase && !patterns.uppercase.test(password)) {
    errors.push('Password must include uppercase letters')
  }

  if (requireLowercase && !patterns.lowercase.test(password)) {
    errors.push('Password must include lowercase letters')
  }

  if (requireNumber && !patterns.number.test(password)) {
    errors.push('Password must include numbers')
  }

  if (requireSpecial && !patterns.special.test(password)) {
    errors.push('Password must include special characters')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validate required field with optional length constraints
 *
 * @param {*} value - Value to validate
 * @param {Object} options - Validation options
 * @param {number} [options.minLength] - Minimum string length
 * @param {number} [options.maxLength] - Maximum string length
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateRequired('John', { minLength: 2, maxLength: 50 })
 */
export const validateRequired = (value, options = {}) => {
  const { minLength, maxLength } = options

  if (!value || (typeof value === 'string' && !value.trim())) {
    return { isValid: false, error: 'This field is required' }
  }

  if (minLength && value.length < minLength) {
    return { isValid: false, error: `Must be at least ${minLength} characters` }
  }

  if (maxLength && value.length > maxLength) {
    return { isValid: false, error: `Must not exceed ${maxLength} characters` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate email field with custom error message
 *
 * @param {string} email - Email to validate
 * @param {Object} options - Validation options
 * @param {boolean} [options.required=true] - Email is required
 * @param {string} [options.message='Invalid email address'] - Custom error message
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateEmail('user@example.com', { required: true })
 */
export const validateEmail = (email, options = {}) => {
  const { required = true, message = 'Invalid email address' } = options

  if (!email && !required) {
    return { isValid: true, error: null }
  }

  if (!email && required) {
    return { isValid: false, error: 'Email is required' }
  }

  if (!isValidEmail(email)) {
    return { isValid: false, error: message }
  }

  return { isValid: true, error: null }
}

/**
 * Validate password field
 *
 * @param {string} password - Password to validate
 * @param {Object} options - Validation options (inherits validatePassword options)
 * @param {boolean} [options.required=true] - Password is required
 * @param {number} [options.minLength=8] - Minimum length
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validatePasswordField('Pass123', { required: true, minLength: 8 })
 */
export const validatePasswordField = (password, options = {}) => {
  const { required = true, ...passwordOptions } = options

  if (!password && !required) {
    return { isValid: true, error: null }
  }

  if (!password && required) {
    return { isValid: false, error: 'Password is required' }
  }

  const { isValid, errors } = validatePassword(password, passwordOptions)
  return { isValid, error: errors[0] || null }
}

/**
 * Validate matching fields (e.g., password confirmation)
 *
 * @param {*} value1 - First value to compare
 * @param {*} value2 - Second value to compare
 * @param {Object} options - Validation options
 * @param {string} [options.fieldName='Fields'] - Display name for error message
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateMatch(password, confirmPassword, { fieldName: 'Passwords' })
 */
export const validateMatch = (value1, value2, options = {}) => {
  const { fieldName = 'Fields' } = options

  if (value1 !== value2) {
    return { isValid: false, error: `${fieldName} do not match` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate URL field
 *
 * @param {string} url - URL to validate
 * @param {Object} options - Validation options
 * @param {boolean} [options.required=false] - URL is required
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateUrlField('https://example.com', { required: true })
 */
export const validateUrlField = (url, options = {}) => {
  const { required = false } = options

  if (!url && !required) {
    return { isValid: true, error: null }
  }

  if (!url && required) {
    return { isValid: false, error: 'URL is required' }
  }

  if (!isValidUrl(url)) {
    return { isValid: false, error: 'Invalid URL format' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate phone field
 *
 * @param {string} phone - Phone number to validate
 * @param {Object} options - Validation options
 * @param {boolean} [options.required=false] - Phone is required
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validatePhoneField('+1234567890', { required: true })
 */
export const validatePhoneField = (phone, options = {}) => {
  const { required = false } = options

  if (!phone && !required) {
    return { isValid: true, error: null }
  }

  if (!phone && required) {
    return { isValid: false, error: 'Phone number is required' }
  }

  if (!isValidPhone(phone)) {
    return { isValid: false, error: 'Invalid phone number' }
  }

  return { isValid: true, error: null }
}

/**
 * Validate number with optional bounds
 *
 * @param {number} value - Number to validate
 * @param {Object} options - Validation options
 * @param {number} [options.min] - Minimum value (inclusive)
 * @param {number} [options.max] - Maximum value (inclusive)
 * @param {boolean} [options.required=false] - Number is required
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateNumber(50, { min: 0, max: 100 })
 */
export const validateNumber = (value, options = {}) => {
  const { min, max, required = false } = options

  if ((value === null || value === undefined || value === '') && !required) {
    return { isValid: true, error: null }
  }

  if ((value === null || value === undefined || value === '') && required) {
    return { isValid: false, error: 'This field is required' }
  }

  const num = Number(value)
  if (isNaN(num)) {
    return { isValid: false, error: 'Must be a valid number' }
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `Must be at least ${min}` }
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `Must not exceed ${max}` }
  }

  return { isValid: true, error: null }
}

/**
 * Validate file upload
 *
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @param {string[]} [options.allowedTypes=['image/jpeg','image/png']] - Allowed MIME types
 * @param {number} [options.maxSize=5242880] - Maximum file size in bytes (default 5MB)
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateFile(file, { allowedTypes: ['image/*'], maxSize: 2097152 })
 */
export const validateFile = (file, options = {}) => {
  const { allowedTypes = ['image/jpeg', 'image/png'], maxSize = 5242880 } = options

  if (!file) {
    return { isValid: false, error: 'File is required' }
  }

  if (file.size > maxSize) {
    return { isValid: false, error: `File size must not exceed ${maxSize / 1048576}MB` }
  }

  const typeMatch = allowedTypes.some((type) => {
    if (type.includes('*')) {
      const [category] = type.split('/')
      return file.type.startsWith(category)
    }
    return file.type === type
  })

  if (!typeMatch) {
    return { isValid: false, error: `File type not allowed. Accepted types: ${allowedTypes.join(', ')}` }
  }

  return { isValid: true, error: null }
}

/**
 * Dispatcher function for validating any field type
 *
 * @param {string} fieldType - Type of field ('email', 'password', 'required', 'url', 'phone', 'number', 'file')
 * @param {*} value - Value to validate
 * @param {Object} options - Field-specific validation options
 * @returns {Object} { isValid: boolean, error: string | null }
 * @example
 * validateField('email', 'user@example.com', { required: true })
 * validateField('password', 'Pass123', { minLength: 8 })
 * validateField('number', 50, { min: 0, max: 100 })
 */
export const validateField = (fieldType, value, options = {}) => {
  switch (fieldType) {
    case 'email':
      return validateEmail(value, options)
    case 'password':
      return validatePasswordField(value, options)
    case 'required':
      return validateRequired(value, options)
    case 'url':
      return validateUrlField(value, options)
    case 'phone':
      return validatePhoneField(value, options)
    case 'number':
      return validateNumber(value, options)
    case 'file':
      return validateFile(value, options)
    default:
      return { isValid: true, error: null }
  }
}

/**
 * Validate entire form data against schema
 *
 * @param {Object} formData - Form data object with field values
 * @param {Object} schema - Validation schema { fieldName: validationType | { type, options } }
 * @returns {Object} { fieldName: error | null } - Errors object (null = valid)
 * @example
 * validateFormData(
 *   { email: 'user@example.com', password: 'Pass123', age: 25 },
 *   { email: 'email', password: { type: 'password', options: { minLength: 8 } }, age: { type: 'number', options: { min: 18 } } }
 * )
 */
export const validateFormData = (formData, schema) => {
  const errors = {}

  Object.entries(schema).forEach(([fieldName, validation]) => {
    const value = formData[fieldName]
    const { type, options } = typeof validation === 'string' ? { type: validation, options: {} } : validation

    const { isValid, error } = validateField(type, value, options)
    errors[fieldName] = isValid ? null : error
  })

  return errors
}

export default {
  patterns,
  isValidEmail,
  isValidUrl,
  isValidPhone,
  validatePassword,
  validateRequired,
  validateEmail,
  validatePasswordField,
  validateMatch,
  validateUrlField,
  validatePhoneField,
  validateNumber,
  validateFile,
  validateField,
  validateFormData
}
