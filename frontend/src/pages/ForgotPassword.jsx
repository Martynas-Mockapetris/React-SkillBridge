import { useEffect, useRef, useState } from 'react'
import { FaEnvelope } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import PageBackground from '../components/shared/PageBackground'
import { forgotPassword as forgotPasswordService } from '../services/authService'
import { useAuth } from '../context/AuthContext'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [contentHeight, setContentHeight] = useState('100vh')
  const pageRef = useRef(null)
  const { currentUser } = useAuth()

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

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      toast.error(Object.values(newErrors).join('. '))
      return false
    }

    return true
  }

  const handleChange = (e) => {
    setEmail(e.target.value)

    if (errors.email) {
      setErrors({})
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      const response = await forgotPasswordService(email)
      setIsSubmitted(true)
      toast.success(response.message || 'If an account exists, a reset link has been sent.')
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to request password reset.'
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
          <h2 className='text-2xl font-bold theme-text'>Reset Your Password</h2>
          <p className='mt-2 text-sm theme-text-secondary'>Enter your account email and we will send you a password reset link.</p>
        </div>

        <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-8 shadow-lg'>
          {isSubmitted ? (
            <div className='space-y-6 text-center'>
              <div className='rounded-lg border border-green-200 bg-green-50/80 dark:border-green-900/40 dark:bg-green-900/20 p-4'>
                <p className='text-sm text-green-700 dark:text-green-300'>If an account with that email exists, a password reset link has been sent.</p>
              </div>

              <p className='text-sm theme-text-secondary'>Check your inbox and spam folder. If you do not receive anything, you can try again in a moment.</p>

              <div className='flex flex-col gap-3'>
                <button
                  type='button'
                  onClick={() => {
                    setIsSubmitted(false)
                    setEmail('')
                  }}
                  className='w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg theme-text hover:bg-white/40 dark:hover:bg-gray-700/40 transition-colors'>
                  Try another email
                </button>

                <Link to={currentUser ? '/profile' : '/login'} className='w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-center'>
                  Back to {currentUser ? 'Profile' : 'Login'}
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <label className='block text-sm font-medium theme-text-secondary mb-1'>Email</label>
                <div className='relative'>
                  <input
                    type='email'
                    name='email'
                    value={email}
                    onChange={handleChange}
                    placeholder='Enter your account email'
                    className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white/60 dark:bg-gray-700/60 theme-text backdrop-blur-sm'
                  />
                  <FaEnvelope className='absolute left-3 top-3 text-accent' />
                  {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
                </div>
              </div>

              <motion.button
                type='submit'
                disabled={isLoading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className='w-full px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Sending Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </motion.button>

              <div className='pt-4 border-t border-gray-100/30 dark:border-gray-700/30 text-center'>
                <p className='text-sm theme-text-secondary'>
                  Remembered your password?{' '}
                  <Link to='/login' className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                    Back to login
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

export default ForgotPassword
