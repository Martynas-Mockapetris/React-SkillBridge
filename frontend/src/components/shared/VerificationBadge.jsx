import PropTypes from 'prop-types'
import { FaCheckCircle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'

const VerificationBadge = ({ isVerified, className = '' }) => {
  const { t } = useTranslation('main')

  if (!isVerified) return null

  return (
    <span className={`inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300 ${className}`.trim()}>
      <FaCheckCircle className='text-[10px]' />
      {t('listings.verified')}
    </span>
  )
}

VerificationBadge.propTypes = {
  isVerified: PropTypes.bool.isRequired,
  className: PropTypes.string
}

export default VerificationBadge
