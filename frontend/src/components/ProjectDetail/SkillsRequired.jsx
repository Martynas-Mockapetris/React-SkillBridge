import { motion } from 'framer-motion'

const SkillsRequired = ({ skills }) => {
  return (
    <div className='theme-card p-6 rounded-lg'>
      <h3 className='text-xl font-semibold theme-text mb-4'>Skills Required</h3>
      <div className='flex flex-wrap gap-2'>
        {skills?.map((skill, index) => (
          <motion.span key={index} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className='px-3 py-1 bg-accent/20 text-accent rounded-full text-sm font-medium'>
            {skill}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

export default SkillsRequired
