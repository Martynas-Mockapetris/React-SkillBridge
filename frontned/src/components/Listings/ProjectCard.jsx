import { FaStar } from 'react-icons/fa'
import { motion } from 'framer-motion'

const ProjectCard = ({ project, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6'>
      <h3 className='text-xl font-bold mb-2 theme-text'>{project.name}</h3>
      <span className='inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent mb-4'>{project.type}</span>
      <div className='flex items-center gap-3 mb-4'>
        <img src={project.announcer.image} alt={project.announcer.name} className='w-10 h-10 rounded-full object-cover' />
        <div>
          <p className='font-medium theme-text'>{project.announcer.name}</p>
          <div className='flex items-center gap-1'>
            <FaStar className='text-accent text-sm' />
            <span className='text-sm theme-text-secondary'>{project.announcer.rating}</span>
          </div>
        </div>
      </div>
      <div className='theme-text-secondary text-sm'>Deadline: {new Date(project.deadline).toLocaleDateString()}</div>
    </motion.div>
  )
}

export default ProjectCard
