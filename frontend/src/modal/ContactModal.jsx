import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaPaperPlane } from 'react-icons/fa'
import { sendMessage } from '../services/messageService'
import { toast } from 'react-toastify'

const ContactModal = ({ isOpen, onClose, project }) => {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim()) {
      toast.error('Please enter a message')
      return
    }

    try {
      setIsSubmitting(true)
      await sendMessage(project._id, project.user._id, content)
      toast.success('Message sent successfully!')
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
              <h2 className='text-2xl font-bold theme-text mb-2'>Contact Project Owner</h2>
              <p className='theme-text-secondary'>
                Send a message to{' '}
                <span className='font-semibold text-accent'>
                  {project.user?.firstName} {project.user?.lastName}
                </span>{' '}
                about "{project.title}"
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Message textarea */}
              <div>
                <label htmlFor='message' className='block mb-2 font-medium theme-text'>
                  Your Message
                </label>
                <textarea
                  id='message'
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Introduce yourself and explain your interest in this project...'
                  rows={6}
                  className='w-full px-4 py-3 rounded-lg border dark:border-light/10 border-primary/20 
                    dark:bg-light/5 bg-white theme-text focus:outline-none focus:border-accent 
                    transition-all resize-none'
                  disabled={isSubmitting}
                />
                <p className='text-sm theme-text-secondary mt-1'>{content.length} / 500 characters</p>
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
                      Send Message
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
