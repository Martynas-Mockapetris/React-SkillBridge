import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaLock } from 'react-icons/fa'

const SecuritySettings = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Password data:', passwordData)
  }

  const inputClasses = `
    w-full pl-10 p-3 rounded-lg
    bg-light/10
    transition-all duration-300
    dark:placeholder:text-light/40 placeholder:text-primary/40
    dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
    focus:bg-light/20
    focus:outline-none focus:ring-2 focus:ring-accent/50
    hover:scale-[1.02] hover:shadow-lg
    border theme-border
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
                <input type='password' name={field.name} value={passwordData[field.name]} onChange={handleChange} className={inputClasses} placeholder={field.placeholder} />
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
