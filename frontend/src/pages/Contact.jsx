import { useEffect, useMemo, useState } from 'react'
import ContactSection from '../components/Home/ContactSection'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { getPublicSystemConfig } from '../services/configService'

const Contact = () => {
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
        console.error('Failed to load Contact page config:', err)
        setError(err.response?.data?.message || 'Failed to load Contact page.')
      } finally {
        setLoading(false)
      }
    }

    loadConfig()
  }, [])

  const homeContent = useMemo(() => {
    if (!publicConfig?.home?.enabled) return {}
    return publicConfig.home.values || {}
  }, [publicConfig])

  const contactValues = useMemo(() => {
    if (!publicConfig?.contact?.enabled) return {}
    return publicConfig.contact.values || {}
  }, [publicConfig])

  const contactLayout = useMemo(() => {
    if (!publicConfig?.siteBuilder?.enabled) {
      return {
        spacing: {},
        background: 'default'
      }
    }

    return {
      spacing: publicConfig.siteBuilder.values?.homeSectionSpacing?.contact || {},
      background: publicConfig.siteBuilder.values?.homeSectionBackgrounds?.contact || 'default'
    }
  }, [publicConfig])

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
        <div className='relative z-10 pb-20'>
          <ContactSection content={homeContent} contactValues={contactValues} layout={contactLayout} />
        </div>
      )}
    </section>
  )
}

export default Contact
