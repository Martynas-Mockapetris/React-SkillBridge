import { Link } from 'react-router-dom'
import { FaStar, FaCheckCircle, FaUser } from 'react-icons/fa'
import { motion } from 'framer-motion'

const FreelancerCard = ({ freelancer, index }) => {
  // freelancer object now contains a single announcement
  const announcement = freelancer
  const freelancerInfo = freelancer.freelancer

  // Truncate text to specified length
  const truncateText = (text, maxLength = 80) => {
    if (!text) return ''
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  return (
    <Link to={`/freelancer/${freelancerInfo._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.1 }
        }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5 flex flex-col h-full'>
        {/* Header: Freelancer Profile Info */}
        <div className='flex items-center gap-4 mb-4'>
          <img src={freelancerInfo.profilePicture || `https://i.pravatar.cc/150?u=${freelancerInfo._id}`} alt={freelancerInfo.firstName} className='w-14 h-14 rounded-full object-cover flex-shrink-0' />
          <div className='flex-1'>
            <h3 className='text-lg font-bold mb-1 theme-text'>
              {freelancerInfo.firstName} {freelancerInfo.lastName}
            </h3>
            <span className='inline-block px-2 py-1 rounded text-xs font-medium bg-accent/20 text-accent'>{freelancerInfo.userType === 'both' ? 'Client & Freelancer' : 'Freelancer'}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className='flex items-center justify-between mb-4 pb-4 border-b border-accent/20'>
          <div className='flex items-center gap-1'>
            <FaStar className='text-accent text-sm' />
            <span className='font-medium theme-text text-sm'>New</span>
          </div>
          <span className='font-bold text-accent text-sm'>{announcement.hourlyRate}€/hr</span>
        </div>

        {/* Announcement Section */}
        <div className='flex-1 mb-4'>
          <div className='bg-accent/10 rounded-lg p-4 border-l-2 border-accent h-full flex flex-col'>
            {/* Announcement Title */}
            <h4 className='text-sm font-semibold text-accent mb-2'>{announcement.title}</h4>

            {/* Announcement Background/Description */}
            <p className='text-xs theme-text-secondary line-clamp-3 mb-3 flex-1'>{truncateText(announcement.background, 100)}</p>

            {/* Skills */}
            {announcement.skills && announcement.skills.length > 0 && (
              <div className='flex flex-wrap gap-1'>
                {announcement.skills.slice(0, 3).map((skill, skillIdx) => (
                  <span key={skillIdx} className='text-xs bg-accent/20 text-accent px-2 py-0.5 rounded'>
                    {skill}
                  </span>
                ))}
                {announcement.skills.length > 3 && <span className='text-xs theme-text-secondary px-2 py-0.5'>+{announcement.skills.length - 3}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Footer: View Profile */}
        <div className='flex items-center gap-2 theme-text-secondary text-sm border-t border-accent/20 pt-4'>
          <FaCheckCircle className='text-accent' />
          <span>View Profile</span>
        </div>
      </motion.div>
    </Link>
  )
}

export default FreelancerCard
