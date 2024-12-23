import { FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import molecularPattern from '../../assets/molecular-pattern.svg'

const SearchSection = () => {
  return (
    <section className='w-full pb-24 pt-[150px] theme-bg relative z-[1]'>
      {/* Background Pattern */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-sm'>
        <div className='absolute -left-20 top-0 opacity-[0.08]'>
          <img src={molecularPattern} alt='background pattern' className='w-[600px] h-[600px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-0 opacity-[0.06]'>
          <img src={molecularPattern} alt='background pattern' className='w-[400px] h-[400px] rotate-[-45deg]' />
        </div>
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        {/* Header */}
        <motion.div className='text-center mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <h2 className='text-5xl font-heading font-bold mb-6'>
            <span className='theme-text'>Find Your Next</span>
            <span className='text-accent'> Opportunity</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto text-lg'>Discover exciting projects and collaborations that match your skills and aspirations</p>
        </motion.div>

        {/* Search Bar */}
        <div className='w-full max-w-4xl mx-auto'>
          <motion.div className='relative flex items-center overflow-hidden rounded-xl shadow-2xl' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
            <input
              type='text'
              placeholder='Search opportunities...'
              className='w-full bg-light/20 px-6 py-5 pl-14
                theme-text text-lg
                transition-all duration-300
                dark:placeholder:text-light/40 placeholder:text-primary/40
                dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
                focus:bg-light/30
                focus:outline-none focus:ring-2 focus:ring-accent/50'
            />
            <FaSearch className='absolute left-5 top-1/2 -translate-y-1/2 theme-text-secondary' size={22} />
            <button
              className='min-h-full h-auto bg-accent text-primary px-10 py-5 font-semibold text-lg
              transition-all duration-300 hover:bg-accent/90 hover:shadow-lg flex items-center'>
              Search
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default SearchSection
