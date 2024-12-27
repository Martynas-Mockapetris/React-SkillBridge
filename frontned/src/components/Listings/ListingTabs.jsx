import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'

const ListingTabs = () => {
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <section className='w-full py-32 theme-bg relative z-[2] mt-[-100px]'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Molecular patterns */}
        <div className='absolute -left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute -right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        <div className='absolute left-1/4 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/3 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-8xl mx-auto'>
          <div className='flex w-full'>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaBriefcase className='text-lg' />
              <span className='font-medium'>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('freelancers')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'freelancers'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaUser className='text-lg' />
              <span className='font-medium'>Freelancers</span>
            </button>
          </div>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
            {/* Content will go here */}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ListingTabs
