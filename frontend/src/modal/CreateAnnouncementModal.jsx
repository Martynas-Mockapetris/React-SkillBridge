import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { createAnnouncement, updateAnnouncement } from '../services/announcementService'

const CreateAnnouncementModal = ({ isOpen, onClose, onAnnouncementCreated, editingAnnouncement }) => {
  const isEditMode = !!editingAnnouncement
  // Form state
  const [formData, setFormData] = useState({
    title: editingAnnouncement?.title || '',
    hourlyRate: editingAnnouncement?.hourlyRate || '',
    skills: editingAnnouncement?.skills?.join(', ') || '',
    background: editingAnnouncement?.background || ''
  })

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    // Clear error when user starts typing
    if (error) setError('')
  }

  // Validate form
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required')
      return false
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters')
      return false
    }

    if (!formData.hourlyRate || formData.hourlyRate <= 0) {
      setError('Hourly rate must be greater than 0')
      return false
    }

    if (!formData.skills.trim()) {
      setError('At least one skill is required')
      return false
    }

    if (!formData.background.trim()) {
      setError('Background/experience is required')
      return false
    }

    if (formData.background.trim().length < 10) {
      setError('Background must be at least 10 characters')
      return false
    }

    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validate before submitting
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      // Parse skills from comma-separated string to array
      const skillsArray = formData.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter((skill) => skill.length > 0)

      // Prepare data for API
      const announcementData = {
        title: formData.title.trim(),
        hourlyRate: parseFloat(formData.hourlyRate),
        skills: skillsArray,
        background: formData.background.trim()
      }

      // Submit to backend - create or update
      let response
      if (isEditMode) {
        response = await updateAnnouncement(editingAnnouncement._id, announcementData)
      } else {
        response = await createAnnouncement(announcementData)
      }

      // Show success message
      setSuccess(true)

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setFormData({
          title: '',
          hourlyRate: '',
          skills: '',
          background: ''
        })
        setSuccess(false)

        // Call callback to refresh announcements list
        if (onAnnouncementCreated) {
          onAnnouncementCreated(response)
        }

        // Close modal
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create announcement')
      setLoading(false)
    }
  }

  // Handle close button
  const handleClose = () => {
    if (!loading) {
      setFormData({
        title: editingAnnouncement?.title || '',
        hourlyRate: editingAnnouncement?.hourlyRate || '',
        skills: editingAnnouncement?.skills?.join(', ') || '',
        background: editingAnnouncement?.background || ''
      })
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40' />

          {/* Modal */}
          <motion.div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <motion.div
              className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto'
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b dark:border-light/10 border-primary/10 sticky top-0 bg-inherit rounded-t-lg'>
                <h2 className='text-2xl font-bold theme-text'>Create Announcement</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  disabled={loading}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50'>
                  <FaTimes size={24} />
                </motion.button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                {/* Success Message */}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg'>
                    <FaCheck />
                    <span>Announcement created successfully!</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg'>
                    {error}
                  </motion.div>
                )}

                {/* Title Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Announcement Title</label>
                  <input
                    type='text'
                    name='title'
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder='e.g., Senior React Developer Available'
                    disabled={loading}
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50'
                  />
                </div>

                {/* Hourly Rate Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Hourly Rate (€)</label>
                  <input
                    type='number'
                    name='hourlyRate'
                    value={formData.hourlyRate}
                    onChange={handleInputChange}
                    placeholder='e.g., 50'
                    min='1'
                    step='0.5'
                    disabled={loading}
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50'
                  />
                </div>

                {/* Skills Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Skills (comma-separated)</label>
                  <input
                    type='text'
                    name='skills'
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder='e.g., React, JavaScript, Node.js, MongoDB'
                    disabled={loading}
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50'
                  />
                  <p className='text-xs theme-text-secondary mt-1'>Separate skills with commas</p>
                </div>

                {/* Background Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Background & Experience</label>
                  <textarea
                    name='background'
                    value={formData.background}
                    onChange={handleInputChange}
                    placeholder='Describe your experience, specialties, and what you offer...'
                    disabled={loading}
                    rows='4'
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none disabled:opacity-50'
                  />
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                  <motion.button
                    type='button'
                    onClick={handleClose}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg theme-text hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'>
                    Cancel
                  </motion.button>

                  <motion.button
                    type='submit'
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-white'></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaCheck />
                        {isEditMode ? 'Update Announcement' : 'Create Announcement'}
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default CreateAnnouncementModal
