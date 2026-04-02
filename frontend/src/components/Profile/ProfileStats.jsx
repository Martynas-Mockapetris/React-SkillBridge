import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaProjectDiagram, FaCheckCircle, FaClock, FaStar, FaWallet, FaBullhorn, FaEnvelopeOpenText, FaUserFriends } from 'react-icons/fa'
import { getUserStats } from '../../services/userService'
import { getUserAnnouncements } from '../../services/announcementService'
import { getUserMessages } from '../../services/messageService'
import LoadingSpinner from '../shared/LoadingSpinner'

const ProfileStats = ({ user }) => {
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)

        const [stats, announcements, messages] = await Promise.all([getUserStats(), getUserAnnouncements().catch(() => []), getUserMessages().catch(() => [])])

        const currentUserId = user?._id
        const extractId = (value) => (typeof value === 'string' ? value : value?._id)

        const announcementCount = Array.isArray(announcements) ? announcements.length : 0
        const unreadMessages = Array.isArray(messages) ? messages.filter((message) => !message.isRead && extractId(message.receiver) === currentUserId).length : 0
        const connectionsCount = Array.isArray(user?.favoriteFreelancers) ? user.favoriteFreelancers.length : 0

        const formattedStats = [
          {
            icon: <FaProjectDiagram />,
            label: 'Total Projects',
            value: stats.totalProjects.toString(),
            trend: stats.totalProjectsTrend >= 0 ? `+${stats.totalProjectsTrend}` : `${stats.totalProjectsTrend}`
          },
          {
            icon: <FaCheckCircle />,
            label: 'Completed',
            value: stats.completed.toString(),
            trend: stats.completedTrend >= 0 ? `+${stats.completedTrend}` : `${stats.completedTrend}`
          },
          {
            icon: <FaClock />,
            label: 'In Progress',
            value: stats.inProgress.toString(),
            trend: stats.inProgressTrend >= 0 ? `+${stats.inProgressTrend}` : `${stats.inProgressTrend}`
          },
          {
            icon: <FaStar />,
            label: 'Success Rate',
            value: `${stats.successRate}%`,
            trend: stats.successRateTrend >= 0 ? `+${stats.successRateTrend}%` : `${stats.successRateTrend}%`
          },
          {
            icon: <FaWallet />,
            label: 'Total Earnings',
            value: `€${stats.totalEarnings.toLocaleString()}`,
            trend: stats.totalEarningsTrend >= 0 ? `+€${stats.totalEarningsTrend.toLocaleString()}` : `€${stats.totalEarningsTrend.toLocaleString()}`
          },
          {
            icon: <FaBullhorn />,
            label: 'Announcements',
            value: announcementCount.toString(),
            trend: 'Live'
          },
          {
            icon: <FaEnvelopeOpenText />,
            label: 'Unread Messages',
            value: unreadMessages.toString(),
            trend: unreadMessages > 0 ? 'Needs attention' : 'All caught up'
          },
          {
            icon: <FaUserFriends />,
            label: 'Connections',
            value: connectionsCount.toString(),
            trend: 'Favorites network'
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
  }, [user?._id, user?.favoriteFreelancers])

  if (loading) {
    return (
      <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <motion.h2 className='text-2xl font-bold theme-text'>Dashboard Overview</motion.h2>
        <div className='flex justify-center py-12'>
          <LoadingSpinner />
        </div>
      </motion.div>
    )
  }

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

  const stats = statsData || []

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.h2 className='text-2xl font-bold theme-text' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        Dashboard Overview
      </motion.h2>

      <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 backdrop-blur-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.2 }
            }}>
            <div className='flex flex-col gap-4'>
              <motion.div className='text-2xl text-accent' initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: index * 0.08 + 0.2 }}>
                {stat.icon}
              </motion.div>
              <div>
                <motion.div className='text-2xl font-bold theme-text' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, delay: index * 0.08 + 0.3 }}>
                  {stat.value}
                </motion.div>
                <div className='theme-text-secondary text-sm'>{stat.label}</div>
                <motion.div className='text-green-500 text-sm mt-2' initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.08 + 0.4 }}>
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
