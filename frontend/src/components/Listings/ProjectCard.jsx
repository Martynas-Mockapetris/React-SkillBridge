import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { getFavoriteProjects, addToFavorites, removeFromFavorites } from '../../services/userService'
import { getProjectStatusBadgeClass, formatProjectStatusLabel, getProjectPriorityBadgeClass, formatProjectPriorityLabel } from '../../utils/projectStatusUI'

const ProjectCard = ({ project, index }) => {
  const { currentUser } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [isFavoriting, setIsFavoriting] = useState(false)

  // Load favorites on mount
  useEffect(() => {
    if (!currentUser) return

    const loadFavorites = async () => {
      try {
        const favProjects = await getFavoriteProjects()
        const favoriteIds = favProjects.map((fav) => fav._id)
        setFavorites(favoriteIds)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    loadFavorites()
  }, [currentUser?._id])

  const isFavorited = (projectId) => {
    return favorites.includes(projectId)
  }

  const handleFavoriteClick = async (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      alert('Please login to favorite projects')
      return
    }

    setIsFavoriting(true)

    try {
      if (isFavorited(project._id)) {
        await removeFromFavorites(project._id)
        setFavorites(favorites.filter((id) => id !== project._id))
      } else {
        await addToFavorites(project._id)
        setFavorites([...favorites, project._id])
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    } finally {
      setIsFavoriting(false)
    }
  }

  return (
    <Link to={`/project/${project._id}`}>
      <motion.div
        // ... (keep all existing motion div props)
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5 relative'>
        {/* Favorite button - top right corner */}
        <motion.button onClick={handleFavoriteClick} disabled={isFavoriting} className='absolute top-4 right-4 z-10' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          <FaHeart className={`text-2xl ${isFavorited(project._id) ? 'text-red-500' : 'text-gray-400'}`} />
        </motion.button>

        {/* Project title */}
        <h3 className='text-xl font-bold mb-2 theme-text line-clamp-1 pr-8'>{project.title}</h3>

        {/* Category + Status + Priority badges */}
        <div className='flex items-center gap-2 mb-4 flex-wrap'>
          <span className='inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent'>{project.category}</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProjectStatusBadgeClass(project.status || 'active')}`}>{formatProjectStatusLabel(project.status || 'active')}</span>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getProjectPriorityBadgeClass(project.priority)}`}>{formatProjectPriorityLabel(project.priority)} Priority</span>
        </div>

        {/* Description */}
        <p className='theme-text-secondary text-sm mb-4 line-clamp-2'>{project.description}</p>

        {/* Skills */}
        {project.skills && project.skills.length > 0 && (
          <div className='flex flex-wrap gap-2 mb-4'>
            {project.skills.slice(0, 3).map((skill, idx) => (
              <span key={idx} className='px-2 py-1 bg-accent/10 text-accent rounded text-xs'>
                {skill}
              </span>
            ))}
            {project.skills.length > 3 && <span className='px-2 py-1 bg-accent/10 text-accent rounded text-xs'>+{project.skills.length - 3}</span>}
          </div>
        )}

        {/* Client info */}
        {project.user && (
          <div className='flex items-center gap-3 mb-4 pb-4 border-b dark:border-light/10 border-primary/10'>
            <img src={project.user.profilePicture || `https://i.pravatar.cc/150?u=${project.user._id}`} alt={project.user.firstName} className='w-10 h-10 rounded-full object-cover' />
            <div>
              <p className='font-medium theme-text text-sm'>
                {project.user.firstName} {project.user.lastName}
              </p>
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
