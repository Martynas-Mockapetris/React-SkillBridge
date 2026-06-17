import React from 'react'
import { motion } from 'framer-motion'
import { FaChartLine, FaUsers, FaEye, FaCheckCircle } from 'react-icons/fa'

const AnalyticsOverview = ({ stats }) => {
  const cards = [
    {
      icon: FaChartLine,
      label: 'Total Applications',
      value: stats.totalApplications,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: FaEye,
      label: 'Profile Views',
      value: stats.profileViews,
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: FaCheckCircle,
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: FaUsers,
      label: 'Response Rate',
      value: `${stats.responseRate}%`,
      color: 'from-orange-500 to-red-500'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
      {cards.map((card, idx) => {
        const Icon = card.icon
        return (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className={`bg-gradient-to-br ${card.color} p-6 rounded-xl shadow-lg`}>
            <div className='flex items-center justify-between mb-2'>
              <Icon className='text-2xl opacity-80' />
              <span className='text-xs font-semibold opacity-70 uppercase tracking-wider'>{card.label}</span>
            </div>
            <p className='text-4xl font-bold text-white'>{card.value}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default AnalyticsOverview
