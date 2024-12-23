import { FaSearch } from 'react-icons/fa'
import { motion } from 'framer-motion'

const SearchBar = () => {
  return (
    <div className='w-full max-w-3xl mx-auto'>
      <motion.div className='relative' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <input
          type='text'
          placeholder='Search opportunities...'
          className='w-full bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent 
          backdrop-blur-sm rounded-lg px-4 py-3 pl-12 text-light
          border border-light/10
          placeholder:text-light/40
          focus:outline-none focus:ring-2 focus:ring-accent/50
          transition-all duration-300'
        />
        <FaSearch className='absolute left-4 top-1/2 -translate-y-1/2 text-light/40' />
      </motion.div>
    </div>
  )
}

export default SearchBar
