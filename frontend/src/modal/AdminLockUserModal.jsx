import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const presets = [
  { label: '7 days', value: 7 },
  { label: '14 days', value: 14 },
  { label: '30 days', value: 30 },
  { label: 'No limit', value: 0 }
]

const AdminLockUserModal = ({ isOpen, onClose, onConfirm, user }) => {
  const [reason, setReason] = useState('')
  const [duration, setDuration] = useState(14)
  const [customDuration, setCustomDuration] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setDuration(14)
      setCustomDuration('')
    }
  }, [isOpen])

  if (!isOpen || !user) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    const durationDays = duration === 'custom' ? Number(customDuration || 0) : duration
    onConfirm({ reason: reason.trim(), durationDays })
  }

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-lg rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl'
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}>
          <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>Lock User</p>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                {user.firstName} {user.lastName}
              </h3>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none'>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-6 space-y-5'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Explain why this account is being locked...'
                rows='3'
                className='w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                required
              />
            </div>

            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2'>Duration</label>
              <div className='grid grid-cols-2 gap-3'>
                {presets.map((preset) => (
                  <button
                    type='button'
                    key={preset.label}
                    onClick={() => setDuration(preset.value)}
                    className={`py-2 rounded-lg border ${duration === preset.value ? 'border-accent text-accent bg-accent/10' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {preset.label}
                  </button>
                ))}
                <button
                  type='button'
                  onClick={() => setDuration('custom')}
                  className={`py-2 rounded-lg border ${duration === 'custom' ? 'border-accent text-accent bg-accent/10' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  Custom…
                </button>
              </div>

              {duration === 'custom' && (
                <input
                  type='number'
                  min='1'
                  placeholder='Days'
                  value={customDuration}
                  onChange={(e) => setCustomDuration(e.target.value)}
                  className='mt-3 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  required
                />
              )}
            </div>

            <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                Cancel
              </button>
              <button type='submit' className='px-5 py-2 rounded-lg bg-red-600 text-white font-semibold shadow hover:bg-red-700'>
                Lock Account
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminLockUserModal
