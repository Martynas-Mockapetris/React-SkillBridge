import { FaSun, FaMoon } from 'react-icons/fa'
import { useTheme } from '../../context/ThemeContext'
import { motion } from 'framer-motion'

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme()

  return (
    <motion.button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-300 ${isDarkMode ? 'bg-light/10 text-light' : 'bg-primary/10 text-primary'}`}
      whileTap={{ scale: 0.95 }}
      whileHover={{ scale: 1.05 }}>
      {isDarkMode ? <FaSun className='text-xl' /> : <FaMoon className='text-xl' />}
    </motion.button>
  )
}

export default ThemeToggle
