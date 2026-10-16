import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enLocales from './en'
import ltLocales from './lt'

// Locale files are merged in en/index.js and lt/index.js
const resources = {
  en: enLocales,
  lt: ltLocales
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultLanguage: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    ns: ['main'],
    defaultNS: 'main'
  })

export default i18n
