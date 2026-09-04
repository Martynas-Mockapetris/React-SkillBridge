import { validateField } from '../formValidation'

describe('Form Validation Utilities', () => {
  describe('validateField - email', () => {
    test('should validate correct email format', () => {
      const { isValid, error } = validateField('email', 'test@example.com')
      expect(isValid).toBe(true)
      expect(error).toBeUndefined()
    })

    test('should reject invalid email format', () => {
      const { isValid, error } = validateField('email', 'invalid-email')
      expect(isValid).toBe(false)
      expect(error).toBeDefined()
    })

    test('should reject empty email when required', () => {
      const { isValid, error } = validateField('email', '', { required: true })
      expect(isValid).toBe(false)
      expect(error).toBeDefined()
    })
  })

  describe('validateField - password', () => {
    test('should validate strong password', () => {
      const { isValid } = validateField('password', 'SecurePass123!', { minLength: 8 })
      expect(isValid).toBe(true)
    })

    test('should reject weak password', () => {
      const { isValid } = validateField('password', 'weak', { minLength: 8 })
      expect(isValid).toBe(false)
    })
  })

  describe('validateField - url', () => {
    test('should validate correct URL format', () => {
      const { isValid } = validateField('url', 'https://example.com')
      expect(isValid).toBe(true)
    })

    test('should reject invalid URL format', () => {
      const { isValid } = validateField('url', 'not a url')
      expect(isValid).toBe(false)
    })
  })

  describe('validateField - required', () => {
    test('should reject empty required field', () => {
      const { isValid, error } = validateField('text', '', { required: true })
      expect(isValid).toBe(false)
      expect(error).toContain('required')
    })

    test('should accept non-empty optional field', () => {
      const { isValid } = validateField('text', '', { required: false })
      expect(isValid).toBe(true)
    })
  })
})
