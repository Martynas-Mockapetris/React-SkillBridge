import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { changeUserPassword } from '../../services/userService'

const SecuritySettings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const [errors, setErrors] = useState({})
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordUpdated, setPasswordUpdated] = useState(false)
  const [sessionExpired, setSessionExpired] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    // Current password validation
    if (!passwordData.currentPassword.trim()) {
      newErrors.currentPassword = 'Current password is required'
    }

    // New password validation
    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required'
    } else {
      // Password strength rules
      if (passwordData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters'
      }
      if (!/[A-Z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one uppercase letter'
      }
      if (!/[a-z]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one lowercase letter'
      }
      if (!/[0-9]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one number'
      }
      if (!/[!@#$%^&*]/.test(passwordData.newPassword)) {
        newErrors.newPassword = 'Password must contain at least one special character'
      }
    }

    if (passwordData.currentPassword && passwordData.newPassword && passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password'
    }

    // Confirm password validation
    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password'
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Each criteria adds 20% to strength
  const calculatePasswordStrength = (password) => {
    let strength = 0
    if (password.length >= 8) strength += 20
    if (/[A-Z]/.test(password)) strength += 20
    if (/[a-z]/.test(password)) strength += 20
    if (/[0-9]/.test(password)) strength += 20
    if (/[!@#$%^&*]/.test(password)) strength += 20
    return strength
  }

  // Random password generator
  const generateStrongPassword = () => {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz'
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    const numbers = '0123456789'
    const symbols = '!@#$%^&*'

    if (passwordUpdated) {
      setPasswordUpdated(false)
    }

    if (sessionExpired) {
      setSessionExpired(false)
    }

    const getRandomChar = (str) => str.charAt(Math.floor(Math.random() * str.length))

    let password = [getRandomChar(lowercase), getRandomChar(uppercase), getRandomChar(numbers), getRandomChar(symbols)]

    const allChars = lowercase + uppercase + numbers + symbols
    for (let i = password.length; i < 12; i++) {
      password.push(getRandomChar(allChars))
    }

    password = password.sort(() => Math.random() - 0.5)

    const newPassword = password.join('')

    setPasswordData((prev) => ({
      ...prev,
      newPassword,
      confirmPassword: ''
    }))

    setErrors((prev) => {
      const nextErrors = { ...prev }
      delete nextErrors.newPassword
      delete nextErrors.confirmPassword

      if (passwordData.currentPassword !== newPassword) {
        delete nextErrors.newPassword
      }

      return nextErrors
    })

    setPasswordStrength(calculatePasswordStrength(newPassword))
  }

  // Password requirements
  const PasswordRequirements = ({ password }) => {
    const requirements = [
      { label: 'At least 8 characters', test: (pwd) => pwd.length >= 8 },
      { label: 'Contains uppercase letter', test: (pwd) => /[A-Z]/.test(pwd) },
      { label: 'Contains lowercase letter', test: (pwd) => /[a-z]/.test(pwd) },
      { label: 'Contains number', test: (pwd) => /[0-9]/.test(pwd) },
      { label: 'Contains special character', test: (pwd) => /[!@#$%^&*]/.test(pwd) }
    ]

    return (
      <div className='mt-2 space-y-2'>
        {requirements.map((req, index) => (
          <motion.div key={index} className='flex items-center space-x-2' initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
            <span className={`text-sm ${req.test(password) ? 'text-green-500' : 'text-red-500'}`}>{req.test(password) ? '✓' : '×'}</span>
            <span className='text-sm theme-text-secondary'>{req.label}</span>
          </motion.div>
        ))}
      </div>
    )
  }

  // Updates strength when password changes
  const handleChange = (e) => {
    const { name, value } = e.target

    if (passwordUpdated) {
      setPasswordUpdated(false)
    }

    if (sessionExpired) {
      setSessionExpired(false)
    }

    setPasswordData((prev) => {
      const nextPasswordData = {
        ...prev,
        [name]: value
      }

      setErrors((prevErrors) => {
        const nextErrors = {
          ...prevErrors
        }

        delete nextErrors[name]

        if (name === 'currentPassword' || name === 'newPassword') {
          if (nextPasswordData.currentPassword !== nextPasswordData.newPassword) {
            delete nextErrors.newPassword
          }
        }

        if (name === 'newPassword' || name === 'confirmPassword') {
          if (nextPasswordData.newPassword === nextPasswordData.confirmPassword) {
            delete nextErrors.confirmPassword
          }
        }

        return nextErrors
      })

      return nextPasswordData
    })

    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      setIsSubmitting(true)
      setSessionExpired(false)

      const response = await changeUserPassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      toast.success(response.message || 'Password updated successfully.')

      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setErrors({})
      setPasswordStrength(0)
      setPasswordUpdated(true)
      setShowPasswords({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      })
    } catch (error) {
      const status = error.response?.status
      const message = error.response?.data?.message || 'Failed to update password.'
      setPasswordUpdated(false)

      if (status === 401) {
        setSessionExpired(true)
        toast.error('Your session has expired. Please sign in again before updating your password.')
        return
      }

      toast.error(message)

      if (message.toLowerCase().includes('current password')) {
        setErrors((prev) => ({
          ...prev,
          currentPassword: message
        }))
      }

      if (message.toLowerCase().includes('new password')) {
        setErrors((prev) => ({
          ...prev,
          newPassword: message
        }))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputClasses = (fieldName) => `
  w-full pl-10 p-3 rounded-lg
  theme-input theme-text
  transition-all duration-300
  border ${errors[fieldName] ? 'border-red-500' : 'dark:border-light/10 border-primary/10'}
  dark:placeholder:text-light/40 placeholder:text-primary/40
  dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
  focus:outline-none focus:ring-2 focus:ring-accent/50
`

  const hasUppercase = /[A-Z]/.test(passwordData.newPassword)
  const hasLowercase = /[a-z]/.test(passwordData.newPassword)
  const hasNumber = /[0-9]/.test(passwordData.newPassword)
  const hasSpecialCharacter = /[!@#$%^&*]/.test(passwordData.newPassword)
  const hasMinimumLength = passwordData.newPassword.length >= 8
  const isNewPasswordDifferent = Boolean(passwordData.currentPassword && passwordData.newPassword && passwordData.currentPassword !== passwordData.newPassword)
  const doPasswordsMatch = Boolean(passwordData.newPassword && passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword)
  const hasStartedPasswordFlow = Boolean(passwordData.currentPassword || passwordData.newPassword || passwordData.confirmPassword)
  const canSubmitPassword = Boolean(
    passwordData.currentPassword &&
    passwordData.newPassword &&
    passwordData.confirmPassword &&
    hasMinimumLength &&
    hasUppercase &&
    hasLowercase &&
    hasNumber &&
    hasSpecialCharacter &&
    isNewPasswordDifferent &&
    doPasswordsMatch
  )

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div
        className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border theme-border'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <h3 className='text-xl font-semibold theme-text mb-2'>Change Password</h3>
        <p className='text-sm theme-text-secondary mb-2'>Use a strong password you do not reuse elsewhere to keep your account protected.</p>
        <p className='text-xs theme-text-muted mb-4'>Your current password is required before a new one can be saved.</p>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div>
            <p className='text-xs uppercase tracking-wide theme-text-muted mb-4'>Verification</p>
            <div>
              <label className='block mb-2 theme-text-secondary text-sm'>Current Password</label>
              <div className='relative'>
                <span className='absolute left-3 top-4 text-accent text-[16px]'>
                  <FaLock />
                </span>
                <input
                  type={showPasswords.currentPassword ? 'text' : 'password'}
                  name='currentPassword'
                  value={passwordData.currentPassword}
                  onChange={handleChange}
                  className={getInputClasses('currentPassword')}
                  placeholder='Enter current password'
                />
                <button
                  type='button'
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      currentPassword: !prev.currentPassword
                    }))
                  }
                  className='absolute right-3 top-4 text-accent text-[16px]'>
                  {showPasswords.currentPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.currentPassword && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.currentPassword}
                  </motion.p>
                )}
              </div>
            </div>

            <div className='pt-2 border-t dark:border-light/10 border-primary/10'>
              <p className='text-xs uppercase tracking-wide theme-text-muted mb-4'>New Password</p>

              <div className='space-y-6'>
                <div>
                  <label className='block mb-2 theme-text-secondary text-sm'>New Password</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-4 text-accent text-[16px]'>
                      <FaLock />
                    </span>
                    <input
                      type={showPasswords.newPassword ? 'text' : 'password'}
                      name='newPassword'
                      value={passwordData.newPassword}
                      onChange={handleChange}
                      className={getInputClasses('newPassword')}
                      placeholder='Enter new password'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          newPassword: !prev.newPassword
                        }))
                      }
                      className='absolute right-3 top-4 text-accent text-[16px]'>
                      {showPasswords.newPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.newPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                        {errors.newPassword}
                      </motion.p>
                    )}
                  </div>

                  <div className='mt-3 flex items-center justify-between gap-3 flex-wrap'>
                    <p className='text-xs theme-text-muted'>Need help? Generate a strong password and store it in your password manager.</p>
                    <button
                      type='button'
                      onClick={generateStrongPassword}
                      className='inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border dark:border-light/10 border-primary/10 theme-text hover:text-accent hover:border-accent/40 transition-colors'>
                      Generate Strong Password
                    </button>
                  </div>

                  {passwordData.newPassword ? (
                    <>
                      <div className='mt-3'>
                        <div className='h-2 w-full rounded-full overflow-hidden bg-primary/10 dark:bg-light/10'>
                          <motion.div
                            className={`h-full ${passwordStrength <= 40 ? 'bg-red-500' : passwordStrength <= 80 ? 'bg-yellow-500' : 'bg-green-500'}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${passwordStrength}%` }}
                            transition={{ duration: 0.3 }}
                          />
                        </div>
                        <p className='text-sm mt-1 theme-text-secondary'>Password Strength: {passwordStrength <= 40 ? 'Weak' : passwordStrength <= 80 ? 'Medium' : 'Strong'}</p>
                      </div>

                      <PasswordRequirements password={passwordData.newPassword} />
                    </>
                  ) : (
                    <p className='text-sm theme-text-secondary mt-3'>Start typing a new password to see strength feedback and requirements.</p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 theme-text-secondary text-sm'>Confirm Password</label>
                  <div className='relative'>
                    <span className='absolute left-3 top-4 text-accent text-[16px]'>
                      <FaLock />
                    </span>
                    <input
                      type={showPasswords.confirmPassword ? 'text' : 'password'}
                      name='confirmPassword'
                      value={passwordData.confirmPassword}
                      onChange={handleChange}
                      className={getInputClasses('confirmPassword')}
                      placeholder='Confirm new password'
                    />
                    <button
                      type='button'
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirmPassword: !prev.confirmPassword
                        }))
                      }
                      className='absolute right-3 top-4 text-accent text-[16px]'>
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                    {errors.confirmPassword && (
                      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                        {errors.confirmPassword}
                      </motion.p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            {sessionExpired && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='text-sm text-amber-600 dark:text-amber-400'>
                Your session expired before the password update completed. Sign in again, then retry this form.
              </motion.p>
            )}
            {passwordUpdated && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className='text-sm text-green-600 dark:text-green-400'>
                Password updated successfully. Use your new password the next time you sign in.
              </motion.p>
            )}
            <p className='text-sm theme-text-secondary'>
              {!hasStartedPasswordFlow
                ? 'Enter your current and new password to begin.'
                : isSubmitting
                  ? 'Updating your password now.'
                  : !canSubmitPassword
                    ? 'Complete all requirements and make sure both new password fields match before submitting.'
                    : 'Your password details are ready to submit.'}
            </p>

            <motion.button
              type='submit'
              className='w-full bg-accent text-white font-medium py-3 px-6 rounded-lg
              hover:bg-accent/90 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-accent/50
              disabled:opacity-50 disabled:cursor-not-allowed'
              whileHover={canSubmitPassword && !isSubmitting ? { scale: 1.02 } : undefined}
              whileTap={canSubmitPassword && !isSubmitting ? { scale: 0.98 } : undefined}
              disabled={!canSubmitPassword || isSubmitting}>
              {isSubmitting ? 'Updating Password...' : 'Update Password'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default SecuritySettings
