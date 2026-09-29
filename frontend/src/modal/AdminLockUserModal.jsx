import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
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
        <motion.div className='w-full max-w-lg rounded-2xl theme-card border theme-border shadow-2xl' initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}>
          <div className='px-6 py-4 border-b theme-border flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide theme-text-muted'>Lock User</p>
              <h3 className='text-xl font-semibold theme-text'>
                {user.firstName} {user.lastName}
              </h3>
            </div>
            <button onClick={onClose} className='theme-text-muted hover:theme-text text-2xl leading-none'>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-6 space-y-5'>
            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide theme-text-secondary mb-1'>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder='Explain why this account is being locked...'
                rows='3'
                className='w-full rounded-lg border theme-border theme-input theme-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent resize-none'
                required
              />
            </div>

            <div>
              <label className='block text-xs font-semibold uppercase tracking-wide theme-text-secondary mb-2'>Duration</label>
              <div className='grid grid-cols-2 gap-3'>
                {presets.map((preset) => (
                  <button
                    type='button'
                    key={preset.label}
                    onClick={() => setDuration(preset.value)}
                    className={`py-2 rounded-lg border ${duration === preset.value ? 'border-accent text-accent bg-accent/10' : 'theme-border theme-text-secondary'}`}>
                    {preset.label}
                  </button>
                ))}
                <button type='button' onClick={() => setDuration('custom')} className={`py-2 rounded-lg border ${duration === 'custom' ? 'border-accent text-accent bg-accent/10' : 'theme-border theme-text-secondary'}`}>
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
                  className='mt-3 w-full rounded-lg border theme-border theme-input theme-text px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent'
                  required
                />
              )}
            </div>

            <div className='flex justify-end gap-3 border-t theme-border pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border theme-border theme-text-secondary hover:bg-white/50 dark:hover:bg-black/20 transition'>
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

AdminLockUserModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  user: PropTypes.shape({
    _id: PropTypes.string,
    firstName: PropTypes.string,
    lastName: PropTypes.string
  })
}

export default AdminLockUserModal
