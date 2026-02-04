import { useState } from 'react'
import { Link } from 'react-router-dom'
import { FaCalendarAlt, FaHeart } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const ProjectCard = ({ project, index }) => {
  const { currentUser } = useAuth()
  const [favorites, setFavorites] = useState([])
  const [isFavoriting, setIsFavoriting] = useState(false)

  const isFavorited = (projectId) => {
    return favorites.includes(projectId)
  }

  const handleFavoriteClick = (e) => {
    e.preventDefault() // Prevent navigation to project detail
    e.stopPropagation()

    if (!currentUser) {
      // Optionally show a message or redirect to login
      alert('Please login to favorite projects')
      return
    }

    setIsFavoriting(true)

    // Toggle favorite logic
    if (isFavorited(project._id)) {
      setFavorites(favorites.filter((id) => id !== project._id))
    } else {
      setFavorites([...favorites, project._id])
    }

    setIsFavoriting(false)
  }

  return (
    <Link to={`/project/${project._id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.1 }
        }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5 relative'>
        {/* Favorite button - top right corner */}
        <motion.button onClick={handleFavoriteClick} disabled={isFavoriting} className='absolute top-4 right-4 z-10' whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
          <FaHeart className={`text-2xl ${isFavorited(project._id) ? 'text-red-500' : 'text-gray-400'}`} />
        </motion.button>

        {/* Project title */}
        <h3 className='text-xl font-bold mb-2 theme-text line-clamp-1 pr-8'>{project.title}</h3>

        {/* Category badge */}
        <span className='inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent mb-4'>{project.category}</span>

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
            <img src={project.user.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={project.user.firstName} className='w-10 h-10 rounded-full object-cover' />
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
