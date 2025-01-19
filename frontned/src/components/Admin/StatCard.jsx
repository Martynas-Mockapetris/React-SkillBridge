import { motion } from 'framer-motion'

const StatCard = ({ title, value, icon, trend }) => {
  return (
    <motion.div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6' whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          <h3 className='text-gray-500 dark:text-gray-400 text-sm font-medium'>{title}</h3>
          <p className='text-2xl font-bold text-gray-900 dark:text-white mt-2'>{value}</p>
        </div>
        <div className='text-accent text-2xl'>{icon}</div>
      </div>
      {trend && (
        <div className='mt-4 flex items-center'>
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>{trend}%</span>
          <span className='text-gray-500 dark:text-gray-400 text-sm ml-2'>vs last month</span>
        </div>
      )}
    </motion.div>
  )
}

export default StatCard
