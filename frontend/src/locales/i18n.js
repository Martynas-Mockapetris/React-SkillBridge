import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enMain from './en/main.json'
import ltMain from './lt/main.json'
import enHome from './en/home.json'
import ltHome from './lt/home.json'
import enContact from './en/contact.json'
import ltContact from './lt/contact.json'
import enDiscover from './en/discover.json'
import ltDiscover from './lt/discover.json'
import enProfile from './en/profile.json'
import ltProfile from './lt/profile.json'
import enConnections from './en/connections.json'
import ltConnections from './lt/connections.json'

// Merge all English locale files - combine all into main namespace
const enMerged = {
  main: {
    ...enMain,
    ...enHome,
    ...enContact,
    listings: {
      ...enMain.listings,
      ...enDiscover.listings,
      // Merge profile translations
      ...Object.fromEntries(
        Object.entries(enProfile).filter(([key]) => !key.startsWith('//')).map(([key, value]) => [key, value])
      ),
      // Merge connection translations
      ...Object.fromEntries(
        Object.entries(enConnections).filter(([key]) => !key.startsWith('//')).map(([key, value]) => [key, value])
      )
    }
  }
}

// Merge all Lithuanian locale files
const ltMerged = {
  main: {
    ...ltMain,
    ...ltHome,
    ...ltContact,
    listings: {
      ...ltMain.listings,
      ...ltDiscover.listings,
      // Merge profile translations
      ...Object.fromEntries(
        Object.entries(ltProfile).filter(([key]) => !key.startsWith('//')).map(([key, value]) => [key, value])
      ),
      // Merge connection translations
      ...Object.fromEntries(
        Object.entries(ltConnections).filter(([key]) => !key.startsWith('//')).map(([key, value]) => [key, value])
      )
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: enMerged,
      lt: ltMerged
    },
    defaultLanguage: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    ns: ['main'],
    defaultNS: 'main'
  })

export default i18n
