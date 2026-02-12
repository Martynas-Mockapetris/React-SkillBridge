import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaBriefcase, FaPlus, FaEdit, FaTrash } from 'react-icons/fa'
import CreateAnnouncementModal from '../../modal/CreateAnnouncementModal'
import { getUserAnnouncements, deleteAnnouncement } from '../../services/announcementService'

const FreelanceTab = ({ user }) => {
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch announcements when component mounts
  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError('')
      const data = await getUserAnnouncements()
      setAnnouncements(data)
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAnnouncement = async (announcementId) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await deleteAnnouncement(announcementId)
        setAnnouncements(announcements.filter((a) => a._id !== announcementId))
      } catch (err) {
        console.error('Error deleting announcement:', err)
        setError('Failed to delete announcement')
      }
    }
  }

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
        {loading ? (
          <div className='flex justify-center py-8'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
          </div>
        ) : error ? (
          <div className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg'>{error}</div>
        ) : announcements.length === 0 ? (
          <div className='space-y-4 text-center'>
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
          <div className='space-y-4'>
            {announcements.map((announcement) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className='theme-card p-6 rounded-lg border dark:border-light/10 border-primary/10 hover:shadow-md transition-shadow'>
                {/* Announcement Header */}
                <div className='flex justify-between items-start mb-3'>
                  <div>
                    <h3 className='text-lg font-semibold theme-text'>{announcement.title}</h3>
                    <p className='text-accent font-bold text-lg'>€{announcement.hourlyRate}/hr</p>
                  </div>
                  <div className='flex gap-2'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className='p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors'>
                      <FaEdit />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className='p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors'>
                      <FaTrash />
                    </motion.button>
                  </div>
                </div>

                {/* Skills */}
                <div className='mb-3'>
                  <p className='text-sm font-semibold theme-text-secondary mb-2'>Skills:</p>
                  <div className='flex flex-wrap gap-2'>
                    {announcement.skills.map((skill, idx) => (
                      <span key={idx} className='bg-accent/10 text-accent px-3 py-1 rounded-full text-sm font-medium'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Background */}
                <p className='theme-text-secondary text-sm'>{announcement.background}</p>

                {/* Status */}
                <div className='mt-3 flex items-center gap-2'>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      announcement.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                    }`}>
                    {announcement.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnnouncementCreated={(newAnnouncement) => {
          setAnnouncements([newAnnouncement, ...announcements])
        }}
      />{' '}
    </motion.div>
  )
}

export default FreelanceTab
