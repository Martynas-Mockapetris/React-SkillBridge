import { useEffect, useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import ContactSection from '../components/Home/ContactSection'
import FeaturesSection from '../components/Home/FeatureSection'
import HeroSection from '../components/Home/HeroSection'
import HowItWorksSection from '../components/Home/HowItWorksSection'
import PricingSection from '../components/Home/PricingSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'
import { getPublicSystemConfig } from '../services/configService'

const Home = () => {
  const { isDarkMode } = useTheme()
  const [publicConfig, setPublicConfig] = useState(null)

  useEffect(() => {
    const loadPublicConfig = async () => {
      try {
        const data = await getPublicSystemConfig()
        setPublicConfig(data)
      } catch (error) {
        // Keep page usable with local fallbacks when config is unavailable.
        console.error('Failed to load Home config:', error?.response?.data || error.message)
      }
    }

    loadPublicConfig()
  }, [])

  const homeValues = useMemo(() => {
    if (!publicConfig?.home?.enabled) return {}
    return publicConfig.home.values || {}
  }, [publicConfig])

  const contactValues = useMemo(() => {
    if (!publicConfig?.contact?.enabled) return {}
    return publicConfig.contact.values || {}
  }, [publicConfig])

  const systemValues = useMemo(() => {
    if (!publicConfig?.system?.enabled) return {}
    return publicConfig.system.values || {}
  }, [publicConfig])

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <HeroSection content={homeValues} />
      <FeaturesSection content={homeValues} systemValues={systemValues} />
      <HowItWorksSection content={homeValues} />
      <TestimonialsSection content={homeValues} />
      <PricingSection content={homeValues} />
      <ContactSection content={homeValues} contactValues={contactValues} />
    </main>
  )
}

export default Home
