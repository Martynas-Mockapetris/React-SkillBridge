import { useState } from 'react'
import { FaChartBar, FaUsers, FaProjectDiagram, FaBullhorn, FaNewspaper, FaCog, FaBars, FaTimes, FaChevronDown, FaChevronRight } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { canAccessAdminSection } from '../../utils/accessRoles'
import { DEFAULT_SETTINGS_SECTION, SETTINGS_GROUPS } from './settingsNavigation'

const AdminSidebar = ({ activeSection, setActiveSection, activeSettingsSection, setActiveSettingsSection }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(true)
  const [expandedSettingsParents, setExpandedSettingsParents] = useState({
    'site-builder-home-page': true
  })
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
        setActiveSettingsSection(DEFAULT_SETTINGS_SECTION)
      }
    }

    setIsMobileMenuOpen(false)
  }

  const handleSettingsItemClick = (itemId) => {
    setActiveSection('settings')
    setActiveSettingsSection(itemId)
    setIsMobileMenuOpen(false)
  }

  const toggleSettingsParent = (key) => {
    setExpandedSettingsParents((prev) => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  return (
    <>
      <button className='lg:hidden fixed top-[84px] left-4 z-50 p-2 rounded-lg bg-accent text-white shadow-lg' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div
        className={`fixed left-0 top-[68px] z-40 h-[calc(100vh-68px)] w-[240px] overflow-y-auto bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent shadow-lg backdrop-blur-sm transition-transform duration-300 ease-out dark:from-light/5 dark:via-light/[0.02]
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} lg:sticky lg:top-[68px] lg:block lg:h-[calc(100vh-68px)] lg:w-64 lg:flex-shrink-0 lg:translate-x-0`}
        aria-hidden={!isMobileMenuOpen && typeof window !== 'undefined' && window.innerWidth < 1024}>
        <div className='flex min-h-full flex-col'>
          <nav className='space-y-1 p-4 pt-6'>
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
                    <div className='mt-2 ml-7 space-y-4'>
                      {SETTINGS_GROUPS.map((group) => (
                        <div key={group.id} className='space-y-1'>
                          <p className='px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500'>{group.label}</p>

                          <div className='space-y-1'>
                            {group.items.map((settingsItem, index) => {
                              if (settingsItem.children?.length) {
                                const parentKey = `${group.id}-${settingsItem.label.toLowerCase().replace(/\s+/g, '-')}`
                                const isExpanded = expandedSettingsParents[parentKey] ?? false
                                const hasActiveChild = settingsItem.children.some((child) => activeSection === 'settings' && activeSettingsSection === child.id)

                                return (
                                  <div key={parentKey} className='space-y-1'>
                                    <button
                                      type='button'
                                      onClick={() => toggleSettingsParent(parentKey)}
                                      className={`w-full flex items-center justify-between text-left text-sm rounded-md px-3 py-2 transition ${
                                        hasActiveChild ? 'bg-accent/10 text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'
                                      }`}>
                                      <span>{settingsItem.label}</span>
                                      <span>{isExpanded ? <FaChevronDown size={11} /> : <FaChevronRight size={11} />}</span>
                                    </button>

                                    {isExpanded && (
                                      <div className='ml-3 space-y-1 border-l border-gray-200 dark:border-gray-700 pl-3'>
                                        {settingsItem.children.map((child) => {
                                          const isSettingsActive = activeSection === 'settings' && activeSettingsSection === child.id

                                          return (
                                            <button
                                              key={child.id}
                                              type='button'
                                              onClick={() => handleSettingsItemClick(child.id)}
                                              className={`w-full text-left text-sm rounded-md px-3 py-2 transition ${
                                                isSettingsActive ? 'bg-accent/15 text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'
                                              }`}>
                                              {child.label}
                                            </button>
                                          )
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )
                              }

                              const isSettingsActive = activeSection === 'settings' && activeSettingsSection === settingsItem.id

                              return (
                                <button
                                  key={settingsItem.id || `${group.id}-${index}`}
                                  type='button'
                                  onClick={() => handleSettingsItemClick(settingsItem.id)}
                                  className={`w-full text-left text-sm rounded-md px-3 py-2 transition ${
                                    isSettingsActive ? 'bg-accent/15 text-accent font-medium' : 'text-gray-600 dark:text-gray-300 hover:bg-light/5 dark:hover:bg-light/10'
                                  }`}>
                                  {settingsItem.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>
      </div>

      {isMobileMenuOpen && <div className='fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden' onClick={() => setIsMobileMenuOpen(false)} />}
    </>
  )
}

export default AdminSidebar
