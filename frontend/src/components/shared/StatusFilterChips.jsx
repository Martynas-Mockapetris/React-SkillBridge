import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

const StatusFilterChips = ({ selectedStatus, onStatusChange, onClear }) => {
  const statusOptions = [
    { value: 'draft', label: 'Draft', color: 'bg-gray-100 dark:bg-gray-800' },
    { value: 'active', label: 'Active', color: 'bg-blue-100 dark:bg-blue-900/30' },
    { value: 'assigned', label: 'Assigned', color: 'bg-purple-100 dark:bg-purple-900/30' },
    { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { value: 'under_review', label: 'Under Review', color: 'bg-orange-100 dark:bg-orange-900/30' },
    { value: 'completed', label: 'Completed', color: 'bg-green-100 dark:bg-green-900/30' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 dark:bg-red-900/30' }
  ]

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='flex flex-wrap gap-2 items-center'>
      <span className='text-sm font-medium theme-text'>Filter by Status:</span>

      <div className='flex flex-wrap gap-2'>
        {statusOptions.map((option) => (
          <motion.button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedStatus === option.value ? `${option.color} ring-2 ring-accent ring-offset-2 dark:ring-offset-gray-900` : `${option.color} opacity-60 hover:opacity-100`
            }`}>
            {option.label}
          </motion.button>
        ))}
      </div>

      {selectedStatus && (
        <motion.button
          onClick={onClear}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200'>
          <FaTimes />
          Clear
        </motion.button>
      )}
    </motion.div>
  )
}

export default StatusFilterChips
