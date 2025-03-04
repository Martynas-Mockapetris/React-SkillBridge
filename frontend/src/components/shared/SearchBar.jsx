import { FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'
import molecularPattern from '../../assets/molecular-pattern.svg'

const SearchSection = () => {
  return (
    <section className='w-full pb-8 pt-[150px] theme-bg relative z-[3]'>
      {/* Background Pattern - reduced sizes */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-10 top-[20%] opacity-[0.08]'>
          <img src={molecularPattern} alt='background pattern' className='w-[200px] h-[200px] rotate-[40deg]' />
        </div>
        <div className='absolute right-1/3 bottom-28 opacity-[0.06]'>
          <img src={molecularPattern} alt='background pattern' className='w-[200px] h-2100px] rotate-[-90deg]' />
        </div>
      </div>

      <div className='container mx-auto px-6 relative z-10'>
        {/* Header remains the same */}
        <motion.div className='text-center mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: 'easeOut' }}>
          <h2 className='text-5xl font-heading font-bold mb-6'>
            <span className='theme-text'>Find Your Next</span>
            <span className='text-accent'> Opportunity</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto text-lg'>Discover exciting projects and collaborations that match your skills and aspirations</p>
        </motion.div>

        {/* Search Bar - added margin bottom for shadow */}
        <div className='w-full max-w-4xl mx-auto mb-2'>
          <motion.div
            className='relative flex flex-col sm:flex-row items-center overflow-hidden rounded-xl shadow-xl backdrop-blur-sm bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}>
            <input
              type='text'
              placeholder='Search opportunities...'
              className='w-full bg-primary/40 dark:bg-light/20 px-6 py-5 pl-14
            text-light dark:text-light text-lg
            transition-all duration-300
            placeholder:text-light/80 dark:placeholder:text-light/80
            focus:placeholder:text-light/80 dark:focus:placeholder:text-light/60
            focus:bg-primary/60 dark:focus:bg-light/30
            focus:outline-none focus:ring-2 focus:ring-accent/50'
            />
            <FaSearch className='absolute left-5 top-5 sm:top-1/2 sm:-translate-y-1/2 text-light/80 dark:text-primary/80' size={22} />
            <button
              className='w-full sm:w-auto min-h-full h-auto bg-accent text-primary px-10 py-5 font-semibold text-lg
            transition-all duration-300 hover:bg-accent/90 hover:shadow-lg flex items-center justify-center'>
              Search
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default SearchSection
