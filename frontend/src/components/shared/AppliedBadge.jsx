import { motion } from 'framer-motion'
import { FaCheck } from 'react-icons/fa'
import PropTypes from 'prop-types'

const AppliedBadge = ({ text = 'Applied', size = 'md', showIcon = true }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-[12px] gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2'
  }

  const iconSizeClasses = {
    sm: 'text-[8px]',
    md: 'text-xs',
    lg: 'text-sm'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`shrink-0 inline-flex items-center rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/20 ${sizeClasses[size]}`}>
      {showIcon && <FaCheck className={iconSizeClasses[size]} />}
      {text}
    </motion.span>
  )
}

AppliedBadge.propTypes = {
  text: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  showIcon: PropTypes.bool
}

export default AppliedBadge