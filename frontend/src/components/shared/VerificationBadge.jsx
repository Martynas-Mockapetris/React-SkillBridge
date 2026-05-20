import { FaCheckCircle } from 'react-icons/fa'

const VerificationBadge = ({ isVerified, className = '' }) => {
  if (!isVerified) return null

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300 ${className}`.trim()}>
      <FaCheckCircle className='text-[10px]' />
      Verified
    </span>
  )
}

export default VerificationBadge
