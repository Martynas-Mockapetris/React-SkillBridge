import { motion, AnimatePresence } from 'framer-motion'
import { FaCalendar, FaTimes, FaCheck } from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useState } from 'react'

const RescheduleModal = ({ isOpen, project, onClose, onReschedule }) => {
  const [newDeadline, setNewDeadline] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const currentDeadline = project?.deadline ? new Date(project.deadline).toISOString().split('T')[0] : ''

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]

  const handleReschedule = async () => {
    if (!newDeadline) {
      toast.error('Please select a new deadline')
      return
    }

    const selectedDate = new Date(newDeadline)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate <= today) {
      toast.error('New deadline must be in the future')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/projects/${project._id}/reschedule`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newDeadline: selectedDate.toISOString() })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `HTTP ${response.status}`)
      }

      const result = await response.json()
      toast.success('Project rescheduled successfully!')

      if (onReschedule) {
        onReschedule(result.data.project)
      }

      setNewDeadline('')
      onClose()
    } catch (err) {
      toast.error(`Error rescheduling: ${err.message}`)
      console.error('Error rescheduling project:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (e) => {
    setNewDeadline(e.target.value)
  }

  const daysUntilCurrentDeadline = project?.deadline ? Math.ceil((new Date(project.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0

  const daysUntilNewDeadline = newDeadline ? Math.ceil((new Date(newDeadline) - new Date()) / (1000 * 60 * 60 * 24)) : 0

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className='fixed inset-0 bg-black/50 z-40' />

          {/* Modal */}
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className='fixed inset-0 flex items-center justify-center z-50 p-4'>
            <motion.div className='bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-md w-full p-6 border dark:border-gray-800'>
              {/* Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div className='w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center'>
                    <FaCalendar className='text-blue-600 dark:text-blue-400 text-xl' />
                  </div>
                  <h2 className='text-xl font-bold theme-text'>Reschedule Project</h2>
                </div>
                <motion.button onClick={onClose} disabled={isSubmitting} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-50'>
                  <FaTimes />
                </motion.button>
              </div>

              {/* Content */}
              <div className='mb-6 space-y-4'>
                <div>
                  <h3 className='font-semibold theme-text mb-2'>{project?.title}</h3>
                  <p className='text-sm theme-text-secondary'>Change the project deadline to extend or accelerate the timeline.</p>
                </div>

                {/* Current Deadline */}
                <div className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <p className='text-xs theme-text-secondary mb-1'>Current Deadline</p>
                  <p className='font-semibold theme-text'>
                    {new Date(project?.deadline).toLocaleDateString('en-US', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  {daysUntilCurrentDeadline > 0 && <p className='text-xs theme-text-secondary mt-1'>{daysUntilCurrentDeadline} days remaining</p>}
                  {daysUntilCurrentDeadline <= 0 && <p className='text-xs text-red-600 dark:text-red-400 mt-1'>Deadline passed</p>}
                </div>

                {/* New Deadline Input */}
                <div>
                  <label className='block text-sm font-medium theme-text mb-2'>New Deadline</label>
                  <input
                    type='date'
                    value={newDeadline}
                    onChange={handleDateChange}
                    min={minDateStr}
                    disabled={isSubmitting}
                    className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50'
                  />
                  {newDeadline && (
                    <p className='text-xs theme-text-secondary mt-2'>
                      {daysUntilNewDeadline} days from today
                      {daysUntilNewDeadline > daysUntilCurrentDeadline && <span className='text-green-600 dark:text-green-400 ml-1'>📅 (+{daysUntilNewDeadline - daysUntilCurrentDeadline} days)</span>}
                      {daysUntilNewDeadline < daysUntilCurrentDeadline && <span className='text-orange-600 dark:text-orange-400 ml-1'>⚡ (-{daysUntilCurrentDeadline - daysUntilNewDeadline} days)</span>}
                    </p>
                  )}
                </div>
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
                  onClick={handleReschedule}
                  disabled={isSubmitting || !newDeadline}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className='flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 transition-colors duration-200'>
                  {isSubmitting ? (
                    <>
                      <div className='animate-spin'>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full'></div>
                      </div>
                      <span>Rescheduling...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>Reschedule</span>
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default RescheduleModal
