import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'

const ListingTabs = () => {
  const [activeTab, setActiveTab] = useState('projects')

  return (
    <div className='max-w-6xl mx-auto'>
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

      {/* Tab content container */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'
      >
        {/* Content will go here */}
      </motion.div>
    </div>
  )
}

export default ListingTabs
