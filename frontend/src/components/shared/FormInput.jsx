import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { validateField } from '../../utils/formValidation'
import { getInputClasses } from '../../utils/designTokens'
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi'

/**
 * Reusable Form Input Component with Validation
 *
 * Standardized input component with built-in validation, error display, and consistent styling.
 * Supports multiple input types (text, textarea, select, email, password) and integrates with
 * design tokens for theme consistency.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Field name for form submission
 * @param {string} [props.type='text'] - HTML input type
 * @param {string} [props.inputType='input'] - Component type: 'input', 'textarea', 'select'
 * @param {string} [props.label] - Field label text
 * @param {*} props.value - Current field value
 * @param {Function} props.onChange - Change handler
 * @param {Function} [props.onBlur] - Blur handler for validation
 * @param {Function} [props.onValidate] - Custom validation callback
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.success] - Show success state styling
 * @param {string} [props.placeholder] - Placeholder text
 * @param {boolean} [props.disabled=false] - Disable input
 * @param {boolean} [props.required=false] - Mark as required
 * @param {string} [props.validationType] - Auto-validation type ('email', 'password', 'url', etc.)
 * @param {Object} [props.validationOptions] - Options for validationType
 * @param {string} [props.className] - Additional input classes
 * @param {string} [props.containerClassName] - Container wrapper classes
 * @param {string} [props.labelClassName] - Label element classes
 * @param {string} [props.errorClassName] - Error message classes
 * @param {string} [props.hint] - Helper text below input
 * @param {boolean} [props.showCharCount=false] - Show character count
 * @param {number} [props.maxLength] - Maximum characters
 * @param {number} [props.rows=4] - Textarea rows (textarea type only)
 * @param {Array<Object>} [props.options] - Select options [{value, label}] (select type only)
 * @param {React.ReactNode} [props.icon] - Icon element to display
 * @param {string} [props.iconPosition='right'] - Icon position: 'left' or 'right'
 *
 * @example
 * <FormInput
 *   name="email"
 *   type="email"
 *   label="Email Address"
 *   value={email}
 *   onChange={(e) => setEmail(e.target.value)}
 *   error={errors.email}
 *   validationType="email"
 *   required
 *   placeholder="Enter your email"
 * />
 *
 * @example
 * <FormInput
 *   name="message"
 *   inputType="textarea"
 *   label="Message"
 *   value={message}
 *   onChange={(e) => setMessage(e.target.value)}
 *   rows={5}
 *   maxLength={500}
 *   showCharCount
 *   placeholder="Type your message"
 * />
 *
 * @example
 * <FormInput
 *   name="role"
 *   inputType="select"
 *   label="Select Role"
 *   value={role}
 *   onChange={(e) => setRole(e.target.value)}
 *   options={[
 *     { value: 'user', label: 'User' },
 *     { value: 'admin', label: 'Admin' }
 *   ]}
 * />
 */
const FormInput = ({
  name,
  type = 'text',
  inputType = 'input',
  label,
  value,
  onChange,
  onBlur,
  onValidate,
  error,
  success = false,
  placeholder,
  disabled = false,
  required = false,
  validationType,
  validationOptions = {},
  containerClassName,
  labelClassName,
  hint,
  showCharCount = false,
  maxLength,
  rows = 4,
  options = [],
  icon,
  iconPosition = 'right'
}) => {
  // Handle real-time validation
  const handleValidation = (val) => {
    if (validationType) {
      const { isValid, error: validationError } = validateField(validationType, val, {
        ...validationOptions,
        required
      })

      if (onValidate) {
        onValidate({ isValid, error: validationError })
      }
    }
  }

  const handleChange = (e) => {
    const newValue = e.target.value
    onChange(e)

    // Validate on change if no onBlur handler provided
    if (!onBlur) {
      handleValidation(newValue)
    }
  }

  const handleBlur = (e) => {
    if (onBlur) {
      onBlur(e)
    }

    // Validate on blur if validationType is specified
    if (validationType) {
      handleValidation(e.target.value)
    }
  }

  const inputClasses = getInputClasses({
    type: inputType,
    error: !!error,
    success: !!success && !error,
    disabled
  })

  const containerClasses = containerClassName || 'mb-4'
  const labelClasses = labelClassName || 'block text-sm font-medium theme-text mb-2'

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className='ml-1 text-red-500'>*</span>}
        </label>
      )}

      {/* Input Container with Icon Support */}
      <div className='relative'>
        {/* Icon Left */}
        {icon && iconPosition === 'left' && <div className='absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary pointer-events-none'>{icon}</div>}

        {/* Input Variants */}
        {inputType === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            rows={rows}
            maxLength={maxLength}
            className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} w-full`}
            aria-label={label || name}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          />
        ) : inputType === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} w-full`}
            aria-label={label || name}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}>
            <option value=''>-- Select an option --</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={disabled}
            placeholder={placeholder}
            maxLength={maxLength}
            className={`${inputClasses} ${icon && iconPosition === 'left' ? 'pl-10' : ''} ${icon && iconPosition === 'right' ? 'pr-10' : ''} w-full`}
            aria-label={label || name}
            aria-invalid={!!error}
            aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
          />
        )}

        {/* Icon Right */}
        {icon && iconPosition === 'right' && <div className='absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-text-secondary pointer-events-none'>{icon}</div>}
      </div>

      {/* Character Count */}
      {showCharCount && maxLength && (
        <div className='mt-1 text-xs text-right theme-text-muted'>
          {value?.length || 0} / {maxLength}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          id={`${name}-error`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className='mt-2 flex items-start gap-2 p-2 rounded-md bg-red-50 dark:bg-red-950/30 border-l-2 border-red-500'
          role='alert'>
          <FiAlertCircle className='w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0' />
          <p className='text-sm text-red-700 dark:text-red-300'>{error}</p>
        </motion.div>
      )}

      {/* Success Message */}
      {success && !error && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className='mt-2 flex items-start gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/30 border-l-2 border-green-500'>
          <FiCheckCircle className='w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0' />
          <p className='text-sm text-green-700 dark:text-green-300'>Field is valid</p>
        </motion.div>
      )}

      {/* Hint Text */}
      {hint && !error && !success && (
        <p id={`${name}-hint`} className='mt-1 text-xs theme-text-muted'>
          {hint}
        </p>
      )}
    </div>
  )
}

FormInput.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  inputType: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.any,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  onValidate: PropTypes.func,
  error: PropTypes.string,
  success: PropTypes.bool,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  validationType: PropTypes.string,
  validationOptions: PropTypes.object,
  className: PropTypes.string,
  containerClassName: PropTypes.string,
  labelClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  hint: PropTypes.string,
  showCharCount: PropTypes.bool,
  maxLength: PropTypes.number,
  rows: PropTypes.number,
  options: PropTypes.arrayOf(PropTypes.shape({
    value: PropTypes.any.isRequired,
    label: PropTypes.string.isRequired
  })),
  icon: PropTypes.node,
  iconPosition: PropTypes.string
}

export default FormInput
