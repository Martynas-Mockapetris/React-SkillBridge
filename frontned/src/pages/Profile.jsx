import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaProjectDiagram, FaCog, FaLock } from 'react-icons/fa'
import ProfileStats from '../components/Profile/ProfileStats'
import ProjectsList from '../components/Profile/ProjectsList'
import ProfileSettings from '../components/Profile/ProfileSettings'
import SecuritySettings from '../components/Profile/SecuritySettings'
import molecularPattern from '../assets/molecular-pattern.svg'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    { id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> },
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaLock /> }
  ]

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      {/* Molecular patterns */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-20 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[500px] h-[500px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-50deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        {/* Profile Header */}
        <motion.div className='flex items-center gap-6 mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className='w-24 h-24 rounded-full overflow-hidden border-4 border-accent' whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <img src='https://i.pravatar.cc/150?img=1' alt='Profile' className='w-full h-full object-cover' onError={(e) => (e.target.src = '/default-avatar.png')} />
          </motion.div>
          <div>
            <h1 className='text-3xl font-bold theme-text'>John Doe</h1>
            <p className='theme-text-secondary'>Full Stack Developer</p>
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div className='flex flex-wrap gap-2 border-b dark:border-light/10 border-primary/10 mb-8' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-6 transition-all duration-300 ${activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'theme-text-secondary hover:text-accent'}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}>
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode='wait'>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {activeTab === 'overview' && <ProfileStats />}
            {activeTab === 'projects' && <ProjectsList />}
            {activeTab === 'settings' && <ProfileSettings />}
            {activeTab === 'security' && <SecuritySettings />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Profile
