import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const PublishedBadge = ({ isPublished, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const baseClasses = 'inline-flex items-center rounded-full font-semibold'

  const colorClasses = isPublished ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'

  return (
    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }} className={`${baseClasses} ${sizeClasses[size]} ${colorClasses}`}>
      {isPublished ? 'Published' : 'Draft'}
    </motion.span>
  )
}

PublishedBadge.propTypes = {
  isPublished: PropTypes.bool.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

export default PublishedBadge
