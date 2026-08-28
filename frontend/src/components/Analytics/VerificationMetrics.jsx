import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaShieldAlt } from 'react-icons/fa'

const VerificationMetrics = ({ stats }) => {
  const metrics = [
    {
      icon: FaStar,
      label: 'Shortlist Rate',
      value: `${stats.shortlistRate}%`,
      total: `${stats.shortlisted} of ${stats.totalApplications}`
    },
    {
      icon: FaShieldAlt,
      label: 'Skills Verification Rate',
      value: `${stats.verificationRate}%`,
      total: `${stats.skillsVerified} of ${stats.shortlisted}`
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + idx * 0.1 }} className='bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300'>
            <div className='flex items-center gap-4 mb-3'>
              <Icon className='text-3xl text-accent' />
              <div>
                <p className='text-sm theme-text-secondary font-semibold'>{metric.label}</p>
                <p className='text-3xl font-bold theme-text'>{metric.value}</p>
              </div>
            </div>
            <p className='text-sm theme-text-secondary'>{metric.total}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default VerificationMetrics
