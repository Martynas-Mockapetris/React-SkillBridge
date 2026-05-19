import { useLocation, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaClock, FaEuroSign, FaMapMarkerAlt, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const FreelancerCard = ({ freelancer, index }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()

  const announcement = freelancer
  const freelancerInfo = freelancer.freelancer
  const returnTo = `${location.pathname}${location.search}`

  const truncateText = (text, maxLength = 100) => {
    if (!text) return ''
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text
  }

  const roleLabel = freelancerInfo.userType === 'both' ? 'Client & Freelancer' : 'Freelancer'

  const quickFacts = [
    {
      key: 'availability',
      icon: <FaClock className='text-[11px]' />,
      label: freelancerInfo.availabilityLabel
    },
    {
      key: 'rate',
      icon: <FaEuroSign className='text-[11px]' />,
      label: freelancerInfo.hourlyRateLabel
    },
    freelancerInfo.location
      ? {
          key: 'location',
          icon: <FaMapMarkerAlt className='text-[11px]' />,
          label: freelancerInfo.location
        }
      : null
  ].filter(Boolean)

  const CardShell = ({ children, locked = false }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={
        locked
          ? undefined
          : {
              scale: 1.02,
              transition: { duration: 0.1 }
            }
      }
      transition={{ duration: 0.2, delay: index * 0.1 }}
      onClick={() => {
        if (locked) {
          navigate('/login')
          return
        }

        navigate(`/freelancer/${freelancerInfo._id}`, {
          state: { returnTo }
        })
      }}
      className={`relative bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5 flex flex-col h-full ${
        locked ? 'opacity-75 hover:opacity-100' : ''
      }`}>
      {children}
    </motion.div>
  )

  const CardContent = ({ blurred = false }) => (
    <div className={`${blurred ? 'opacity-50 pointer-events-none ' : ''}flex flex-col h-full`}>
      <div className='flex items-start gap-4 mb-4'>
        <img src={freelancerInfo.profilePicture || `https://i.pravatar.cc/150?u=${freelancerInfo._id}`} alt={freelancerInfo.name} className='w-14 h-14 rounded-full object-cover flex-shrink-0 border border-accent/20' />

        <div className='flex-1 min-w-0'>
          <div className='flex items-start justify-between gap-3 mb-2'>
            <div className='min-w-0'>
              <h3 className='text-lg font-bold theme-text leading-tight'>{freelancerInfo.name}</h3>
              <p className='text-sm theme-text-secondary mt-1 line-clamp-2'>{freelancerInfo.specialty}</p>
            </div>

            <div className='flex flex-col items-end gap-2 shrink-0'>
              <span className='inline-flex items-center px-2.5 py-1 rounded text-[11px] font-medium bg-accent/20 text-accent whitespace-nowrap'>{roleLabel}</span>
              {freelancerInfo.isEmailVerified && (
                <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 whitespace-nowrap'>
                  <FaCheckCircle className='text-[10px]' />
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {quickFacts.length > 0 && (
        <div className='flex flex-wrap gap-2 mb-4 pb-4 border-b border-accent/20'>
          {quickFacts.map((fact) => (
            <span key={fact.key} className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-primary/10 dark:bg-light/10 theme-text-secondary border border-primary/10 dark:border-light/10'>
              {fact.icon}
              <span>{fact.label}</span>
            </span>
          ))}
        </div>
      )}

      <div className='flex-1 mb-4'>
        <div className='bg-accent/10 rounded-lg p-4 border-l-2 border-accent h-full flex flex-col'>
          <p className='text-[11px] uppercase tracking-wide text-accent/80 mb-2'>Current Announcement</p>
          <h4 className='text-sm font-semibold text-accent mb-2 line-clamp-2'>{announcement.title}</h4>
          <p className='text-xs theme-text-secondary line-clamp-3 mb-4 flex-1'>{truncateText(announcement.background, 120)}</p>

          {freelancerInfo.primarySkills && freelancerInfo.primarySkills.length > 0 && (
            <div className='flex flex-wrap gap-1.5'>
              {freelancerInfo.primarySkills.slice(0, 4).map((skill, skillIdx) => (
                <span key={skillIdx} className='text-xs bg-accent/20 text-accent px-2 py-0.5 rounded'>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className='mt-auto flex items-center justify-between gap-3 border-t border-accent/20 pt-4'>
        <div className='flex items-center gap-2 theme-text-secondary text-sm'>
          <FaCheckCircle className='text-accent' />
          <span>View Profile</span>
        </div>

        <span className='text-xs theme-text-muted'>{freelancerInfo.yearsOfExperience > 0 ? `Years of experience: ${freelancerInfo.yearsOfExperience}+` : 'Years of experience: N/A'}</span>
      </div>
    </div>
  )

  if (currentUser) {
    return (
      <CardShell>
        <CardContent />
      </CardShell>
    )
  }

  return (
    <CardShell locked>
      <div className='absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center flex-col gap-2 backdrop-blur-sm z-10'>
        <FaUser className='text-accent text-3xl' />
        <span className='text-sm font-semibold text-white text-center px-4'>Login to View Profile</span>
      </div>

      <CardContent blurred />
    </CardShell>
  )
}

export default FreelancerCard
