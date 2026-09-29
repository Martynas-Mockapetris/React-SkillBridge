import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTheme } from '../context/ThemeContext'
import { useLanguage } from '../context/LanguageContext'
import ContactSection from '../components/Home/ContactSection'
import FeaturesSection from '../components/Home/FeatureSection'
import HeroSection from '../components/Home/HeroSection'
import HowItWorksSection from '../components/Home/HowItWorksSection'
import PricingSection from '../components/Home/PricingSection'
import TestimonialsSection from '../components/Home/TestimonialsSection'
import { DEFAULT_PRICING_LAYOUT, DEFAULT_TESTIMONIALS_LAYOUT } from '../constants/homePageData'
import { getPublicSystemConfig } from '../services/configService'

const DEFAULT_HOME_SECTION_ORDER = ['hero', 'features', 'howItWorks', 'testimonials', 'pricing', 'contact']
const DEFAULT_HOME_SECTION_SPACING = {}
const DEFAULT_HOME_SECTION_BACKGROUNDS = {}

// Helper: Extract language-specific admin values, falling back to generic keys
const extractLanguageSpecificContent = (values, language) => {
  if (!values || !language) return values

  const result = {}

  // For each key in values, check for language-specific version (key_en, key_lt)
  Object.keys(values).forEach((key) => {
    // Skip keys that already have language suffix
    if (key.endsWith('_en') || key.endsWith('_lt')) {
      return
    }

    // Try to find language-specific version
    const langSpecificKey = `${key}_${language}`
    if (langSpecificKey in values) {
      result[key] = values[langSpecificKey]
    } else {
      result[key] = values[key]
    }
  })

  return result
}

const Home = () => {
  const { isDarkMode } = useTheme()
  const { currentLanguage } = useLanguage()
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
    const rawValues = publicConfig.home.values || {}
    // Extract language-specific admin values
    return extractLanguageSpecificContent(rawValues, currentLanguage)
  }, [publicConfig, currentLanguage])

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

  const homeSectionSpacing = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return DEFAULT_HOME_SECTION_SPACING
    return publicConfig.siteBuilder.values?.homeSectionSpacing || DEFAULT_HOME_SECTION_SPACING
  }, [publicConfig])

  const homeSectionBackgrounds = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return DEFAULT_HOME_SECTION_BACKGROUNDS
    return publicConfig.siteBuilder.values?.homeSectionBackgrounds || DEFAULT_HOME_SECTION_BACKGROUNDS
  }, [publicConfig])

  const contactValues = useMemo(() => {
    if (!publicConfig?.contact?.enabled) return {}
    const rawValues = publicConfig.contact.values || {}
    return extractLanguageSpecificContent(rawValues, currentLanguage)
  }, [publicConfig, currentLanguage])

  const systemValues = useMemo(() => {
    if (!publicConfig?.system?.enabled) return {}
    return publicConfig.system.values || {}
  }, [publicConfig])

  const pricingValues = useMemo(() => {
    const pricingSectionValues = publicConfig?.pricing?.enabled ? publicConfig.pricing.values || {} : {}
    const legacyHomeValues = publicConfig?.home?.enabled ? publicConfig.home.values || {} : {}
    const merged = { ...legacyHomeValues, ...pricingSectionValues }
    return extractLanguageSpecificContent(merged, currentLanguage)
  }, [publicConfig, currentLanguage])

  const pricingLayoutValues = useMemo(() => {
    const configuredLayout = publicConfig?.pricing?.enabled ? publicConfig.pricing.values?.layout || {} : {}
    return {
      ...DEFAULT_PRICING_LAYOUT,
      ...configuredLayout
    }
  }, [publicConfig])

  const testimonialsValues = useMemo(() => {
    const testimonialsSectionValues = publicConfig?.testimonials?.enabled ? publicConfig.testimonials.values || {} : {}
    const legacyHomeValues = publicConfig?.home?.enabled ? publicConfig.home.values || {} : {}
    const merged = { ...legacyHomeValues, ...testimonialsSectionValues }
    return extractLanguageSpecificContent(merged, currentLanguage)
  }, [publicConfig, currentLanguage])

  const testimonialsLayoutValues = useMemo(() => {
    const configuredLayout = publicConfig?.testimonials?.enabled ? publicConfig.testimonials.values?.layout || {} : {}
    return {
      ...DEFAULT_TESTIMONIALS_LAYOUT,
      ...configuredLayout
    }
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
              return showHero
                ? {
                    key: 'hero',
                    element: <HeroSection content={homeValues} layout={heroLayoutValues} sectionSpacing={homeSectionSpacing.hero || {}} sectionBackground={homeSectionBackgrounds.hero || 'default'} />
                  }
                : null
            case 'features':
              return showFeatures
                ? {
                    key: 'features',
                    element: (
                      <FeaturesSection
                        content={homeValues}
                        systemValues={systemValues}
                        layout={{
                          spacing: homeSectionSpacing.features || {},
                          background: homeSectionBackgrounds.features || 'default'
                        }}
                      />
                    )
                  }
                : null
            case 'howItWorks':
              return showHowItWorks
                ? {
                    key: 'howItWorks',
                    element: (
                      <HowItWorksSection
                        content={homeValues}
                        layout={{
                          spacing: homeSectionSpacing.howItWorks || {},
                          background: homeSectionBackgrounds.howItWorks || 'default'
                        }}
                      />
                    )
                  }
                : null
            case 'testimonials':
              return showTestimonials
                ? {
                    key: 'testimonials',
                    element: (
                      <TestimonialsSection
                        content={testimonialsValues}
                        layout={{
                          spacing: homeSectionSpacing.testimonials || {},
                          background: homeSectionBackgrounds.testimonials || 'default',
                          ...testimonialsLayoutValues
                        }}
                      />
                    )
                  }
                : null
            case 'pricing':
              return showPricing
                ? {
                    key: 'pricing',
                    element: (
                      <PricingSection
                        content={pricingValues}
                        layout={{
                          spacing: homeSectionSpacing.pricing || {},
                          background: homeSectionBackgrounds.pricing || 'default',
                          ...pricingLayoutValues
                        }}
                      />
                    )
                  }
                : null
            case 'contact':
              return showContact
                ? {
                    key: 'contact',
                    element: (
                      <ContactSection
                        content={homeValues}
                        contactValues={contactValues}
                        layout={{
                          spacing: homeSectionSpacing.contact || {},
                          background: homeSectionBackgrounds.contact || 'default'
                        }}
                      />
                    )
                  }
                : null
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
