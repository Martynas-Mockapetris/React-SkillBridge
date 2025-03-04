import { motion } from 'framer-motion'
import molecularPattern from '../assets/molecular-pattern.svg'
import { useState, useEffect, useRef } from 'react'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'
import { useNavigate, Link } from 'react-router-dom'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { useAuth } from '../context/AuthContext'

const Register = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  // Get the register function and currentUser from context
  const { register, currentUser } = useAuth()

  // Add check to redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      navigate('/profile')
    }
  }, [currentUser, navigate])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  })

  const [contentHeight, setContentHeight] = useState('100vh')
  const registerRef = useRef(null)

  const [showPasswords, setShowPasswords] = useState({
    password: false,
    confirmPassword: false
  })

  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Name validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required'
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required'

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    // Password validation
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

    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    // Select field
    if (!formData.userType) {
      newErrors.userType = 'Please select your account type'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (validateForm()) {
      setIsLoading(true)

      try {
        // Create the user data object to send to the backend
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          userType: formData.userType
        }

        // Call the register function from context instead of direct service
        await register(userData)

        // Navigate to profile (no need for timeout since toast is handled in context)
        navigate('/profile')
      } catch (error) {
        // Error handling is done in context
        console.error('Registration error:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Password requirements component
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

  const getInputClasses = (fieldName) => `
  w-full p-3 rounded-lg
  bg-transparent
  transition-all duration-300
  dark:text-light text-primary
  dark:placeholder:text-light/40 placeholder:text-primary/40
  dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
  focus:outline-none focus:ring-2 focus:ring-accent/50
  hover:scale-[1.02]
  ${errors[fieldName] ? 'border-2 border-red-500' : 'border dark:border-light/10 border-primary/10'}
`

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

  return (
    <div ref={registerRef} className='flex items-center justify-center px-6 theme-bg relative z-[1]' style={{ minHeight: contentHeight }}>

      {/* Background patterns - unchanged */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        {/* Large pattern */}
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

      <div className='container mx-auto px-4 relative z-10'>
        {/* Section header */}
        <div className='text-center mb-10'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>Create Your</span>
            <span className='text-accent'> Account</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto'>Join SkillBridge and unlock your full potential</p>
        </div>

        {/* Form Container */}
        <div className='max-w-md md:max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-lg p-8'>
            <form className='space-y-6' onSubmit={handleSubmit}>
              {/* First and Last Name in one row on desktop */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div>
                  <label className='block mb-2 theme-text font-medium'>First Name</label>
                  <input type='text' name='firstName' value={formData.firstName} onChange={handleChange} className={getInputClasses('firstName')} />
                  {errors.firstName && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                      {errors.firstName}
                    </motion.p>
                  )}
                </div>

                <div>
                  <label className='block mb-2 theme-text font-medium'>Last Name</label>
                  <input type='text' name='lastName' value={formData.lastName} onChange={handleChange} className={getInputClasses('lastName')} />
                  {errors.lastName && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                      {errors.lastName}
                    </motion.p>
                  )}
                </div>
              </div>

              {/* Email field - full width */}
              <div>
                <label className='block mb-2 theme-text font-medium'>Email Address</label>
                <input type='email' name='email' value={formData.email} onChange={handleChange} className={getInputClasses('email')} />
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Password and Confirm Password in one row on desktop */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div>
                  <label className='block mb-2 theme-text font-medium'>Password</label>
                  <div className='relative'>
                    <input type={showPasswords.password ? 'text' : 'password'} name='password' value={formData.password} onChange={handleChange} className={getInputClasses('password')} />
                    <button
                      type='button'
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          password: !prev.password
                        }))
                      }
                      className='absolute right-3 top-3 text-accent text-[16px]'>
                      {showPasswords.password ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {errors.password && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                      {errors.password}
                    </motion.p>
                  )}

                  {formData.password && <PasswordRequirements password={formData.password} />}
                </div>

                <div>
                  <label className='block mb-2 theme-text font-medium'>Confirm Password</label>
                  <div className='relative'>
                    <input type={showPasswords.confirmPassword ? 'text' : 'password'} name='confirmPassword' value={formData.confirmPassword} onChange={handleChange} className={getInputClasses('confirmPassword')} />
                    <button
                      type='button'
                      onClick={() =>
                        setShowPasswords((prev) => ({
                          ...prev,
                          confirmPassword: !prev.confirmPassword
                        }))
                      }
                      className='absolute right-3 top-3 text-accent text-[16px]'>
                      {showPasswords.confirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>

                  {errors.confirmPassword && (
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                      {errors.confirmPassword}
                    </motion.p>
                  )}

                  {formData.password && formData.confirmPassword && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center space-x-2 mt-2'>
                      <span className={formData.password === formData.confirmPassword ? 'text-green-500' : 'text-red-500'}>{formData.password === formData.confirmPassword ? '✓' : '×'}</span>
                      <span className='text-sm theme-text-secondary'>{formData.password === formData.confirmPassword ? 'Passwords match' : 'Passwords do not match'}</span>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* User Type Selection */}
              <div className='mb-6'>
                <label className='block mb-2 dark:text-light text-primary font-medium'>I want to:</label>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <label className={`p-4 rounded-lg border transition-all ${formData.userType === 'client' ? 'border-accent bg-accent/10' : 'dark:border-light/10 border-primary/10'} cursor-pointer hover:border-accent`}>
                    <input type='radio' name='userType' value='client' onChange={handleChange} className='sr-only' />
                    <div className='flex flex-col items-center text-center'>
                      <span className='text-xl mb-2'>🧠</span>
                      <span className='dark:text-light text-primary font-medium'>Hire Talent</span>
                      <span className='text-sm dark:text-light/70 text-primary/70'>I have projects that need skills</span>
                    </div>
                  </label>

                  <label
                    className={`p-4 rounded-lg border transition-all ${formData.userType === 'freelancer' ? 'border-accent bg-accent/10' : 'dark:border-light/10 border-primary/10'} cursor-pointer hover:border-accent`}>
                    <input type='radio' name='userType' value='freelancer' onChange={handleChange} className='sr-only' />
                    <div className='flex flex-col items-center text-center'>
                      <span className='text-xl mb-2'>💻</span>
                      <span className='dark:text-light text-primary font-medium'>Work as Freelancer</span>
                      <span className='text-sm dark:text-light/70 text-primary/70'>I have skills to offer</span>
                    </div>
                  </label>

                  <label className={`p-4 rounded-lg border transition-all ${formData.userType === 'both' ? 'border-accent bg-accent/10' : 'dark:border-light/10 border-primary/10'} cursor-pointer hover:border-accent`}>
                    <input type='radio' name='userType' value='both' onChange={handleChange} className='sr-only' />
                    <div className='flex flex-col items-center text-center'>
                      <span className='text-xl mb-2'>🔄</span>
                      <span className='dark:text-light text-primary font-medium'>Both</span>
                      <span className='text-sm dark:text-light/70 text-primary/70'>I want to do both</span>
                    </div>
                  </label>
                </div>
                {errors.userType && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.userType}
                  </motion.p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type='submit'
                disabled={isLoading}
                className='w-full p-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all font-medium flex items-center justify-center'>
                {isLoading ? (
                  <>
                    <svg className='animate-spin -ml-1 mr-3 h-5 w-5 text-white' xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24'>
                      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4'></circle>
                      <path className='opacity-75' fill='currentColor' d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </motion.button>

              {/* In case user has an account */}
              <div className='mt-4 text-center'>
                <p className='theme-text-secondary'>
                  Already have an account?{' '}
                  <Link to='/login' className='text-accent hover:underline'>
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Register
