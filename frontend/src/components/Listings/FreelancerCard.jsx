import { Link } from 'react-router-dom'
import { FaStar, FaCheckCircle } from 'react-icons/fa'
import { motion } from 'framer-motion'

const FreelancerCard = ({ freelancer, index }) => {
  return (
    <Link to={`/freelancers/${freelancer.id}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{
          scale: 1.02,
          transition: { duration: 0.1 }
        }}
        transition={{ duration: 0.2, delay: index * 0.1 }}
        className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6 cursor-pointer transition-all duration-300 hover:shadow-xl hover:bg-accent/5'>
        <div className='flex items-center gap-4 mb-4'>
          <img src={freelancer.image} alt={freelancer.name} className='w-16 h-16 rounded-full object-cover' />
          <div>
            <h3 className='text-xl font-bold mb-1 theme-text'>{freelancer.name}</h3>
            <span className='inline-block px-3 py-1 rounded-full text-sm font-medium bg-accent/20 text-accent'>{freelancer.specialty}</span>
          </div>
        </div>

        <div className='flex items-center justify-between mb-3'>
          <div className='flex items-center gap-1'>
            <FaStar className='text-accent text-sm' />
            <span className='font-medium theme-text'>{freelancer.rating}</span>
          </div>
          <span className='font-bold text-accent'>{freelancer.hourlyRate}</span>
        </div>

        <div className='flex items-center gap-2 theme-text-secondary text-sm'>
          <FaCheckCircle className='text-accent' />
          <span>{freelancer.completedProjects} Projects Completed</span>
        </div>
      </motion.div>
    </Link>
  )
}

export default FreelancerCard
