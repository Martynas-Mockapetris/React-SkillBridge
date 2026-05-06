import { useEffect, useMemo, useState } from 'react'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import AboutHero from '../components/About/AboutHero'
import AboutHighlights from '../components/About/AboutHighlights'
import AboutCta from '../components/About/AboutCta'
import { getPublicSystemConfig } from '../services/configService'
import { getSectionBackgroundClass } from '../components/Home/homeSectionLayout'

const DEFAULT_ABOUT_SECTION_SPACING = {
  hero: { top: 'tight', bottom: 'tight' },
  highlights: { top: 'tight', bottom: 'tight' },
  cta: { top: 'tight', bottom: 'none' }
}

const About = () => {
  const [publicConfig, setPublicConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadConfig = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await getPublicSystemConfig()
        setPublicConfig(data || null)
      } catch (err) {
        console.error('Failed to load About page config:', err)
        setError(err.response?.data?.message || 'Failed to load About page.')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const aboutContent = useMemo(() => {
    if (!publicConfig?.about?.enabled) return {}
    return publicConfig.about.values || {}
  }, [publicConfig])

  const aboutHeroBuilder = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutHero || {}
  }, [publicConfig])

  const aboutHighlightsBuilder = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutHighlights || {}
  }, [publicConfig])

  const aboutCtaBuilder = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutCta || {}
  }, [publicConfig])

  const aboutSectionVisibility = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutSections || {}
  }, [publicConfig])

  const aboutSectionSpacing = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutSectionSpacing || {}
  }, [publicConfig])

  const aboutSectionBackgrounds = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) return {}
    return publicConfig.siteBuilder.values?.aboutSectionBackgrounds || {}
  }, [publicConfig])

  const headline = aboutContent.headline || 'Build your freelance career with confidence'
  const subheadline = aboutContent.subheadline || 'Connect clients and freelancers in one place'
  const mission = aboutContent.mission || 'SkillBridge helps people find the right collaboration faster. We bring serious clients and capable freelancers into one workflow that feels clear, practical, and trustworthy.'
  const vision = aboutContent.vision || 'We want project collaboration to feel simpler: fewer dead ends, better matches, stronger communication, and a platform that scales with both independent talent and growing teams.'
  const ctaEyebrow = aboutContent.ctaEyebrow || 'Next Step'
  const ctaHeadline = aboutContent.ctaHeadline || 'Explore the platform or create your account'
  const ctaBody = aboutContent.ctaBody || 'Whether you are hiring, freelancing, or doing both, SkillBridge is built to make project collaboration easier to start and easier to manage.'
  const ctaPrimaryLabel = aboutContent.ctaPrimaryLabel || 'Explore Listings'
  const ctaPrimaryHref = aboutContent.ctaPrimaryHref || '/listings'
  const ctaSecondaryLabel = aboutContent.ctaSecondaryLabel || 'Join SkillBridge'
  const ctaSecondaryHref = aboutContent.ctaSecondaryHref || '/register'
  const showHero = aboutSectionVisibility.showHero ?? true
  const showHighlights = aboutSectionVisibility.showHighlights ?? true
  const showCta = aboutSectionVisibility.showCta ?? true
  const heroSpacing = aboutSectionSpacing.hero || DEFAULT_ABOUT_SECTION_SPACING.hero
  const highlightsSpacing = aboutSectionSpacing.highlights || DEFAULT_ABOUT_SECTION_SPACING.highlights
  const ctaSpacing = aboutSectionSpacing.cta || DEFAULT_ABOUT_SECTION_SPACING.cta

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='minimal' />

      {loading && (
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex items-center justify-center min-h-[320px]'>
            <LoadingSpinner />
          </div>
        </div>
      )}

      {!loading && error && (
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-red-700 dark:text-red-300'>{error}</div>
        </div>
      )}

      {!loading && !error && (
        <div className='relative z-10 flex flex-col gap-4 pb-20'>
          {showHero && (
            <section className={`${getSectionBackgroundClass(aboutSectionBackgrounds.hero || 'default')} relative z-10`}>
              <div className='container mx-auto px-4'>
                <AboutHero eyebrow='About SkillBridge' headline={headline} subheadline={subheadline} layout={aboutHeroBuilder} />
              </div>
            </section>
          )}

          {showHighlights && (
            <section className={`${getSectionBackgroundClass(aboutSectionBackgrounds.highlights || 'default')} relative z-10`}>
              <div className='container mx-auto px-4'>
                <AboutHighlights mission={mission} vision={vision} layout={aboutHighlightsBuilder} />
              </div>
            </section>
          )}

          {showCta && (
            <section className={`${getSectionBackgroundClass(aboutSectionBackgrounds.cta || 'default')} relative z-10`}>
              <div className='container mx-auto px-4'>
                <AboutCta
                  eyebrow={ctaEyebrow}
                  headline={ctaHeadline}
                  body={ctaBody}
                  primaryLabel={ctaPrimaryLabel}
                  primaryHref={ctaPrimaryHref}
                  secondaryLabel={ctaSecondaryLabel}
                  secondaryHref={ctaSecondaryHref}
                  layout={aboutCtaBuilder}
                />
              </div>
            </section>
          )}
        </div>
      )}
    </section>
  )
}

export default About
