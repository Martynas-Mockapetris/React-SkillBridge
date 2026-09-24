import { motion } from 'framer-motion'
import { FaTags } from 'react-icons/fa'
import PropTypes from 'prop-types'

const CategoryBadge = ({ category, showIcon = false, size = 'md' }) => {
  // Size configurations
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  }

  const textSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-[10px]',
    lg: 'text-xs'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center gap-2 rounded-full bg-accent/20 text-accent font-medium uppercase tracking-wide ${sizeClasses[size]}`}>
      {showIcon && <FaTags className={textSizeClasses[size]} />}
      {category}
    </motion.span>
  )
}

CategoryBadge.propTypes = {
  category: PropTypes.string.isRequired,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

export default CategoryBadge
