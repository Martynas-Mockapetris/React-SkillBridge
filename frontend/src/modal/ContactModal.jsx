import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaPaperPlane } from 'react-icons/fa'
import { sendMessage } from '../services/messageService'
import { toast } from 'react-toastify'

const ContactModal = ({ isOpen, onClose, project, hasApplied = false }) => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const hasApplied =
    Array.isArray(project?.interestedUsers) &&
    project.interestedUsers.some((entry) => {
      const userId = entry?.userId?._id || entry?.userId
      return userId?.toString() === project?.currentViewerId?.toString()
    })

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      setIsSubmitting(true)
      await sendMessage(project.user._id, content, null, project._id)
      toast.success(hasApplied ? 'Proposal preview updated successfully!' : 'Application sent successfully!')
      setContent('')
      onClose()
    } catch (error) {
      console.error('Error sending message:', error)
      if (error.response?.status === 401) {
        toast.error('Please login to send messages')
      } else {
        toast.error(error.response?.data?.message || 'Failed to send message')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className='absolute inset-0 bg-black/50 backdrop-blur-sm' />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className='relative w-full max-w-lg theme-card rounded-lg p-6 shadow-2xl'>
            {/* Close button */}
            <button onClick={onClose} className='absolute top-4 right-4 p-2 rounded-lg hover:bg-accent/10 transition-all'>
              <FaTimes className='text-xl theme-text-secondary hover:text-accent' />
            </button>

            {/* Header */}
            <div className='mb-6'>
              <h2 className='text-2xl font-bold theme-text mb-2'>{hasApplied ? 'Send a Follow-up Message' : 'Apply for This Project'}</h2>
              <p className='theme-text-secondary'>
                {hasApplied ? 'Send an updated note to' : 'Send your introduction and project interest to'}{' '}
                <span className='font-semibold text-accent'>
                  {project.user?.firstName} {project.user?.lastName}
                </span>{' '}
                {hasApplied ? `about "${project.title}". Your latest message will refresh the proposal preview shown during assignment.` : `for "${project.title}"`}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Message textarea */}
              <div>
                <label htmlFor='message' className='block mb-2 font-medium theme-text'>
                  {hasApplied ? 'Your Updated Proposal Note' : 'Your Introduction'}
                </label>
                <textarea
                  id='message'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Introduce yourself, share relevant experience, and explain why you are a good fit for this project...'
                  rows={6}
                  className='w-full px-4 py-3 rounded-lg border dark:border-light/10 border-primary/20 
                    dark:bg-light/5 bg-white theme-text focus:outline-none focus:border-accent 
                    transition-all resize-none'
                  disabled={isSubmitting}
                />
                <p className='text-sm theme-text-secondary mt-1'>{content.length} / 500 characters</p>
                <p className='text-xs theme-text-muted mt-2'>
                  {hasApplied ? 'Sending this message updates the proposal preview the client sees when reviewing applicants.' : 'Sending this message also registers your interest in the project for the client.'}
                </p>
              </div>

              {/* Buttons */}
              <div className='flex gap-3'>
                <button
                  type='button'
                  onClick={onClose}
                  disabled={isSubmitting}
                  className='flex-1 py-3 rounded-lg border-2 border-accent text-accent 
                    hover:bg-accent/10 transition-all disabled:opacity-50'>
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting || !content.trim()}
                  className='flex-1 py-3 rounded-lg bg-accent text-white hover:bg-accent/90 
                    transition-all disabled:opacity-50 disabled:cursor-not-allowed 
                    flex items-center justify-center gap-2'>
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent' />
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane />
                      {hasApplied ? 'Update Application' : 'Send Application'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ContactModal
