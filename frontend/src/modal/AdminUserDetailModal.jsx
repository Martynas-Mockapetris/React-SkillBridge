import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const fieldClass = 'text-sm text-gray-600 dark:text-gray-300'
const labelClass = 'text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'

const InfoRow = ({ label, value }) => (
  <div>
    <p className={labelClass}>{label}</p>
    <p className={fieldClass}>{value || '—'}</p>
  </div>
)

const AdminUserDetailsModal = ({ isOpen, onClose, user }) => {
  const navigate = useNavigate()
  if (!isOpen || !user) return null

  const handleViewDetailedProfile = () => {
    onClose()
    navigate(`/freelancer/${user._id}`)
  }

  const lockInfo = user.isLocked
    ? [
        { label: 'Status', value: 'Locked' },
        { label: 'Reason', value: user.lockReason || '—' },
        { label: 'Unlocks', value: user.lockExpiresAt ? new Date(user.lockExpiresAt).toLocaleString() : 'No end date' }
      ]
    : [{ label: 'Status', value: 'Active' }]

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/70 backdrop-blur z-50 flex items-center justify-center px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-3xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl overflow-hidden'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}>
          <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>User Profile</p>
              <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
                {user.firstName} {user.lastName}
              </h2>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none'>
              &times;
            </button>
          </div>

          <div className='px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Basic Info</h3>
              <InfoRow label='Email' value={user.email} />
              <InfoRow label='Role' value={user.userType} />
              <InfoRow label='Joined' value={new Date(user.createdAt).toLocaleDateString()} />
              <InfoRow label='Last Login' value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'} />
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Contact & Location</h3>
              <InfoRow label='Phone' value={user.phone} />
              <InfoRow label='Location' value={user.location} />
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Freelancer Details</h3>
              <InfoRow label='Hourly Rate' value={user.hourlyRate ? `$${user.hourlyRate}` : null} />
              <InfoRow label='Experience' value={user.experienceLevel} />
              <InfoRow label='Skills' value={user.skills} />
            </div>

            <div className='space-y-4'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Lock Status</h3>
              {lockInfo.map((item) => (
                <InfoRow key={item.label} label={item.label} value={item.value} />
              ))}
            </div>

            <div className='md:col-span-2 space-y-3'>
              <h3 className='text-sm font-semibold text-gray-900 dark:text-white'>Bio</h3>
              <p className='text-sm text-gray-600 dark:text-gray-300'>{user.bio || 'No bio provided.'}</p>
            </div>
          </div>

          <div className='px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-3'>
            <button onClick={handleViewDetailedProfile} className='px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90'>
              View Detailed Profile
            </button>
            <button onClick={onClose} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminUserDetailsModal
