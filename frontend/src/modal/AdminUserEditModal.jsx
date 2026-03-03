import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const roleOptions = [
  { value: 'client', label: 'Client' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'both', label: 'Client & Freelancer' },
  { value: 'admin', label: 'Admin' }
]

const inputClasses = 'w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/70 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent transition'

const labelClasses = 'block text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1'

const AdminUserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState(user || {})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setFormData(user || {})
  }, [user])

  if (!isOpen || !user) return null

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    await onSave(formData)
    setSaving(false)
  }

  return (
    <AnimatePresence>
      <motion.div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div
          className='w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden'
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}>
          <div className='px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between'>
            <div>
              <p className='text-xs uppercase tracking-wide text-gray-400 dark:text-gray-500'>Admin Control</p>
              <h3 className='text-xl font-semibold text-gray-900 dark:text-white'>
                Edit {user.firstName} {user.lastName}
              </h3>
            </div>
            <button onClick={onClose} className='text-gray-400 hover:text-gray-700 dark:hover:text-gray-100 text-2xl leading-none'>
              &times;
            </button>
          </div>

          <form onSubmit={handleSubmit} className='px-6 py-6 space-y-6 bg-white dark:bg-transparent'>
            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className={labelClasses}>First Name</label>
                <input name='firstName' value={formData.firstName || ''} onChange={handleChange} className={inputClasses} required />
              </div>
              <div>
                <label className={labelClasses}>Last Name</label>
                <input name='lastName' value={formData.lastName || ''} onChange={handleChange} className={inputClasses} required />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Email</label>
              <input type='email' name='email' value={formData.email || ''} onChange={handleChange} className={inputClasses} required />
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className={labelClasses}>Role</label>
                <select name='userType' value={formData.userType || 'client'} onChange={handleChange} className={inputClasses}>
                  {roleOptions.map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClasses}>Hourly Rate</label>
                <input name='hourlyRate' type='number' min='0' value={formData.hourlyRate || ''} onChange={handleChange} className={inputClasses} />
              </div>
            </div>

            <div className='grid md:grid-cols-2 gap-5'>
              <div>
                <label className={labelClasses}>Location</label>
                <input name='location' value={formData.location || ''} onChange={handleChange} className={inputClasses} />
              </div>
              <div>
                <label className={labelClasses}>Phone</label>
                <input name='phone' value={formData.phone || ''} onChange={handleChange} className={inputClasses} />
              </div>
            </div>

            <div>
              <label className={labelClasses}>Bio</label>
              <textarea name='bio' rows='3' value={formData.bio || ''} onChange={handleChange} className={`${inputClasses} resize-none`} />
            </div>

            <div className='flex justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-5'>
              <button type='button' onClick={onClose} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition'>
                Cancel
              </button>
              <button type='submit' disabled={saving} className='px-5 py-2 rounded-lg bg-accent text-white font-semibold shadow hover:bg-accent/90 disabled:opacity-60'>
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default AdminUserEditModal
