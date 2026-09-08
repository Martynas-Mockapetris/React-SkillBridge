import { motion } from 'framer-motion'
import { FaChartLine, FaUsers, FaEye, FaCheckCircle } from 'react-icons/fa'

const AnalyticsOverview = ({ stats }) => {
  const cards = [
    {
      icon: FaChartLine,
      label: 'Total Applications',
      value: stats.totalApplications
    },
    {
      icon: FaEye,
      label: 'Profile Views',
      value: stats.profileViews
    },
    {
      icon: FaCheckCircle,
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`
    },
    {
      icon: FaUsers,
      label: 'Response Rate',
      value: `${stats.responseRate}%`
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className='bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center justify-between mb-2'>
              <Icon className='text-2xl text-accent' />
              <span className='text-xs font-semibold theme-text-secondary uppercase tracking-wider'>{card.label}</span>
            </div>
            <p className='text-4xl font-bold theme-text'>{card.value}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default AnalyticsOverview
