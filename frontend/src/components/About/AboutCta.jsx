import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AboutCta = () => {
  return (
    <motion.div className='rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8 md:p-10' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
      <div className='max-w-3xl'>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3'>Next Step</p>
        <h2 className='text-2xl md:text-3xl font-semibold theme-text'>Explore the platform or create your account</h2>
        <p className='mt-3 theme-text-secondary leading-relaxed'>Whether you are hiring, freelancing, or doing both, SkillBridge is built to make project collaboration easier to start and easier to manage.</p>
      </div>

      <div className='mt-6 flex flex-wrap gap-3'>
        <Link to='/listings' className='inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity'>
          Explore Listings
          <FaArrowRight />
        </Link>

        <Link to='/register' className='inline-flex items-center gap-2 rounded-full border theme-border px-5 py-3 text-sm font-semibold theme-text hover:bg-white/40 dark:hover:bg-white/5 transition-colors'>
          Join SkillBridge
        </Link>
      </div>
    </motion.div>
  )
}

export default AboutCta
