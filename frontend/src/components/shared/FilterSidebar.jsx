import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaTimes } from 'react-icons/fa'
import { ProjectFilterPanel } from './ProjectFilterPanel'

const FilterSidebar = ({ isOpen, onToggle, onClose, filters, onFilterChange, onClearAll, hasActiveFilters, isDarkMode }) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <div className='lg:hidden fixed top-24 left-4 z-40'>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`p-3 rounded-lg shadow-lg transition-colors bg-accent text-white hover:bg-accent/80 ${hasActiveFilters ? 'ring-2 ring-accent ring-offset-2 dark:ring-offset-primary ring-offset-light' : ''}`}
          aria-label='Toggle filters'>
          <svg className='w-5 h-5' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z'
            />
          </svg>
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className='lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16' />}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:relative lg:translate-x-0
          top-24 left-0 h-[calc(100vh-6rem)] lg:h-auto
          w-80 lg:w-64
          z-40 lg:z-0
          overflow-y-auto lg:overflow-visible
          bg-light dark:bg-primary
          border-r border-primary/10 dark:border-light/10
          shadow-xl lg:shadow-none p-4 lg:p-0
        `>
        {/* Header with Close Button */}
        <div
          className={`
            sticky top-0 z-50 p-4 border-b
            bg-light dark:bg-primary border-primary/10 dark:border-light/10
            lg:hidden
          `}>
          <div className='flex items-center justify-between'>
            <h2 className={`text-lg font-semibold theme-text`}>Filters</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`p-2 rounded-lg hover:bg-primary/10 dark:hover:bg-light/10 theme-text-secondary hover:text-accent transition-colors`}
              aria-label='Close filters'>
              <FaTimes />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className='p-4 lg:p-0'>
          <ProjectFilterPanel filters={filters} onFilterChange={onFilterChange} onClearAll={onClearAll} hasActiveFilters={hasActiveFilters} />
        </div>
      </motion.div>
    </>
  )
}

export default FilterSidebar
