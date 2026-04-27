import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import ContactSection from '../components/Home/ContactSection'
import FeaturesSection from '../components/Home/FeatureSection'
import HeroSection from '../components/Home/HeroSection'
import HowItWorksSection from '../components/Home/HowItWorksSection'
import PricingSection from '../components/Home/PricingSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'
import { getPublicSystemConfig } from '../services/configService'

const DEFAULT_HOME_SECTION_ORDER = ['hero', 'features', 'howItWorks', 'testimonials', 'pricing', 'contact']

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

  const heroLayoutValues = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.homeHero || {}
  }, [publicConfig])

  const homeSectionVisibility = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.homeSections || {}
  }, [publicConfig])

  const homeSectionOrder = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return DEFAULT_HOME_SECTION_ORDER

    const savedOrder = publicConfig.siteBuilder.values?.homeSectionOrder
    if (!Array.isArray(savedOrder) || !savedOrder.length) {
      return DEFAULT_HOME_SECTION_ORDER
    }

    const allowedKeys = new Set(DEFAULT_HOME_SECTION_ORDER)
    const sanitizedOrder = savedOrder.filter((key) => allowedKeys.has(key))
    const missingKeys = DEFAULT_HOME_SECTION_ORDER.filter((key) => !sanitizedOrder.includes(key))

    return [...sanitizedOrder, ...missingKeys]
  }, [publicConfig])

  const contactValues = useMemo(() => {
    if (!publicConfig?.contact?.enabled) return {}
    return publicConfig.contact.values || {}
  }, [publicConfig])

  const systemValues = useMemo(() => {
    if (!publicConfig?.system?.enabled) return {}
    return publicConfig.system.values || {}
  }, [publicConfig])

  const pricingValues = useMemo(() => {
    const pricingSectionValues = publicConfig?.pricing?.enabled ? publicConfig.pricing.values || {} : {}
    const legacyHomeValues = publicConfig?.home?.enabled ? publicConfig.home.values || {} : {}
    return { ...legacyHomeValues, ...pricingSectionValues }
  }, [publicConfig])

  const testimonialsValues = useMemo(() => {
    const testimonialsSectionValues = publicConfig?.testimonials?.enabled ? publicConfig.testimonials.values || {} : {}
    const legacyHomeValues = publicConfig?.home?.enabled ? publicConfig.home.values || {} : {}
    return { ...legacyHomeValues, ...testimonialsSectionValues }
  }, [publicConfig])

  const showHero = homeSectionVisibility.showHero ?? true
  const showFeatures = homeSectionVisibility.showFeatures ?? true
  const showHowItWorks = homeSectionVisibility.showHowItWorks ?? true
  const showTestimonials = homeSectionVisibility.showTestimonials ?? true
  const showPricing = homeSectionVisibility.showPricing ?? true
  const showContact = homeSectionVisibility.showContact ?? true

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      {homeSectionOrder
        .map((sectionKey) => {
          switch (sectionKey) {
            case 'hero':
              return showHero ? { key: 'hero', element: <HeroSection content={homeValues} layout={heroLayoutValues} /> } : null
            case 'features':
              return showFeatures ? { key: 'features', element: <FeaturesSection content={homeValues} systemValues={systemValues} /> } : null
            case 'howItWorks':
              return showHowItWorks ? { key: 'howItWorks', element: <HowItWorksSection content={homeValues} /> } : null
            case 'testimonials':
              return showTestimonials ? { key: 'testimonials', element: <TestimonialsSection content={testimonialsValues} /> } : null
            case 'pricing':
              return showPricing ? { key: 'pricing', element: <PricingSection content={pricingValues} /> } : null
            case 'contact':
              return showContact ? { key: 'contact', element: <ContactSection content={homeValues} contactValues={contactValues} /> } : null
            default:
              return null
          }
        })
        .filter(Boolean)
        .map((section) => (
          <Fragment key={section.key}>{section.element}</Fragment>
        ))}
    </main>
  )
}

export default Home
