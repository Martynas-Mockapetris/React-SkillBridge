import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaProjectDiagram, FaCheckCircle, FaClock, FaStar, FaWallet } from 'react-icons/fa'
import { getUserStats } from '../../services/userService' // Import stats service

const ProfileStats = () => {
  // State for storing fetched stats and loading status
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch stats when component mounts
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await getUserStats()

        // Transform backend data to match UI format
        const formattedStats = [
          {
            icon: <FaProjectDiagram />,
            label: 'Total Projects',
            value: data.totalProjects.toString(), // Convert number to string for display
            trend: data.totalProjectsTrend >= 0 ? `+${data.totalProjectsTrend}` : `${data.totalProjectsTrend}` // Format trend with + or -
          },
          {
            icon: <FaCheckCircle />,
            label: 'Completed',
            value: data.completed.toString(),
            trend: data.completedTrend >= 0 ? `+${data.completedTrend}` : `${data.completedTrend}`
          },
          {
            icon: <FaClock />,
            label: 'In Progress',
            value: data.inProgress.toString(),
            trend: data.inProgressTrend >= 0 ? `+${data.inProgressTrend}` : `${data.inProgressTrend}`
          },
          {
            icon: <FaStar />,
            label: 'Success Rate',
            value: `${data.successRate}%`, // Add % symbol
            trend: data.successRateTrend >= 0 ? `+${data.successRateTrend}%` : `${data.successRateTrend}%` // Add % to trend
          },
          {
            icon: <FaWallet />,
            label: 'Total Earnings',
            value: `€${data.totalEarnings.toLocaleString()}`, // Format with Euro symbol and thousands separator
            trend: data.totalEarningsTrend >= 0 ? `+€${data.totalEarningsTrend.toLocaleString()}` : `€${data.totalEarningsTrend.toLocaleString()}` // Format euro trend
          }
        ]

        setStatsData(formattedStats)
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, []) // Empty dependency array - fetch only on mount

  // Show loading spinner while fetching
  if (loading) {
    return (
      <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.h2 className='text-2xl font-bold theme-text'>Dashboard Overview</motion.h2>
        <div className='flex justify-center py-12'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
        </div>
      </motion.div>
    )
  }

  // Show error if fetch failed
  if (error) {
    return (
      <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.h2 className='text-2xl font-bold theme-text'>Dashboard Overview</motion.h2>
        <div className='p-6 bg-red-500/10 border border-red-500 rounded-lg'>
          <p className='theme-text text-red-500'>Failed to load statistics. Please try again later.</p>
        </div>
      </motion.div>
    )
  }

  // Use fetched data, fallback to empty array if not loaded
  const stats = statsData || []

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
