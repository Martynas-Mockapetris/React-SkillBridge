import { motion } from 'framer-motion'
import { FaCheckCircle } from 'react-icons/fa'
import { useState } from 'react'
import ProjectCompletionModal from '../../modal/ProjectCompletionModal'

const ProjectCompletionButton = ({ project, onComplete, variant = 'button', size = 'md' }) => {
  const [showModal, setShowModal] = useState(false)

  const isCompleted = project?.status === 'completed'

  if (isCompleted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className='flex items-center gap-2 px-3 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium'>
        <FaCheckCircle />
        <span>Completed</span>
      </motion.div>
    )
  }

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base'
  }

  if (variant === 'icon') {
    return (
      <>
        <motion.button
          onClick={() => setShowModal(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className='p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors duration-200'
          title='Mark project as complete'>
          <FaCheckCircle />
        </motion.button>
        <ProjectCompletionModal isOpen={showModal} project={project} onClose={() => setShowModal(false)} onComplete={onComplete} />
      </>
    )
  }

  return (
    <>
      <motion.button
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center gap-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-colors duration-200 ${sizeClasses[size]}`}>
        <FaCheckCircle />
        <span>Mark Complete</span>
      </motion.button>
      <ProjectCompletionModal isOpen={showModal} project={project} onClose={() => setShowModal(false)} onComplete={onComplete} />
    </>
  )
}

export default ProjectCompletionButton
