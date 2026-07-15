import { motion } from 'framer-motion'
import { FaFilter, FaSearch } from 'react-icons/fa'

const EmptyFilterState = ({ isDarkMode, onApplyFilter }) => {
  const suggestions = [
    { label: 'Budget Range', icon: '💰', description: 'Filter by project budget' },
    { label: 'By Skills', icon: '🛠️', description: 'Find projects matching your skills' },
    { label: 'By Status', icon: '📊', description: 'View active or completed projects' },
    { label: 'By Priority', icon: '⭐', description: 'Find high-priority opportunities' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-96 rounded-xl border-2 border-dashed p-8 flex flex-col items-center justify-center ${
        isDarkMode
          ? 'border-gray-700 bg-gradient-to-br from-slate-900 to-slate-800'
          : 'border-gray-300 bg-gradient-to-br from-gray-50 to-white'
      }`}
    >
      {/* Icon */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 3, repeat: Infinity }}
        className={`mb-6 text-6xl ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}
      >
        <FaFilter />
      </motion.div>

      {/* Header */}
      <h2 className={`text-2xl md:text-3xl font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
        Start Filtering
      </h2>
      <p className={`text-center mb-8 max-w-md ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        Apply filters to discover projects that match your criteria. Use the filter panel on the left to get started.
      </p>

      {/* Suggestions Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {suggestions.map((suggestion, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            onClick={onApplyFilter}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              isDarkMode
                ? 'bg-slate-800 hover:bg-slate-700 border border-slate-700'
                : 'bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl mt-1">{suggestion.icon}</span>
              <div className="flex-1">
                <h3 className={`font-semibold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {suggestion.label}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {suggestion.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="flex items-center gap-2 text-sm"
      >
        <FaSearch className={isDarkMode ? 'text-blue-400' : 'text-blue-600'} />
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          Use the filters to search and refine results
        </span>
      </motion.div>
    </motion.div>
  )
}

export default EmptyFilterState
