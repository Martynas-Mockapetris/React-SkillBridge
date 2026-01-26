import { Link } from 'react-router-dom'
import { FaCalendarAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'

const ProjectCard = ({ project, index }) => {
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
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5'>
        {/* Project title */}
        <h3 className='text-xl font-bold mb-2 theme-text line-clamp-1'>{project.title}</h3>

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
