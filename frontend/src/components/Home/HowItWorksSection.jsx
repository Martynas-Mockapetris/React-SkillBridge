import { motion } from 'framer-motion'
import { useState } from 'react'
import PropTypes from 'prop-types'
import { FaUser, FaBriefcase, FaUserCircle, FaSearch, FaHandshake, FaFileAlt, FaUserCheck, FaCheckCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import molecularPattern from '../../assets/molecular-pattern.svg'
import { getSectionBackgroundClass, getSectionSpacingClass } from './homeSectionLayout'

const HowItWorksSection = ({ content = {}, layout = {} }) => {
  const { t } = useTranslation('main')
  const [activeTab, setActiveTab] = useState('talent')
  const stepIcons = {
    userCircle: <FaUserCircle size={40} />,
    search: <FaSearch size={40} />,
    handshake: <FaHandshake size={40} />,
    fileAlt: <FaFileAlt size={40} />,
    userCheck: <FaUserCheck size={40} />,
    checkCircle: <FaCheckCircle size={40} />
  }

  const howTitleLead = t('howItWorks.titleLead')
  const howTitleAccent = t('howItWorks.titleAccent')
  const howSubtitle = t('howItWorks.subtitle')
  const talentTabLabel = t('howItWorks.talentTab')
  const clientTabLabel = t('howItWorks.clientTab')
  const sectionSpacingClass = getSectionSpacingClass(layout.spacing || {})
  const sectionBackgroundClass = getSectionBackgroundClass(layout.background || 'default')

  // Create translated steps arrays
  const talentSteps = [
    { number: '01', titleKey: 'talentSteps.step1Title', descKey: 'talentSteps.step1Desc', iconKey: 'userCircle' },
    { number: '02', titleKey: 'talentSteps.step2Title', descKey: 'talentSteps.step2Desc', iconKey: 'search' },
    { number: '03', titleKey: 'talentSteps.step3Title', descKey: 'talentSteps.step3Desc', iconKey: 'handshake' }
  ]

  const clientSteps = [
    { number: '01', titleKey: 'clientSteps.step1Title', descKey: 'clientSteps.step1Desc', iconKey: 'fileAlt' },
    { number: '02', titleKey: 'clientSteps.step2Title', descKey: 'clientSteps.step2Desc', iconKey: 'userCheck' },
    { number: '03', titleKey: 'clientSteps.step3Title', descKey: 'clientSteps.step3Desc', iconKey: 'checkCircle' }
  ]

  return (
    <section className={`w-full ${sectionSpacingClass} ${sectionBackgroundClass} relative z-[1]`}>
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        {/* Didelis */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[550px] h-[550px] rotate-[25deg]' />
        </div>
        {/* Vidutiniai */}
        <div className='absolute -left-20 top-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute right-0 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        {/* Mazi */}
        <div className='absolute left-1/4 top-0 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/4 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Sekcijos antraste */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>{howTitleLead}</span>
            <span className='text-accent'> {howTitleAccent}</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto mb-12'>{howSubtitle}</p>

          {/* Tabu mygtukai ir konteineris */}
          <div className='max-w-6xl mx-auto'>
            <div className='flex w-full'>
              <button
                onClick={() => setActiveTab('talent')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === 'talent'
                    ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                    : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
                }`}>
                <FaUser className='text-lg' />
                <span className='font-medium'>{talentTabLabel}</span>
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === 'client'
                    ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                    : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
                }`}>
                <FaBriefcase className='text-lg' />
                <span className='font-medium'>{clientTabLabel}</span>
              </button>
            </div>

            {/* Turinys su subtiliu fonu */}
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: activeTab === 'talent' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: activeTab === 'talent' ? 20 : -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
              <motion.div key={activeTab} className='grid grid-cols-1 md:grid-cols-3 gap-12 relative'>
                {(activeTab === 'talent' ? talentSteps : clientSteps).map((step, index) => (
                  <motion.div key={index} className='relative' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <div className='hidden md:block absolute top-28 left-0 w-full h-[1px] bg-accent/20' />

                    {/* Ikona */}
                    <div className='flex flex-col items-center mb-6'>
                      <div className='bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 p-6 rounded-full mb-4 hover:scale-105 transition-all duration-300'>
                        <div className='text-accent'>{stepIcons[step.iconKey]}</div>
                      </div>
                    </div>

                    {/* Turinys */}
                    <div className='text-center'>
                      <h3 className='text-xl font-semibold theme-text mb-2'>
                        <span className='text-3xl font-bold text-accent mr-2'>{step.number}</span>
                        {t(step.titleKey)}
                      </h3>
                      <p className='theme-text-secondary'>{t(step.descKey)}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}

HowItWorksSection.propTypes = {
  content: PropTypes.shape({
    howTitleLead: PropTypes.string,
    howTitleAccent: PropTypes.string,
    howSubtitle: PropTypes.string,
    talentTabLabel: PropTypes.string,
    clientTabLabel: PropTypes.string
  }),
  layout: PropTypes.shape({
    spacing: PropTypes.object,
    background: PropTypes.string
  })
}

export default HowItWorksSection
