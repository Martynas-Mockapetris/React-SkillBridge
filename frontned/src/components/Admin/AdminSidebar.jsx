import { useState } from 'react'
import { FaChartBar, FaUsers, FaProjectDiagram, FaCog, FaBars, FaTimes } from 'react-icons/fa'
import { motion, AnimatePresence } from 'framer-motion'

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  // State for mobile menu toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Navigation items configuration with icons
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ]

  return (
    <>
      {/* Mobile menu toggle button */}
      <button className='lg:hidden fixed top-[93px] left-4 z-50 p-2 rounded-lg bg-accent text-white' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar container with responsive classes */}
      <motion.div
        className={`fixed lg:static lg:block z-40 h-screen bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent dark:from-light/5 dark:via-light/[0.02] backdrop-blur-sm shadow-lg
          ${isMobileMenuOpen ? 'block' : 'hidden lg:block'} w-[240px] lg:w-64 top-[50px]`}
        initial={{ x: window.innerWidth <= 1024 ? -300 : 0 }}
        animate={{ x: isMobileMenuOpen || window.innerWidth > 1024 ? 0 : -300 }}
        transition={{ duration: 0.3 }}>
        {/* Flex container for vertical layout */}
        <div className='flex h-full flex-col'>
          {/* Navigation menu */}
          <nav className='space-y-1 pt-28 lg:pt-4 p-4'>
            {navigationItems.map((item) => (
              // Animated navigation button
              <motion.button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id)
                  setIsMobileMenuOpen(false)
                }}
                className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-all duration-200
                  ${activeSection === item.id ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'}`}
                whileHover={{ scale: 1.02, translateX: 5 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}>
                {/* Icon container */}
                <span className={`mr-3 text-xl ${activeSection === item.id ? 'text-white' : 'text-accent'}`}>{item.icon}</span>
                {/* Label text */}
                <span className='font-medium'>{item.label}</span>
              </motion.button>
            ))}
          </nav>
        </div>
      </motion.div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden' onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  )
}

export default AdminSidebar
