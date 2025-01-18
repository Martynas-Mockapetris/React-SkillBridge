import { FaChartBar, FaUsers, FaProjectDiagram, FaCog } from 'react-icons/fa'
import { motion } from 'framer-motion'

const AdminSidebar = ({ activeSection, setActiveSection }) => {
  // Navigation items configuration with icons
  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ]

  return (
    // Main sidebar container
    <div className="h-screen w-64 bg-white dark:bg-gray-800 shadow-lg">
      {/* Flex container for vertical layout */}
      <div className="flex h-full flex-col">
        {/* Navigation menu */}
        <nav className="space-y-1 p-4">
          {navigationItems.map((item) => (
            // Animated navigation button
            <motion.button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center px-4 py-3 text-left rounded-lg transition-colors duration-200
                ${activeSection === item.id 
                  ? 'bg-primary text-white' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              whileHover={{ scale: 1.02, translateX: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* Icon container */}
              <span className="mr-3 text-xl">{item.icon}</span>
              {/* Label text */}
              <span className="font-medium">{item.label}</span>
            </motion.button>
          ))}
        </nav>
      </div>
    </div>
  )
}

export default AdminSidebar
