import { motion, AnimatePresence } from 'framer-motion'
import { FaCheckCircle, FaTimes } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useState } from 'react'

const ProjectCompletionModal = ({ isOpen, project, onClose, onComplete }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMarkComplete = async () => {
    if (!project) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${project._id}/complete`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      toast.success('Project marked as complete!')
      
      if (onComplete) {
        onComplete(result.data)
      }
      
      onClose()
    } catch (err) {
      toast.error(`Error completing project: ${err.message}`)
      console.error('Error marking project complete:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className='fixed inset-0 bg-black/50 z-40'
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className='fixed inset-0 flex items-center justify-center z-50 p-4'>
            <motion.div className='bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border dark:border-gray-800'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center'>
                    <FaCheckCircle className='text-green-600 dark:text-green-400 text-xl' />
                  </div>
                  <h2 className='text-xl font-bold theme-text'>Mark Complete?</h2>
                </div>
                <motion.button
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'>
                  <FaTimes />
                </motion.button>
              </div>

              {/* Content */}
              <div className='mb-6'>
                <h3 className='font-semibold theme-text mb-2'>{project?.title}</h3>
                <p className='theme-text-secondary text-sm mb-4'>
                  Are you sure you want to mark this project as complete? This action:
                </p>
                <ul className='space-y-2 text-sm theme-text-secondary'>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 dark:text-green-400 font-bold'>✓</span>
                    <span>Sets project status to completed</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 dark:text-green-400 font-bold'>✓</span>
                    <span>Records completion timestamp</span>
                  </li>
                  <li className='flex items-start gap-2'>
                    <span className='text-green-600 dark:text-green-400 font-bold'>✓</span>
                    <span>Updates freelancer availability</span>
                  </li>
                </ul>
              </div>

              {/* Actions */}
              <div className='flex gap-3'>
                <motion.button
                  onClick={onClose}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 theme-text font-medium hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors duration-200'>
                  Cancel
                </motion.button>
                <motion.button
                  onClick={handleMarkComplete}
                  disabled={isSubmitting}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium disabled:opacity-50 transition-colors duration-200'>
                  {isSubmitting ? 'Completing...' : 'Mark Complete'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProjectCompletionModal