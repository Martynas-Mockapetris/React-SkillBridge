import React from 'react'
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
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold theme-text'>Dashboard Overview</h2>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6'>
        {stats.map((stat, index) => (
          <div key={index} className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300'>
            <div className='flex flex-col gap-4'>
              <div className='text-2xl text-accent'>{stat.icon}</div>
              <div>
                <div className='text-2xl font-bold theme-text'>{stat.value}</div>
                <div className='theme-text-secondary text-sm'>{stat.label}</div>
                <div className='text-green-500 text-sm mt-2'>{stat.trend}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProfileStats
