import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaBriefcase, FaPlus } from 'react-icons/fa'
import CreateAnnouncementModal from '../../modal/CreateAnnouncementModal'

const FreelanceTab = ({ user }) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Announcements state - will be populated with real data in next step
  const [announcements, setAnnouncements] = useState([])

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className='space-y-6'>
      {/* Header with Create Announcement Button */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <FaBriefcase className='text-accent text-xl' />
          <h2 className='text-2xl font-bold theme-text'>My Freelance Announcements</h2>
        </div>
        <motion.button
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors'>
          <FaPlus />
          <span>Create Announcement</span>
        </motion.button>
      </div>
      {/* Announcements List or Empty State */}
      <div className='theme-card p-8 rounded-lg text-center'>
        {announcements.length === 0 ? (
          <div className='space-y-4'>
            <FaBriefcase className='text-5xl text-gray-300 dark:text-gray-600 mx-auto' />
            <p className='theme-text-secondary text-lg'>No announcements yet. Create your first freelance announcement to get started!</p>
            <motion.button
              onClick={() => setIsModalOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className='inline-flex items-center gap-2 bg-accent text-white px-6 py-3 rounded-lg hover:bg-accent/90 transition-colors'>
              <FaPlus />
              <span>Create Your First Announcement</span>
            </motion.button>
          </div>
        ) : (
          <div className='space-y-4'>{/* Announcements will be rendered here */}</div>
        )}
      </div>
      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnnouncementCreated={(newAnnouncement) => {
          setAnnouncements((prev) => [...prev, newAnnouncement])
        }}
      />{' '}
    </motion.div>
  )
}

export default FreelanceTab
