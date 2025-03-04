import { motion } from 'framer-motion'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'

const StatCard = ({ title, value, icon, trend, isLoading }) => {
  if (isLoading) {
    return (
      <motion.div 
        className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="h-20 animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg" />
      </motion.div>
    )
  }

  return (
    <motion.div 
      className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg p-6 border border-gray-100 dark:border-gray-700"
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium tracking-wider uppercase">
            {title}
          </h3>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {value}
          </p>
        </div>
        <div className="bg-accent/10 p-3 rounded-lg">
          <span className="text-accent text-2xl">{icon}</span>
        </div>
      </div>
      {trend && (
        <div className="mt-4 flex items-center">
          {trend > 0 ? (
            <FaArrowUp className="text-green-500 mr-1" />
          ) : (
            <FaArrowDown className="text-red-500 mr-1" />
          )}
          <span className={`text-sm font-bold ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
            vs last month
          </span>
        </div>
      )}
    </motion.div>
  )
}

export default StatCard
