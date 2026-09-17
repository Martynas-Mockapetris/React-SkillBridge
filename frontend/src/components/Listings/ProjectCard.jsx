import { Link, useLocation } from 'react-router-dom'
import { FaCalendarAlt, FaHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import VerificationBadge from '../shared/VerificationBadge'
import LoadingSpinner from '../shared/LoadingSpinner'
import CategoryBadge from '../shared/CategoryBadge'
import CategoryBadge from '../shared/CategoryBadge'
import PriorityBadge from '../shared/PriorityBadge'
import ProjectStatusBadge from '../shared/ProjectStatusBadge'
import SkillsList from '../shared/SkillsList'
import { normalizeSkills } from '../../utils/skillUtils'

const ProjectCard = ({ project, isApplied = false, isFavorited = false, isFavoriting = false, onToggleFavorite }) => {
  const location = useLocation()
  const returnTo = `${location.pathname}${location.search}`
  const normalizedSkills = normalizeSkills(project.skills)

  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (onToggleFavorite) {
      await onToggleFavorite(project._id)
    }
  }

  return (
    <Link to={`/project/${project._id}`} state={{ returnTo }}>
      <motion.div
        // ... (keep all existing motion div props)
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5 relative'>
        {/* Favorite button - top right corner */}
        <motion.button onClick={handleFavoriteClick} disabled={isFavoriting} className='absolute top-4 right-4 z-10' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          {isFavoriting ? <LoadingSpinner size='sm' /> : <FaHeart className={`text-2xl ${isFavorited ? 'text-red-500' : 'theme-text-secondary'}`} />}
        </motion.button>

        {/* Project title */}
        <div className='mb-2 pr-8 flex items-start gap-2'>
          <h3 className='text-xl font-bold theme-text line-clamp-2 min-w-0'>{project.title}</h3>
          {isApplied && (
            <span className='shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30 dark:border-emerald-500/20'>
              Applied
            </span>
          )}
        </div>

        {/* Category + Status + Priority badges */}
        <div className='flex items-center gap-2 mb-4 flex-wrap'>
          <CategoryBadge category={project.category} />
          <ProjectStatusBadge status={project.status || 'active'} />
          <PriorityBadge priority={project.priority} size='sm' />
        </div>

        {/* Description */}
        <p className='theme-text-secondary text-sm mb-4 line-clamp-2'>{project.description}</p>

        {/* Skills */}
{normalizedSkills.length > 0 && <SkillsList skills={normalizedSkills} className='mb-4' />}

        {/* Client info */}
        {project.user && (
          <div className='flex items-center gap-3 mb-4 pb-4 border-b dark:border-light/10 border-primary/10'>
            <img src={project.user.profilePicture || `https://i.pravatar.cc/150?u=${project.user._id}`} alt={project.user.firstName} className='w-10 h-10 rounded-full object-cover' />
            <div>
              <div className='flex items-center gap-2 flex-wrap'>
                <p className='font-medium theme-text text-sm'>
                  {project.user.firstName} {project.user.lastName}
                </p>
                <VerificationBadge isVerified={project.user.isEmailVerified} />
              </div>
              <p className='text-xs theme-text-secondary'>{project.user.email}</p>
            </div>
          </div>
        )}

        {/* Budget and Deadline */}
        <div className='flex items-center justify-between theme-text-secondary text-sm'>
          <div className='flex items-center gap-1'>
            <span className='font-semibold'>€{project.budget}</span>
          </div>
          <div className='flex items-center gap-1'>
            <FaCalendarAlt className='text-accent' />
            <span>{new Date(project.deadline).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export default ProjectCard
