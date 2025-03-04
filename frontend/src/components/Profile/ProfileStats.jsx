import React from 'react'
import { motion } from 'framer-motion'
import { FaProjectDiagram, FaCheckCircle, FaClock, FaStar, FaWallet } from 'react-icons/fa'

const ProfileStats = () => {
  const stats = [
    { icon: <FaProjectDiagram />, label: 'Total Projects', value: '24', trend: '+5' },
    { icon: <FaCheckCircle />, label: 'Completed', value: '18', trend: '+3' },
    { icon: <FaClock />, label: 'In Progress', value: '6', trend: '+2' },
    { icon: <FaStar />, label: 'Success Rate', value: '95%', trend: '+2%' },
    { icon: <FaWallet />, label: 'Total Earnings', value: '$12,450', trend: '+$1,250' }
  ]

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.h2 className='text-2xl font-bold theme-text' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Dashboard Overview
      </motion.h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}>
            <div className='flex flex-col gap-4'>
              <motion.div className='text-2xl text-accent' initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}>
                {stat.icon}
              </motion.div>
              <div>
                <motion.div className='text-2xl font-bold theme-text' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}>
                  {stat.value}
                </motion.div>
                <div className='theme-text-secondary text-sm'>{stat.label}</div>
                <motion.div className='text-green-500 text-sm mt-2' initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}>
                  {stat.trend}
                </motion.div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

export default ProfileStats
