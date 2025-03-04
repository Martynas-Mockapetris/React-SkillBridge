import { useState, useEffect, useRef } from 'react'
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { Link, useNavigate } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { motion } from 'framer-motion'
import molecularPattern from '../assets/molecular-pattern.svg'
import { useAuth } from '../context/AuthContext'

const Login = () => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [contentHeight, setContentHeight] = useState('100vh')
  const loginRef = useRef(null)
  const navigate = useNavigate()
  
  // Use the auth context instead of direct imports
  const { currentUser, login } = useAuth()

  // Check if user is already logged in using context
  useEffect(() => {
    if (currentUser) {
      navigate('/profile')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    const calculateHeight = () => {
      const footerElement = document.querySelector('footer')
      if (footerElement) {
        const footerHeight = footerElement.offsetHeight
        setContentHeight(`calc(100vh - ${footerHeight}px)`)
      }
    }

    // Calculate on mount and window resize
    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => {
      window.removeEventListener('resize', calculateHeight)
    }
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    // Email validation
    if (!loginData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(loginData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
    if (!loginData.password) {
      newErrors.password = 'Password is required'
    }

    // Set errors and show toasts for each error
    setErrors(newErrors)

    if (Object.keys(newErrors).length > 0) {
      // Show one toast with all errors
      const errorMessages = Object.values(newErrors).join('. ')
      toast.error(errorMessages, {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true
      })
    }

    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)

      try {
        // Use the login function from context
        await login(loginData.email, loginData.password)
        // After successful login, we can navigate (no need for timeout
        // since toasts are handled in the context)
        navigate('/profile')
        console.log('Login submitted:', loginData)
      } catch (error) {
        // Error toasts are handled in context, but we can still log the error
        console.error('Login error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div ref={loginRef} className='flex items-center justify-center px-6 theme-bg relative z-[1]' style={{ minHeight: contentHeight }}>
      {/* Molecular Pattern Background */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        {/* Large center pattern */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[550px] h-[550px] rotate-[25deg]' />
        </div>
        {/* Medium patterns */}
        <div className='absolute -left-20 top-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute right-0 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        {/* Small patterns */}
        <div className='absolute left-1/4 top-0 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/4 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className='w-full max-w-md z-10 relative'>
        <div className='text-center mb-8'>
          <h2 className='text-2xl font-bold theme-text'>Welcome Back</h2>
          <p className='mt-2 text-sm theme-text-secondary'>Sign in to your account to continue</p>
        </div>

        <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-8 shadow-lg'>
          <form onSubmit={handleSubmit} className='space-y-6'>
            <div>
              <label className='block text-sm font-medium theme-text-secondary mb-1'>Email</label>
              <div className='relative'>
                <input
                  type='email'
                  name='email'
                  value={loginData.email}
                  onChange={handleChange}
                  placeholder='Enter your email'
                  className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white/60 dark:bg-gray-700/60 theme-text backdrop-blur-sm'
                />
                <FaEnvelope className='absolute left-3 top-3 text-accent' />
                {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium theme-text-secondary mb-1'>Password</label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name='password'
                  value={loginData.password}
                  onChange={handleChange}
                  placeholder='Enter your password'
                  className='w-full pl-10 pr-10 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent bg-white/60 dark:bg-gray-700/60 theme-text backdrop-blur-sm'
                />
                <FaLock className='absolute left-3 top-3 text-accent' />
                <button type='button' onClick={() => setShowPassword(!showPassword)} className='absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'>
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors.password && <p className='text-red-500 text-sm mt-1'>{errors.password}</p>}
              </div>
            </div>

            <div className='flex items-center justify-between'>
              <div className='flex items-center'>
                <input type='checkbox' id='rememberMe' name='rememberMe' checked={loginData.rememberMe} onChange={handleChange} className='h-4 w-4 text-accent rounded border-gray-300 focus:ring-accent' />
                <label htmlFor='rememberMe' className='ml-2 block text-sm theme-text-secondary'>
                  Remember me
                </label>
              </div>
              <Link to='/forgot-password' className='text-sm text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                Forgot password?
              </Link>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </motion.button>

            <div className='pt-4 border-t border-gray-100/30 dark:border-gray-700/30 text-center'>
              <p className='text-sm theme-text-secondary'>
                Don't have an account?{' '}
                <Link to='/register' className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
