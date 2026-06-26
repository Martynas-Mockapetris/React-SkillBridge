import { motion } from 'framer-motion'
import { FaCheck, FaTimes } from 'react-icons/fa'

const AvailabilityEditPanel = ({ selectedDays, onStatusChange, onSave, onCancel, saving }) => {
  const getStatusColor = (status) => {
    const colorMap = {
      red: '#ef4444',
      orange: '#f97316',
      yellow: '#eab308',
      green: '#22c55e'
    }
    return colorMap[status] || '#e5e7eb'
  }

  const getStatusLabel = (status) => {
    const labelMap = {
      red: '100% Busy',
      orange: '50% Busy',
      yellow: 'Partially Busy',
      green: 'Available'
    }
    return labelMap[status] || 'Unknown'
  }

  return (
    <>
      {/* Edit Mode Banner */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
        <p className='text-blue-700 dark:text-blue-400 text-sm font-medium'>Click on a day to select it, then choose its status. {Object.keys(selectedDays).length} day(s) selected.</p>
      </motion.div>

      {/* Status Editor - only when days selected */}
      {Object.keys(selectedDays).length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='mt-6 pt-6 border-t dark:border-light/10 border-primary/10'>
          <h4 className='text-sm font-semibold theme-text mb-3'>Update Status for Selected Days:</h4>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-2 mb-4'>
            {['green', 'yellow', 'orange', 'red'].map((status) => (
              <motion.button
                key={status}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => Object.keys(selectedDays).forEach((key) => onStatusChange(key, status))}
                className='p-3 rounded-lg border-2 border-transparent hover:border-accent transition-colors duration-200'
                style={{ backgroundColor: getStatusColor(status) }}>
                <div className={`text-xs font-semibold ${['red', 'orange'].includes(status) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{getStatusLabel(status)}</div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='mt-6 flex gap-3'>
        <motion.button
          onClick={onSave}
          disabled={saving || Object.keys(selectedDays).length === 0}
          whileHover={{ scale: saving ? 1 : 1.05 }}
          whileTap={{ scale: saving ? 1 : 0.95 }}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded-lg font-semibold hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'>
          <FaCheck />
          {saving ? 'Saving...' : 'Save Changes'}
        </motion.button>
        <motion.button
          onClick={onCancel}
          disabled={saving}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className='flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'>
          <FaTimes />
          Cancel
        </motion.button>
      </motion.div>
    </>
  )
}

export default AvailabilityEditPanel
