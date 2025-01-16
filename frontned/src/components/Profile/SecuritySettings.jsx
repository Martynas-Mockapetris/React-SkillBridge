import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash } from 'react-icons/fa'

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

    // Confirm password validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
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

    const getRandomChar = (str) => str.charAt(Math.floor(Math.random() * str.length))

    // Ensure one of each required character type
    let password = [getRandomChar(lowercase), getRandomChar(uppercase), getRandomChar(numbers), getRandomChar(symbols)]

    // Add additional random characters to reach desired length (12)
    const allChars = lowercase + uppercase + numbers + symbols
    for (let i = password.length; i < 12; i++) {
      password.push(getRandomChar(allChars))
    }

    // Shuffle the password array
    password = password.sort(() => Math.random() - 0.5)

    const newPassword = password.join('')
    setPasswordData((prev) => ({
      ...prev,
      newPassword,
      confirmPassword: '' // Clear confirm password field
    }))
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
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }))

    // Calculate strength only for new password field
    if (name === 'newPassword') {
      setPasswordStrength(calculatePasswordStrength(value))
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Password change submitted:', passwordData)
    }
  }

  const getInputClasses = (fieldName) => `
  w-full pl-10 p-3 rounded-lg
  bg-light/10
  transition-all duration-300
  dark:placeholder:text-light/40 placeholder:text-primary/40
  dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
  focus:bg-light/20
  focus:outline-none focus:ring-2 focus:ring-accent/50
  hover:scale-[1.02] hover:shadow-lg
  ${errors[fieldName] ? 'border-2 border-red-500' : 'border theme-border'}
`

  return (
    <motion.div className='space-y-8 p-6' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.h2 className='text-2xl font-bold theme-text' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Security Settings
      </motion.h2>

      <motion.div
        className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}>
        <h3 className='text-xl font-semibold theme-text mb-4'>Change Password</h3>

        <form onSubmit={handleSubmit} className='space-y-4'>
          {[
            { name: 'currentPassword', label: 'Current Password', placeholder: 'Enter current password' },
            { name: 'newPassword', label: 'New Password', placeholder: 'Enter new password' },
            { name: 'confirmPassword', label: 'Confirm Password', placeholder: 'Confirm new password' }
          ].map((field) => (
            <div key={field.name}>
              <label className='block mb-2 theme-text-secondary text-sm'>{field.label}</label>
              <div className='relative'>
                <span className='absolute left-3 top-4 text-accent text-[16px]'>
                  <FaLock />
                </span>
                <input
                  type={showPasswords[field.name] ? 'text' : 'password'}
                  name={field.name}
                  value={passwordData[field.name]}
                  onChange={handleChange}
                  className={getInputClasses(field.name)}
                  placeholder={field.placeholder}
                />
                <button
                  type='button'
                  onClick={() =>
                    setShowPasswords((prev) => ({
                      ...prev,
                      [field.name]: !prev[field.name]
                    }))
                  }
                  className='absolute right-3 top-4 text-accent text-[16px]'>
                  {showPasswords[field.name] ? <FaEyeSlash /> : <FaEye />}
                </button>
                {errors[field.name] && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors[field.name]}
                  </motion.p>
                )}
                {field.name === 'newPassword' && (
                  <>
                    <button type='button' onClick={generateStrongPassword} className='absolute right-12 top-4 text-accent text-sm font-medium hover:text-accent/80'>
                      Generate
                    </button>
                    <div className='mt-2'>
                      <div className='h-2 w-full bg-gray-200 rounded-full overflow-hidden'>
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
                )}
              </div>
            </div>
          ))}

          <motion.button
            type='submit'
            className='w-full bg-accent text-white font-medium py-3 px-6 rounded-lg
              hover:bg-accent/90 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-accent/50'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            Update Password
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  )
}

export default SecuritySettings
