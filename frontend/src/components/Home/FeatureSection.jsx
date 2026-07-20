import { FaHandshake, FaShieldAlt, FaRocket, FaChartLine, FaClock, FaGlobe } from 'react-icons/fa'
import { motion } from 'framer-motion'
import molecularPattern from '../../assets/molecular-pattern.svg'
import { HOME_FEATURES } from '../../constants/homePageData'
import { getSectionBackgroundClass, getSectionSpacingClass } from './homeSectionLayout'

const FeaturesSection = ({ content = {}, systemValues = {}, layout = {} }) => {
  const featureIcons = {
    handshake: <FaHandshake size={24} />,
    shieldAlt: <FaShieldAlt size={24} />,
    rocket: <FaRocket size={24} />,
    chartLine: <FaChartLine size={24} />,
    clock: <FaClock size={24} />,
    globe: <FaGlobe size={24} />
  }

  const platformName = systemValues.platformName || 'SkillBridge'
  const featuresTitleLead = content.featuresTitleLead || 'Why Choose'
  const featuresTitleAccent = content.featuresTitleAccent || platformName
  const featuresSubtitle = content.featuresSubtitle || `Discover the advantages that make ${platformName} the preferred platform for connecting talent with opportunities`
  const sectionSpacingClass = getSectionSpacingClass(layout.spacing || {})
  const sectionBackgroundClass = getSectionBackgroundClass(layout.background || 'default')

  return (
    <section className={`w-full ${sectionSpacingClass} ${sectionBackgroundClass} relative z-[1]`}>
      {/* Molecular patterns */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-20 top-0 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[600px] h-[600px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-0 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-45deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Section header */}
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>{featuresTitleLead}</span>
            <span className='text-accent'> {featuresTitleAccent}</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto'>{featuresSubtitle}</p>
        </motion.div>

        {/* Features grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {HOME_FEATURES.map((feature, index) => (
            <motion.div
              key={index}
              className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm p-6 rounded-lg'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
              transition={{ duration: 0.3, delay: index * 0.05 }}>
              <div className='text-accent mb-4'>{featureIcons[feature.iconKey]}</div>
              <h3 className='theme-text text-xl font-semibold mb-2'>{feature.title}</h3>
              <p className='theme-text-secondary'>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
