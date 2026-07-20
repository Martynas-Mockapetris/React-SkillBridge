import { motion, AnimatePresence } from 'framer-motion'
import { FaArrowUp, FaArrowDown, FaClock } from 'react-icons/fa'

export const SortIndicatorBadge = ({ currentSort, onSortChange }) => {
  const getSortInfo = (sortValue) => {
    const sortMap = {
      newest: { label: 'Newest', icon: <FaClock size={14} />, color: 'bg-blue-100 text-blue-800' },
      oldest: { label: 'Oldest', icon: <FaClock size={14} />, color: 'bg-gray-100 text-gray-800' },
      'budget-asc': { label: 'Budget: Low→High', icon: <FaArrowUp size={14} />, color: 'bg-green-100 text-green-800' },
      'budget-desc': { label: 'Budget: High→Low', icon: <FaArrowDown size={14} />, color: 'bg-red-100 text-red-800' }
    }
    return sortMap[sortValue] || sortMap.newest
  }

  const currentSortInfo = getSortInfo(currentSort)

  return (
    <AnimatePresence mode='wait'>
      <motion.div
        key={currentSort}
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.2 }}
        className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${currentSortInfo.color}`}>
        {currentSortInfo.icon}
        <span>{currentSortInfo.label}</span>
      </motion.div>
    </AnimatePresence>
  )
}
