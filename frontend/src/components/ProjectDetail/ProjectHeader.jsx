import { motion } from 'framer-motion'
import { FaTags } from 'react-icons/fa'

const ProjectHeader = ({ project }) => {
  return (
    <motion.div className='mb-4 pb-4 border-b-2 dark:border-light/10 border-primary/10' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <h1 className='text-4xl font-bold theme-text mb-2'>{project.title}</h1>
      <p className='theme-text-secondary flex items-center gap-2'>
        <FaTags />
        {project.category}
      </p>
    </motion.div>
  )
}

export default ProjectHeader
