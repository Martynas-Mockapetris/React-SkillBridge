import { motion } from 'framer-motion'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

export const SortResultsHeader = ({ totalResults, currentSort, onSortChange }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: null },
    { value: 'oldest', label: 'Oldest', icon: null },
    { value: 'budget-asc', label: 'Budget ↑', icon: <FaArrowUp className='text-xs' /> },
    { value: 'budget-desc', label: 'Budget ↓', icon: <FaArrowDown className='text-xs' /> }
  ]

  const currentSortLabel = sortOptions.find((opt) => opt.value === currentSort)?.label || 'Newest'

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='bg-white border-b border-gray-200 rounded-t-lg p-4'>
      <div className='flex items-center justify-between gap-4 flex-wrap'>
        {/* Results count */}
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-gray-700'>Results:</span>
          <span className='inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold'>{totalResults}</span>
        </div>

        {/* Sort options */}
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium text-gray-700'>Sort by:</span>
          <div className='flex gap-2'>
            {sortOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => onSortChange(option.value)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                  currentSort === option.value ? 'bg-blue-500 text-white shadow-md ring-2 ring-blue-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}>
                {option.label}
                {option.icon && option.icon}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
