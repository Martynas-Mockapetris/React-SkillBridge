import { motion } from 'framer-motion'
import { useState } from 'react'
import { FaUser, FaBriefcase } from 'react-icons/fa'

const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState('talent')

  const talentSteps = [
    {
      number: '01',
      title: 'Create Profile',
      description: 'Set up your professional profile highlighting your skills and experience'
    },
    {
      number: '02',
      title: 'Browse Opportunities',
      description: 'Explore curated projects that match your expertise and interests'
    },
    {
      number: '03',
      title: 'Start Working',
      description: 'Connect with clients and begin your successful collaboration'
    }
  ]

  const clientSteps = [
    {
      number: '01',
      title: 'Post Project',
      description: 'Share your project details and requirements with our talented community'
    },
    {
      number: '02',
      title: 'Review Candidates',
      description: 'Browse through qualified professionals and select the perfect match'
    },
    {
      number: '03',
      title: 'Hire Talent',
      description: 'Start collaborating with your chosen professional on your project'
    }
  ]

  return (
    <section className='py-20 bg-primary'>
      <div className='container mx-auto px-4'>
        {/* Sekcijos antraste */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>How</span>
            <span className='text-accent'> It Works</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Choose your path and discover how SkillBridge works for you</p>

          {/* Tabu mygtukai ir konteineris */}
          <div className='max-w-6xl mx-auto'>
            <div className='flex w-full'>
              <button
                onClick={() => setActiveTab('talent')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === 'talent' ? 'border-accent text-accent bg-light/5' : 'border-light/10 text-light/60 hover:text-light/80 hover:bg-light/5'
                }`}>
                <FaUser className='text-lg' />
                <span className='font-medium'>For Talent</span>
              </button>
              <button
                onClick={() => setActiveTab('client')}
                className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                  activeTab === 'client' ? 'border-accent text-accent bg-light/5' : 'border-light/10 text-light/60 hover:text-light/80 hover:bg-light/5'
                }`}>
                <FaBriefcase className='text-lg' />
                <span className='font-medium'>For Clients</span>
              </button>
            </div>

            {/* Turinys su fonu */}
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className='bg-gradient-to-b from-light/5 to-light/[0.02] rounded-b-lg p-12'>
              {/* Zingsniai */}
              <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} className='grid grid-cols-1 md:grid-cols-3 gap-16'>
                {(activeTab === 'talent' ? talentSteps : clientSteps).map((step, index) => (
                  <motion.div key={index} className='text-center' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <div className='text-4xl font-bold text-accent mb-4'>{step.number}</div>
                    <h3 className='text-xl font-semibold text-light mb-2'>{step.title}</h3>
                    <p className='text-light/80'>{step.description}</p>
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

export default HowItWorksSection
