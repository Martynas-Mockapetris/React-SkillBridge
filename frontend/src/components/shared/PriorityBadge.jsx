import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { FaFlag } from 'react-icons/fa'

const PriorityBadge = ({ priority, size = 'md', showIcon = false }) => {
  const priorityConfig = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
    low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const config = priorityConfig[priority] || priorityConfig.medium

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`inline-flex items-center gap-1 rounded-full font-medium ${config} ${sizeClasses[size]}`}
    >
      {showIcon && <FaFlag className="mr-1" />}
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </motion.span>
  )
}

PriorityBadge.propTypes = {
  priority: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showIcon: PropTypes.bool
}

export default PriorityBadge