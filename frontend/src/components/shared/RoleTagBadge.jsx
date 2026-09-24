import { motion } from 'framer-motion'
import PropTypes from 'prop-types'

const RoleTagBadge = ({ role, size = 'sm' }) => {
  const sizeClasses = {
    sm: 'px-2.5 py-1 text-[11px]',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  }

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`inline-flex items-center rounded font-medium bg-accent/20 text-accent whitespace-nowrap ${sizeClasses[size]}`}>
      {role}
    </motion.span>
  )
}

RoleTagBadge.propTypes = {
  role: PropTypes.string.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
}

export default RoleTagBadge
