import { useEffect, useMemo, useState } from 'react'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import AboutHero from '../components/About/AboutHero'
import AboutHighlights from '../components/About/AboutHighlights'
import AboutCta from '../components/About/AboutCta'
import { getPublicSystemConfig } from '../services/configService'

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

  const headline = aboutContent.headline || 'Build your freelance career with confidence'
  const subheadline = aboutContent.subheadline || 'Connect clients and freelancers in one place'
  const mission = aboutContent.mission || 'SkillBridge helps people find the right collaboration faster. We bring serious clients and capable freelancers into one workflow that feels clear, practical, and trustworthy.'
  const vision = aboutContent.vision || 'We want project collaboration to feel simpler: fewer dead ends, better matches, stronger communication, and a platform that scales with both independent talent and growing teams.'

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='minimal' />

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        {loading && (
          <div className='flex items-center justify-center min-h-[320px]'>
            <LoadingSpinner />
          </div>
        )}

        {!loading && error && <div className='rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 px-5 py-4 text-red-700 dark:text-red-300'>{error}</div>}

        {!loading && !error && (
          <div className='space-y-10'>
            <AboutHero eyebrow='About SkillBridge' headline={headline} subheadline={subheadline} />
            <AboutHighlights mission={mission} vision={vision} />
            <AboutCta />
          </div>
        )}
      </div>
    </section>
  )
}

export default About
