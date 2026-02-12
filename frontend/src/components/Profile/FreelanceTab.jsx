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
  const [editingAnnouncement, setEditingAnnouncement] = useState(null)

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

  const handleEditAnnouncement = (announcement) => {
    setEditingAnnouncement(announcement)
    setIsModalOpen(true)
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
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            {announcements.map((announcement, index) => (
              <motion.div
                key={announcement._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{
                  scale: 1.02,
                  transition: { duration: 0.1 }
                }}
                transition={{ duration: 0.2, delay: index * 0.1 }}
                className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm'>
                {/* Title Section */}
                <div className='flex items-start gap-4 mb-4'>
                  <div className='flex-1'>
                    <h3 className='flex text-xl font-bold mb-2 theme-text'>{announcement.title}</h3>
                    <div className='flex gap-2 flex-wrap'>
                      {announcement.skills.slice(0, 2).map((skill, idx) => (
                        <span key={idx} className='inline-block px-2 py-1 rounded-full text-xs font-medium bg-accent/20 text-accent'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Rate Section */}
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center gap-1'>
                    <span className='font-medium theme-text'>Hourly Rate</span>
                  </div>
                  <span className='font-bold text-accent text-lg'>€{announcement.hourlyRate}/hr</span>
                </div>

                {/* Background Section */}
                <div className='flex items-center gap-2 theme-text-secondary text-sm line-clamp-2'>
                  <span>{announcement.background}</span>
                </div>

                {/* Status Badge */}
                <div className='mt-4 flex items-center justify-between'>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      announcement.isActive ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                    {announcement.isActive ? '● Active' : '○ Paused'}
                  </span>
                  <div className='flex gap-2'>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleEditAnnouncement(announcement)}
                      className='p-1.5 rounded text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors'>
                      <FaEdit size={14} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteAnnouncement(announcement._id)}
                      className='p-1.5 rounded text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors'>
                      <FaTrash size={14} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Create Announcement Modal */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingAnnouncement(null)
        }}
        editingAnnouncement={editingAnnouncement}
        onAnnouncementCreated={(updatedAnnouncement) => {
          if (editingAnnouncement) {
            // Update existing announcement
            setAnnouncements(announcements.map((a) => (a._id === updatedAnnouncement._id ? updatedAnnouncement : a)))
            setEditingAnnouncement(null)
          } else {
            // Add new announcement
            setAnnouncements([updatedAnnouncement, ...announcements])
          }
        }}
      />
    </motion.div>
  )
}

export default FreelanceTab
