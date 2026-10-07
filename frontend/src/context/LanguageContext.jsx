import { createContext, useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation()
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language || 'en')

  // On first load, restore user's saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en'
    i18n.changeLanguage(savedLanguage)
    setCurrentLanguage(savedLanguage)
  }, [i18n])

  // Function to switch language and save preference
  const switchLanguage = (lang) => {
    i18n.changeLanguage(lang)
    localStorage.setItem('preferredLanguage', lang)
    setCurrentLanguage(lang)
  }

  // Keyboard shortcut: Ctrl+L toggles language (DISABLED FOR NOW)
  // useEffect(() => {
  //   const handleKeyPress = (e) => {
  //     if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
  //       e.preventDefault()
  //       const newLang = currentLanguage === 'en' ? 'lt' : 'en'
  //       switchLanguage(newLang)
  //     }
  //   }

  //   window.addEventListener('keydown', handleKeyPress)
  //   return () => window.removeEventListener('keydown', handleKeyPress)
  // }, [currentLanguage])

  return <LanguageContext.Provider value={{ currentLanguage, switchLanguage }}>{children}</LanguageContext.Provider>
}

// Custom hook to use language context anywhere
export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider')
  }
  return context
}
