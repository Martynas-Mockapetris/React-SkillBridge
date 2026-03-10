import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { sendMessage } from '../services/messageService'

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
        <motion.div
          className='w-full max-w-xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl'
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}>
          <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>Admin Mail</p>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                To {recipient.firstName} {recipient.lastName}
              </h3>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none'>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-6 space-y-4'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>Subject</label>
              <input
                type='text'
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder='e.g. Policy reminder'
                className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows='6'
                placeholder='Write the notice for this user...'
                className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                required
              />
            </div>
            <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                Cancel
              </button>
              <button type='submit' disabled={isSubmitting || !message.trim()} className='px-5 py-2 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 disabled:opacity-60'>
                {isSubmitting ? 'Sending…' : 'Send Mail'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminMailUserModal
