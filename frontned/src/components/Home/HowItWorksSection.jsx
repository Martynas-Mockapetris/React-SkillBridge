import { motion } from 'framer-motion'
import { useState } from 'react'
import {
  FaUser,
  FaBriefcase,
  // Talent icons
  FaUserCircle,
  FaSearch,
  FaHandshake,
  // Client icons
  FaFileAlt,
  FaUserCheck,
  FaCheckCircle
} from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'

const HowItWorksSection = () => {
  const [activeTab, setActiveTab] = useState('talent')

  const talentSteps = [
    {
      number: '01',
      title: 'Create Profile',
      description: 'Set up your professional profile highlighting your skills and experience',
      icon: <FaUserCircle size={40} />
    },
    {
      number: '02',
      title: 'Browse Opportunities',
      description: 'Explore curated projects that match your expertise and interests',
      icon: <FaSearch size={40} />
    },
    {
      number: '03',
      title: 'Start Working',
      description: 'Connect with clients and begin your successful collaboration',
      icon: <FaHandshake size={40} />
    }
  ]

  const clientSteps = [
    {
      number: '01',
      title: 'Post Project',
      description: 'Share your project details and requirements with our talented community',
      icon: <FaFileAlt size={40} />
    },
    {
      number: '02',
      title: 'Review Candidates',
      description: 'Browse through qualified professionals and select the perfect match',
      icon: <FaUserCheck size={40} />
    },
    {
      number: '03',
      title: 'Hire Talent',
      description: 'Start collaborating with your chosen professional on your project',
      icon: <FaCheckCircle size={40} />
    }
  ]

  return (
    <section className='relative py-20 bg-primary overflow-hidden'>
      {/* Molecular patternas */}
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

      <div className='container mx-auto px-4 relative z-10'>
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

            {/* Turinys su subtiliu fonu */}
            <motion.div key={activeTab} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className='bg-gradient-to-b from-light/5 to-light/[0.02] rounded-b-lg p-12'>
              <motion.div key={activeTab} className='grid grid-cols-1 md:grid-cols-3 gap-12 relative'>
                {(activeTab === 'talent' ? talentSteps : clientSteps).map((step, index) => (
                  <motion.div key={index} className='relative' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
                    <div className='hidden md:block absolute top-28 left-0 w-full h-[1px] bg-accent/20' />

                    {/* Ikona */}
                    <div className='flex flex-col items-center mb-6'>
                      <div className='bg-gradient-to-br from-light/10 to-light/5 p-6 rounded-full mb-4 hover:scale-105 transition-all duration-300'>
                        <div className='text-accent'>{step.icon}</div>
                      </div>
                    </div>

                    {/* Turinys */}
                    <div className='text-center'>
                      <h3 className='text-xl font-semibold text-light mb-2'>
                        <span className='text-3xl font-bold text-accent mr-2'>{step.number}</span>
                        {step.title}
                      </h3>
                      <p className='text-light/80'>{step.description}</p>
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

export default HowItWorksSection
