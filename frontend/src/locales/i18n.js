import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import enMain from './en/main.json'
import ltMain from './lt/main.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        main: enMain
      },
      lt: {
        main: ltMain
      }
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
