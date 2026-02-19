import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaCheck, FaPaperPlane } from 'react-icons/fa'
import { sendMessage } from '../services/messageService'
import { toast } from 'react-toastify'

const DirectContactModal = ({ isOpen, onClose, freelancer }) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.subject.trim()) {
      setError('Subject is required')
      return false
    }

    if (formData.subject.trim().length < 3) {
      setError('Subject must be at least 3 characters')
      return false
    }

    if (!formData.content.trim()) {
      setError('Message is required')
      return false
    }

    if (formData.content.trim().length < 10) {
      setError('Message must be at least 10 characters')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      await sendMessage(freelancer._id, formData.content.trim(), formData.subject.trim())

      setSuccess(true)

      setTimeout(() => {
        setFormData({
          subject: '',
          content: ''
        })
        setSuccess(false)
        toast.success('Message sent successfully!')
        onClose()
      }, 1500)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message')
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setFormData({
        subject: '',
        content: ''
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
                <h2 className='text-2xl font-bold theme-text'>
                  Contact {freelancer.firstName} {freelancer.lastName}
                </h2>
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
                    <span>Message sent successfully!</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg'>
                    {error}
                  </motion.div>
                )}

                {/* Subject Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Subject</label>
                  <input
                    type='text'
                    name='subject'
                    value={formData.subject}
                    onChange={handleInputChange}
                    placeholder='e.g., Project Inquiry, Collaboration Opportunity'
                    disabled={loading}
                    maxLength={200}
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all disabled:opacity-50'
                  />
                  <p className='text-xs theme-text-secondary mt-1'>{formData.subject.length} / 200 characters</p>
                </div>

                {/* Message Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Your Message</label>
                  <textarea
                    name='content'
                    value={formData.content}
                    onChange={handleInputChange}
                    placeholder='Introduce yourself and tell the freelancer about your project or inquiry...'
                    disabled={loading}
                    rows='6'
                    maxLength={2000}
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-light/10 border-primary/10 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none disabled:opacity-50'
                  />
                  <p className='text-xs theme-text-secondary mt-1'>{formData.content.length} / 2000 characters</p>
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
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaPaperPlane />
                        Send Message
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

export default DirectContactModal
