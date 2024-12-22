import { FaHandshake, FaShieldAlt, FaRocket, FaChartLine, FaClock, FaGlobe } from 'react-icons/fa'
import { motion } from 'framer-motion'
import molecularPattern from '../../assets/molecular-pattern.svg'

const FeaturesSection = () => {
  // Korteles su informacija
  const features = [
    {
      icon: <FaHandshake size={24} />,
      title: 'Professional Network',
      description: 'Connect with industry experts and build meaningful professional relationships'
    },
    {
      icon: <FaRocket size={24} />,
      title: 'Quality Projects',
      description: 'Access hand-picked opportunities that match your expertise'
    },
    {
      icon: <FaChartLine size={24} />,
      title: 'Skill Development',
      description: 'Grow your expertise through real-world projects and experiences'
    },
    {
      icon: <FaClock size={24} />,
      title: 'Flexible Work',
      description: 'Choose projects that fit your schedule and work preferences'
    },
    {
      icon: <FaGlobe size={24} />,
      title: 'Global Opportunities',
      description: 'Access projects and talent from around the world'
    },
    {
      icon: <FaShieldAlt size={24} />,
      title: 'Verified Reviews',
      description: 'Make informed decisions with authentic feedback and ratings'
    }
  ]

  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
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
            <span className='text-light'>Why Choose</span>
            <span className='text-accent'> SkillBridge</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto'>Discover the advantages that make SkillBridge the preferred platform for connecting talent with opportunities</p>
        </motion.div>

        {/* Features grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className='bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent backdrop-blur-sm p-6 rounded-lg'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              whileHover={{
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
              }}
              transition={{ duration: 0.3 }}>
              <div className='text-accent mb-4'>{feature.icon}</div>
              <h3 className='text-light text-xl font-semibold mb-2'>{feature.title}</h3>
              <p className='text-light/80'>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
