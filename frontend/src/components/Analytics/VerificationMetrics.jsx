import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaShieldAlt } from 'react-icons/fa'

const VerificationMetrics = ({ stats }) => {
  const metrics = [
    {
      icon: FaStar,
      label: 'Shortlist Rate',
      value: `${stats.shortlistRate}%`,
      total: `${stats.shortlisted} of ${stats.totalApplications}`,
      color: 'from-yellow-500 to-amber-500'
    },
    {
      icon: FaShieldAlt,
      label: 'Skills Verification Rate',
      value: `${stats.verificationRate}%`,
      total: `${stats.skillsVerified} of ${stats.shortlisted}`,
      color: 'from-green-500 to-teal-500'
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-8'>
      {metrics.map((metric, idx) => {
        const Icon = metric.icon
        return (
          <motion.div key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + idx * 0.1 }} className={`bg-gradient-to-br ${metric.color} p-6 rounded-xl shadow-lg`}>
            <div className='flex items-center gap-4 mb-3'>
              <Icon className='text-3xl opacity-80' />
              <div>
                <p className='text-sm opacity-80 font-semibold'>{metric.label}</p>
                <p className='text-3xl font-bold text-white'>{metric.value}</p>
              </div>
            </div>
            <p className='text-sm opacity-70'>{metric.total}</p>
          </motion.div>
        )
      })}
    </div>
  )
}

export default VerificationMetrics
