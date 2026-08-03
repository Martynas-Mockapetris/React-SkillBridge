import { useState, useCallback } from 'react'
import { validateFormData } from '../utils/formValidation'

/**
 * Custom Hook for Reusable Form State Management
 *
 * Combines form state, validation, submission, and reset logic into a single hook.
 * Handles form data, error tracking, loading states, and provides helper methods
 * for common form operations.
 *
 * @param {Object} initialData - Initial form data object
 * @param {Function} onSubmit - Async callback function to execute on form submission
 * @param {Object} validationSchema - Schema for form validation
 * @returns {Object} Form state and handler methods
 *
 * @example
 * const { formData, errors, isLoading, handleChange, handleSubmit, resetForm } = useFormHandling(
 *   { email: '', password: '' },
 *   async (data) => await submitForm(data),
 *   { email: 'email', password: 'password' }
 * )
 *
 * @typedef {Object} FormHandlingState
 * @property {Object} formData - Current form data
 * @property {Object} errors - Validation errors by field
 * @property {boolean} isLoading - Loading state during submission
 * @property {string|null} generalError - General form error message
 * @property {string|null} successMessage - Success message after submission
 * @property {Function} handleChange - Input change handler
 * @property {Function} handleBlur - Input blur handler for validation
 * @property {Function} handleSubmit - Form submission handler
 * @property {Function} resetForm - Reset form to initial state
 * @property {Function} setFieldError - Set error for specific field
 * @property {Function} setFieldValue - Set value for specific field
 * @property {Function} clearErrors - Clear all validation errors
 * @property {Function} setGeneralError - Set general form error message
 * @property {Function} setSuccessMessage - Set success message
 */
const useFormHandling = (initialData = {}, onSubmit, validationSchema = {}) => {
  const [formData, setFormData] = useState(initialData)
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [generalError, setGeneralError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  /**
   * Handle input change and clear field error
   * @param {Event} e - Change event from input/textarea/select
   */
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev }
        delete updated[name]
        return updated
      })
    }

    // Clear general error when user makes changes
    if (generalError) {
      setGeneralError(null)
    }
  }, [errors, generalError])

  /**
   * Handle input blur for validation
   * @param {Event} e - Blur event from input
   */
  const handleBlur = useCallback((e) => {
    const { name, value } = e.target

    // Only validate if schema is provided for this field
    if (validationSchema[name]) {
      const fieldSchema = validationSchema[name]
      const { type, options } = typeof fieldSchema === 'string' ? { type: fieldSchema, options: {} } : fieldSchema

      // Import validateField here to avoid circular dependencies
      import('../utils/formValidation').then(({ validateField }) => {
        const { isValid, error } = validateField(type, value, options)
        if (!isValid) {
          setErrors((prev) => ({ ...prev, [name]: error }))
        }
      })
    }
  }, [validationSchema])

  /**
   * Validate entire form using schema
   * @returns {boolean} True if all fields are valid
   */
  const validateForm = useCallback(() => {
    if (Object.keys(validationSchema).length === 0) {
      return true // No validation schema provided
    }

    const validationErrors = validateFormData(formData, validationSchema)
    const hasErrors = Object.values(validationErrors).some((error) => error !== null)

    if (hasErrors) {
      setErrors(validationErrors)
    }

    return !hasErrors
  }, [formData, validationSchema])

  /**
   * Handle form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = useCallback(
    async (e) => {
      e?.preventDefault?.()

      // Validate before submission
      if (!validateForm()) {
        setGeneralError('Please fix the errors above and try again.')
        return
      }

      try {
        setIsLoading(true)
        setGeneralError(null)
        setSuccessMessage(null)

        // Call the provided submit callback
        if (onSubmit) {
          await onSubmit(formData)
          setSuccessMessage('Form submitted successfully!')
        }
      } catch (error) {
        setGeneralError(error.message || 'An error occurred. Please try again.')
      } finally {
        setIsLoading(false)
      }
    },
    [formData, validateForm, onSubmit]
  )

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(initialData)
    setErrors({})
    setGeneralError(null)
    setSuccessMessage(null)
  }, [initialData])

  /**
   * Set error for a specific field
   * @param {string} fieldName - Field name
   * @param {string} error - Error message
   */
  const setFieldError = useCallback((fieldName, error) => {
    setErrors((prev) => ({
      ...prev,
      [fieldName]: error
    }))
  }, [])

  /**
   * Set value for a specific field
   * @param {string} fieldName - Field name
   * @param {*} value - Field value
   */
  const setFieldValue = useCallback((fieldName, value) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value
    }))
  }, [])

  /**
   * Clear all validation errors
   */
  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  return {
    // State
    formData,
    errors,
    isLoading,
    generalError,
    successMessage,

    // Handlers
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,

    // Utility methods
    setFieldError,
    setFieldValue,
    clearErrors,
    setGeneralError,
    setSuccessMessage,

    // Internal method (mainly for testing)
    validateForm
  }
}

export default useFormHandling
