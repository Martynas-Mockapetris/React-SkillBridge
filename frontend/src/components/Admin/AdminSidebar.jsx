import { useState } from 'react'
import { FaChartBar, FaUsers, FaProjectDiagram, FaBullhorn, FaNewspaper, FaCog, FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { canAccessAdminSection } from '../../utils/accessRoles'

const SETTINGS_PAGES = [
  {
    id: 'home',
    label: 'Home Page',
    children: [
      { id: 'home.hero', label: 'Hero Sections' },
      { id: 'home.pricing', label: 'Pricing' },
      { id: 'home.testimonials', label: 'Testimonials' }
    ]
  },
  { id: 'blog', label: 'Blog Page' },
  { id: 'blog-detail', label: 'Blog Detail Page' },
  { id: 'listings', label: 'Listings Page' },
  { id: 'project-detail', label: 'Project Detail Page' },
  { id: 'about', label: 'About Page' },
  { id: 'contact', label: 'Contact Info' },
  { id: 'mail', label: 'Mail Settings' },
  { id: 'system', label: 'System Settings' }
]

const AdminSidebar = ({ activeSection, setActiveSection, activeSettingsSection, setActiveSettingsSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [isHomePageOpen, setIsHomePageOpen] = useState(true)
  const { currentUser } = useAuth()

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <FaChartBar /> },
    { id: 'users', label: 'Users', icon: <FaUsers /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'announcements', label: 'Announcements', icon: <FaBullhorn /> },
    { id: 'blog', label: 'Blog', icon: <FaNewspaper /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> }
  ].filter((item) => canAccessAdminSection(currentUser, item.id))

  const handleMainNavClick = (itemId) => {
    setActiveSection(itemId)

    if (itemId === 'settings') {
      setIsSettingsOpen(true)
      if (!activeSettingsSection) {
        setActiveSettingsSection('home.hero')
      }
    }

    setIsMobileMenuOpen(false)
  }

  const handleSettingsPageClick = (page) => {
    setActiveSection('settings')

    if (page.id === 'home') {
      setIsHomePageOpen(true)
      setActiveSettingsSection(page.children?.[0]?.id || 'home.hero')
    } else {
      setActiveSettingsSection(page.id)
    }

    setIsMobileMenuOpen(false)
  }

  const handleSettingsChildClick = (childId) => {
    setActiveSection('settings')
    setActiveSettingsSection(childId)
    setIsMobileMenuOpen(false)
  }

  const isHomePageActive = activeSection === 'settings' && activeSettingsSection?.startsWith('home.')

  return (
    <>
      <button className='lg:hidden fixed top-[93px] left-4 z-50 p-2 rounded-lg bg-accent text-white' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <motion.div
        className={`fixed lg:static lg:block z-40 h-screen bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent dark:from-light/5 dark:via-light/[0.02] backdrop-blur-sm shadow-lg
          ${isMobileMenuOpen ? 'block' : 'hidden lg:block'} w-[240px] lg:w-64 top-[50px]`}
        initial={{ x: window.innerWidth <= 1024 ? -300 : 0 }}
        animate={{ x: isMobileMenuOpen || window.innerWidth > 1024 ? 0 : -300 }}
        transition={{ duration: 0.3 }}>
        <div className='flex h-full flex-col'>
          <nav className='space-y-1 pt-28 lg:pt-4 p-4'>
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id
              const isSettingsItem = item.id === 'settings'

              return (
                <div key={item.id}>
                  <motion.button
                    onClick={() => handleMainNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-all duration-200
                      ${isActive ? 'bg-accent text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'}`}
                    whileHover={{ scale: 1.02, translateX: 5 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.2 }}>
                    <span className='flex items-center'>
                      <span className={`mr-3 text-xl ${isActive ? 'text-white' : 'text-accent'}`}>{item.icon}</span>
                      <span className='font-medium'>{item.label}</span>
                    </span>

                    {isSettingsItem && (
                      <span
                        onClick={(e) => {
                          e.stopPropagation()
                          setIsSettingsOpen((prev) => !prev)
                        }}
                        className='p-1 rounded hover:bg-black/10 dark:hover:bg-white/10'>
                        {isSettingsOpen ? <FaChevronDown size={12} /> : <FaChevronRight size={12} />}
                      </span>
                    )}
                  </motion.button>

                  {isSettingsItem && isSettingsOpen && (
                    <div className='mt-1 ml-7 space-y-1'>
                      {SETTINGS_PAGES.map((page) => {
                        const hasChildren = Array.isArray(page.children) && page.children.length > 0
                        const isPageActive = activeSection === 'settings' && (page.id === 'home' ? isHomePageActive : activeSettingsSection === page.id)

                        return (
                          <div key={page.id}>
                            <button
                              type='button'
                              onClick={() => handleSettingsPageClick(page)}
                              className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 transition ${
                                isPageActive ? 'bg-accent/15 text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'
                              }`}>
                              <span>{page.label}</span>

                              {hasChildren && (
                                <span
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setIsHomePageOpen((prev) => !prev)
                                  }}
                                  className='p-1 rounded hover:bg-black/10 dark:hover:bg-white/10'>
                                  {isHomePageOpen ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                                </span>
                              )}
                            </button>

                            {hasChildren && isHomePageOpen && (
                              <div className='mt-1 ml-4 space-y-1'>
                                {page.children.map((child) => {
                                  const isChildActive = activeSection === 'settings' && activeSettingsSection === child.id

                                  return (
                                    <button
                                      key={child.id}
                                      type='button'
                                      onClick={() => handleSettingsChildClick(child.id)}
                                      className={`w-full text-left text-sm rounded-md px-3 py-2 transition ${
                                        isChildActive ? 'bg-accent/15 text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'
                                      }`}>
                                      {child.label}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </motion.div>

      {isMobileMenuOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden' onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  )
}

export default AdminSidebar
