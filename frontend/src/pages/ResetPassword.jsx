import { useEffect, useMemo, useRef, useState } from 'react'
import { FaLock, FaEye, FaEyeSlash, FaKey } from 'react-icons/fa'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import PageBackground from '../components/shared/PageBackground'
import { resetPassword as resetPasswordService } from '../services/authService'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = useMemo(() => searchParams.get('token') || '', [searchParams])

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [contentHeight, setContentHeight] = useState('100vh')
  const pageRef = useRef(null)

  useEffect(() => {
    const calculateHeight = () => {
      const footerElement = document.querySelector('footer')
      if (footerElement) {
        const footerHeight = footerElement.offsetHeight
        setContentHeight(`calc(100vh - ${footerHeight}px)`)
      }
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => {
      window.removeEventListener('resize', calculateHeight)
    }
  }, [])

  const validateForm = () => {
    const newErrors = {}

    if (!token) {
      newErrors.token = 'Reset token is missing or invalid'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters'
      }
      if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one uppercase letter'
      }
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one lowercase letter'
      }
      if (!/[0-9]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number'
      }
      if (!/[!@#$%^&*]/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one special character'
      }
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors)[0])
      return false
    }

    return true
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))

    if (errors[name] || errors.confirmPassword || errors.token) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        confirmPassword: name === 'password' || name === 'confirmPassword' ? '' : prev.confirmPassword,
        token: prev.token
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await resetPasswordService({
        token,
        password: formData.password
      })

      setIsSubmitted(true)
      toast.success(response.message || 'Password has been reset successfully.')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to reset password.'
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div ref={pageRef} className='flex items-center justify-center px-6 theme-bg relative z-[1]' style={{ minHeight: contentHeight }}>
      <PageBackground variant='auth' />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full max-w-md z-10 relative'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold theme-text'>Choose a New Password</h2>
          <p className='mt-2 text-sm theme-text-secondary'>Set a new password for your SkillBridge account.</p>
        </div>

        <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-8 shadow-lg'>
          {isSubmitted ? (
            <div className='space-y-6 text-center'>
              <div className='rounded-lg border border-green-200 bg-green-50/80 dark:border-green-900/40 dark:bg-green-900/20 p-4'>
                <p className='text-sm text-green-700 dark:text-green-300'>Your password has been reset successfully.</p>
              </div>

              <p className='text-sm theme-text-secondary'>You can now return to the login page and sign in with your new password.</p>

              <Link to='/login' className='block w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                Back to login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              {errors.token && (
                <div className='rounded-lg border border-red-200 bg-red-50/80 dark:border-red-900/40 dark:bg-red-900/20 p-4'>
                  <p className='text-sm text-red-700 dark:text-red-300'>{errors.token}</p>
                </div>
              )}

              {!token && (
                <div className='text-center'>
                  <Link to='/forgot-password' className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                    Request a new reset link
                  </Link>
                </div>
              )}

              <div>
                <label className='block text-sm font-medium theme-text-secondary mb-1'>New Password</label>
                <div className='relative'>
                  <input
                    type={showPasswords.password ? 'text' : 'password'}
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    placeholder='Enter a new password'
                    className='w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white/60 dark:bg-gray-700/60 theme-text backdrop-blur-sm'
                  />
                  <FaLock className='absolute left-3 top-3 text-accent' />
                  <button
                    type='button'
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        password: !prev.password
                      }))
                    }
                    className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                    {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium theme-text-secondary mb-1'>Confirm Password</label>
                <div className='relative'>
                  <input
                    type={showPasswords.confirmPassword ? 'text' : 'password'}
                    name='confirmPassword'
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder='Confirm your new password'
                    className='w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white/60 dark:bg-gray-700/60 theme-text backdrop-blur-sm'
                  />
                  <FaKey className='absolute left-3 top-3 text-accent' />
                  <button
                    type='button'
                    onClick={() =>
                      setShowPasswords((prev) => ({
                        ...prev,
                        confirmPassword: !prev.confirmPassword
                      }))
                    }
                    className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                    {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                  {errors.confirmPassword && <p className='text-red-500 text-sm mt-1'>{errors.confirmPassword}</p>}
                </div>
              </div>

              <motion.button
                type='submit'
                disabled={isLoading || !token}
                whileHover={{ scale: isLoading || !token ? 1 : 1.02 }}
                whileTap={{ scale: isLoading || !token ? 1 : 0.98 }}
                className={`w-full px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${
                  isLoading || !token ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-accent text-white hover:bg-accent/90'
                }`}>
                {isLoading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Resetting Password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </motion.button>

              <div className='pt-4 border-t border-gray-100/30 dark:border-gray-700/30 text-center'>
                <p className='text-sm theme-text-secondary'>
                  Need a new link?{' '}
                  <Link to='/forgot-password' className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                    Request password reset
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPassword
