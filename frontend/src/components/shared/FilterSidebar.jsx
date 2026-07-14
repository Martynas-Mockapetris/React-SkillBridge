import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaTimes } from 'react-icons/fa'
import { ProjectFilterPanel } from './ProjectFilterPanel'

const FilterSidebar = ({
  isOpen,
  onToggle,
  onClose,
  filters,
  onFilterChange,
  onClearAll,
  hasActiveFilters,
  isDarkMode
}) => {
  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-20 left-4 z-40">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggle}
          className={`p-3 rounded-lg shadow-lg transition-colors ${
            isDarkMode
              ? 'bg-slate-700 hover:bg-slate-600 text-white'
              : 'bg-white hover:bg-gray-100 text-slate-800'
          } ${hasActiveFilters ? 'ring-2 ring-blue-500' : ''}`}
          aria-label="Toggle filters"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
        </motion.button>
      </div>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isOpen ? 0 : '-100%' }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className={`
          fixed lg:relative lg:translate-x-0
          top-16 left-0 h-[calc(100vh-4rem)] lg:h-auto
          w-80 lg:w-1/4 lg:min-w-max
          z-40 lg:z-0
          overflow-y-auto lg:overflow-visible
          ${isDarkMode ? 'bg-slate-800' : 'bg-white'}
          border-r ${isDarkMode ? 'border-slate-700' : 'border-gray-200'}
          shadow-xl lg:shadow-none
        `}
      >
        {/* Header with Close Button */}
        <div
          className={`
            sticky top-0 z-50 p-4 border-b
            ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-200'}
            lg:hidden
          `}
        >
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Filters
            </h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDarkMode
                  ? 'hover:bg-slate-700 text-gray-400 hover:text-white'
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              aria-label="Close filters"
            >
              <FaTimes />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <div className="p-4 lg:p-0">
          <ProjectFilterPanel
            filters={filters}
            onFilterChange={onFilterChange}
            onClearAll={onClearAll}
            hasActiveFilters={hasActiveFilters}
          />
        </div>
      </motion.div>
    </>
  )
}

export default FilterSidebar
