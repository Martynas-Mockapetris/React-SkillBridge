import { useNavigate } from 'react-router-dom'
import PageBackground from '../shared/PageBackground'
import { getSectionSpacingClass } from './homeSectionLayout'

const HeroSection = ({ content = {}, layout = {}, sectionSpacing = {} }) => {
  const navigate = useNavigate()

  const heroTitleLead = content.heroTitleLead || 'Find Your Next'
  const heroTitleAccent = content.heroTitleAccent || 'Opportunity'
  const heroDescriptionLine1 = content.heroDescriptionLine1 || 'Connect with top talent and clients worldwide on our platform.'
  const heroDescriptionLine2 = content.heroDescriptionLine2 || 'Start your success story today.'
  const heroTalentButton = content.heroTalentButton || 'Find Talent'
  const heroWorkButton = content.heroWorkButton || 'Find Work'
  const layoutPreset = layout.layoutPreset || 'centered'
  const contentAlign = layout.contentAlign || 'center'
  const ctaLayout = layout.ctaLayout || 'stacked-mobile'
  const heroHeight = layout.heroHeight || 'screen'
  const showScrollIndicator = layout.showScrollIndicator ?? true
  const showBackgroundPattern = layout.showBackgroundPattern ?? true
  const sectionSpacingClass = getSectionSpacingClass(sectionSpacing)

  const sectionHeightClass = heroHeight === 'medium' ? 'min-h-[70vh]' : heroHeight === 'large' ? 'min-h-[85vh]' : 'h-screen'

  const contentWidthClass = layoutPreset === 'minimal' ? 'max-w-2xl' : layoutPreset === 'editorial' ? 'max-w-4xl' : layoutPreset === 'split' ? 'max-w-3xl' : 'max-w-4xl'

  const textAlignClass = contentAlign === 'left' ? 'text-left items-start' : 'text-center items-center'

  const ctaLayoutClass =
    ctaLayout === 'inline'
      ? contentAlign === 'left'
        ? 'flex flex-row flex-wrap gap-4 justify-start'
        : 'flex flex-row flex-wrap gap-4 justify-center'
      : ctaLayout === 'split'
        ? contentAlign === 'left'
          ? 'flex flex-col sm:flex-row gap-4 justify-start'
          : 'flex flex-col sm:flex-row gap-4 justify-center'
        : 'flex flex-col sm:flex-row gap-4 justify-center'

  const titleSizeClass = layoutPreset === 'editorial' ? 'text-5xl md:text-6xl lg:text-7xl' : layoutPreset === 'minimal' ? 'text-3xl md:text-4xl lg:text-5xl' : 'text-4xl md:text-5xl lg:text-6xl'

  const descriptionClass = contentAlign === 'left' ? 'theme-text-secondary text-lg md:text-xl max-w-2xl' : 'theme-text-secondary text-lg md:text-xl max-w-2xl mx-auto'

  // Nukreipimas i listings puslapi su papildoma informacija apie aktyvaus tabo busena
  const handleNavigation = (type) => {
    navigate('/listings', { state: { activeTab: type } })
  }

  return (
    <section className={`relative ${sectionHeightClass} ${sectionSpacingClass} flex items-center justify-center overflow-hidden theme-bg`}>
      {showBackgroundPattern && <PageBackground variant='home' />}

      {/* Turinio konteineris*/}
      <div className='container mx-auto px-4 md:px-6 lg:px-8 relative z-20'>
        <div className={`flex ${contentAlign === 'left' ? 'justify-start' : 'justify-center'}`}>
          <div className={`flex flex-col ${textAlignClass} space-y-6 ${contentWidthClass}`}>
            <h1 className={`${titleSizeClass} font-bold`}>
              <span className='theme-text'>{heroTitleLead}</span>
              <span className='text-accent'> {heroTitleAccent}</span>
            </h1>

            <p className={descriptionClass}>
              {heroDescriptionLine1} <br />
              {heroDescriptionLine2}
            </p>

            <div className={ctaLayoutClass}>
              <button onClick={() => handleNavigation('talent')} className='bg-accent text-light px-8 py-3 rounded-lg hover:bg-accent/70 transition-all duration-300'>
                {heroTalentButton}
              </button>
              <button onClick={() => handleNavigation('work')} className='theme-text theme-border border px-8 py-3 rounded-lg theme-hover hover:border-accent hover:text-accent transition-all duration-300'>
                {heroWorkButton}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indikatorius */}
      {showScrollIndicator && (
        <div className='absolute bottom-8 transform -translate-x-1/2 animate-bounce'>
          <div className='w-8 h-12 rounded-full border-2 dark:border-light/50 border-primary/50 flex items-start justify-center p-2'>
            <div className='w-1 h-3 rounded-full dark:bg-light/50 bg-primary/50'></div>
          </div>
        </div>
      )}
    </section>
  )
}

export default HeroSection
