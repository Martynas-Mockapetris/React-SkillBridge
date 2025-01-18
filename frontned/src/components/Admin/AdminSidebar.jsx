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
      <button className='lg:hidden fixed top-[125px] left-4 z-50 p-2 rounded-lg bg-primary text-white' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Sidebar container with responsive classes */}
      <AnimatePresence>
        <motion.div
          className={`fixed lg:static lg:block z-40 h-[calc(100vh-100px)] bg-white dark:bg-gray-800 shadow-lg
    ${isMobileMenuOpen ? 'block' : 'hidden lg:block'} lg:w-64 top-[100px] left-0 w-64 pl-14 lg:pl-0`}
          initial={{ x: window.innerWidth <= 1024 ? -300 : 0 }}
          animate={{ x: isMobileMenuOpen || window.innerWidth > 1024 ? 0 : -300 }}
          transition={{ duration: 0.3 }}>
          {/* Flex container for vertical layout */}
          <div className='flex h-full flex-col'>
            {/* Navigation menu */}
            <nav className='space-y-1 p-4'>
              {navigationItems.map((item) => (
                // Animated navigation button
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id)
                    setIsMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                    ${activeSection === item.id ? 'bg-primary text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                  whileHover={{ scale: 1.02, translateX: 5 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}>
                  {/* Icon container */}
                  <span className='mr-3 text-xl'>{item.icon}</span>
                  {/* Label text */}
                  <span className='font-medium'>{item.label}</span>
                </motion.button>
              ))}
            </nav>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden' onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  )
}

export default AdminSidebar
