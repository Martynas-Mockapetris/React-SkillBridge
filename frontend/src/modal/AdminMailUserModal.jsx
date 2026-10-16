import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage } from '../services/messageService'
import LoadingSpinner from '../components/shared/LoadingSpinner'

const AdminMailUserModal = ({ isOpen, onClose, recipient, onSent }) => {
  const [message, setMessage] = useState('')
  const [subject, setSubject] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setMessage('')
      setSubject('')
    }
  }, [isOpen])

  if (!isOpen || !recipient) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return
    try {
      setIsSubmitting(true)
      await sendMessage(recipient._id, message.trim(), subject.trim() || 'Admin Notice')
      if (onSent) onSent()
      onClose()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send admin mail')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className='w-full max-w-xl rounded-2xl theme-card border theme-border shadow-2xl' initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
          <div className='px-6 py-4 border-b theme-border flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide theme-text-muted'>Admin Mail</p>
              <h3 className='text-xl font-semibold theme-text'>
                To {recipient.firstName} {recipient.lastName}
              </h3>
            </div>
            <button onClick={onClose} className='theme-text-muted hover:theme-text text-2xl leading-none'>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-6 space-y-4'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide theme-text-secondary mb-1'>Subject</label>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='e.g. Policy reminder'
                className='w-full rounded-lg border theme-border theme-input theme-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide theme-text-secondary mb-1'>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows='6'
                placeholder='Write the notice for this user...'
                className='w-full rounded-lg border theme-border theme-input theme-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                required
              />
            </div>
            <div className='flex justify-end gap-3 border-t theme-border pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border theme-border theme-text-secondary hover:bg-white/50 dark:hover:bg-black/20 transition'>
                Cancel
              </button>
              <button
                type='submit'
                disabled={isSubmitting || !message.trim()}
                className='px-5 py-2 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 disabled:opacity-60 flex items-center justify-center gap-2'>
                {isSubmitting && <LoadingSpinner size='sm' className='border-t-2 border-white' />}
                {isSubmitting ? 'Sending…' : 'Send Mail'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

AdminMailUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  recipient: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string
  }),
  onSent: PropTypes.func
}

export default AdminMailUserModal
