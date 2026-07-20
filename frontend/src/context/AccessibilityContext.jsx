import { createContext, useContext, useState, useCallback } from 'react'
import { accessibilityAnnouncements } from '../utils/a11y'

const A11yContext = createContext()

export const AccessibilityProvider = ({ children }) => {
  const [announcement, setAnnouncement] = useState('')
  const [announcementType, setAnnouncementType] = useState('polite')

  const announce = useCallback((message, type = 'polite') => {
    setAnnouncementType(type)
    setAnnouncement(message)

    // Clear announcement after 1 second to allow repeat announcements
    setTimeout(() => {
      setAnnouncement('')
    }, 1000)
  }, [])

  const announceFilterChange = useCallback(
    (filterName) => {
      announce(accessibilityAnnouncements.filterRemoved(filterName))
    },
    [announce]
  )

  const announceResults = useCallback(
    (count) => {
      const message = count === 0 ? accessibilityAnnouncements.resultsEmpty : `Found ${count} project${count !== 1 ? 's' : ''} matching your filters`
      announce(message)
    },
    [announce]
  )

  const announceLoading = useCallback(() => {
    announce(accessibilityAnnouncements.resultsLoading, 'assertive')
  }, [announce])

  const value = {
    announcement,
    announcementType,
    announce,
    announceFilterChange,
    announceResults,
    announceLoading
  }

  return (
    <A11yContext.Provider value={value}>
      {children}

      {/* Announce region for screen readers */}
      <div role='status' aria-live={announcementType} aria-atomic='true' className='sr-only'>
        {announcement}
      </div>

      {/* Assertive region for urgent announcements */}
      <div role='alert' aria-atomic='true' className='sr-only'>
        {announcementType === 'assertive' ? announcement : ''}
      </div>
    </A11yContext.Provider>
  )
}

export const useA11y = () => {
  const context = useContext(A11yContext)
  if (!context) {
    throw new Error('useA11y must be used within AccessibilityProvider')
  }
  return context
}
