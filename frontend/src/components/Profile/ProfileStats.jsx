import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FaProjectDiagram, FaCheckCircle, FaClock, FaStar, FaWallet, FaBullhorn, FaEnvelopeOpenText, FaUserFriends, FaHistory } from 'react-icons/fa'
import { getUserStats } from '../../services/userService'
import { getUserAnnouncements } from '../../services/announcementService'
import { getUserMessages } from '../../services/messageService'
import LoadingSpinner from '../shared/LoadingSpinner'

const ProfileStats = ({ user, profileCompleteness, onOpenSettings, onOpenProjects, onOpenMessages, onOpenFreelance }) => {
  const [statsData, setStatsData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [recentAnnouncements, setRecentAnnouncements] = useState([])
  const [recentMessages, setRecentMessages] = useState([])

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

        const normalizedAnnouncements = Array.isArray(announcements) ? announcements : []
        const normalizedMessages = Array.isArray(messages) ? messages : []

        setRecentAnnouncements(normalizedAnnouncements)
        setRecentMessages(normalizedMessages)

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
  const completion = profileCompleteness?.percentage ?? 0
  const missingRequired = profileCompleteness?.missingRequired ?? []
  const missingOptional = profileCompleteness?.missingOptional ?? []
  const requiredPreview = missingRequired.slice(0, 3)
  const optionalPreview = missingOptional.slice(0, 3)

  const quickActions = [
    onOpenProjects
      ? {
          key: 'projects',
          label: 'View Projects',
          description: 'Open your projects tab',
          onClick: onOpenProjects
        }
      : null,
    onOpenMessages
      ? {
          key: 'messages',
          label: 'Open Messages',
          description: 'Review recent conversations',
          onClick: onOpenMessages
        }
      : null,
    onOpenFreelance
      ? {
          key: 'freelance',
          label: 'Manage Freelance',
          description: 'Update your freelancer presence',
          onClick: onOpenFreelance
        }
      : null,
    onOpenSettings
      ? {
          key: 'settings',
          label: 'Complete Profile',
          description: 'Update missing profile details',
          onClick: onOpenSettings
        }
      : null
  ].filter(Boolean)

  const formatRelativeDate = (value) => {
    if (!value) return 'Recently'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return 'Recently'

    const now = new Date()
    const diffMs = now - date
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`

    return date.toLocaleDateString()
  }

  const recentAnnouncementItems = recentAnnouncements
    .slice()
    .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0) - new Date(a.createdAt || a.updatedAt || 0))
    .slice(0, 2)
    .map((announcement) => ({
      key: `announcement-${announcement._id}`,
      title: announcement.title || 'Announcement updated',
      meta: announcement.isActive ? 'Announcement is live' : 'Announcement is paused',
      time: formatRelativeDate(announcement.updatedAt || announcement.createdAt)
    }))

  const recentMessageItems = recentMessages
    .slice()
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 2)
    .map((message) => {
      const isIncoming = (typeof message.receiver === 'string' ? message.receiver : message.receiver?._id) === user?._id
      const otherUser = isIncoming ? message.sender : message.receiver
      const otherName = otherUser?.userType === 'admin' ? 'Administrator' : `${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim() || 'User'

      return {
        key: `message-${message._id}`,
        title: message.subject || `Message ${isIncoming ? 'from' : 'to'} ${otherName}`,
        meta: message.isRead ? 'Read message' : 'Unread message',
        time: formatRelativeDate(message.createdAt)
      }
    })

  const profileReminderItem =
    missingRequired.length > 0 || missingOptional.length > 0
      ? [
          {
            key: 'profile-reminder',
            title: missingRequired.length > 0 ? 'Profile needs attention' : 'Profile can be improved',
            meta: missingRequired.length > 0 ? `${missingRequired.length} required field(s) still missing` : `${missingOptional.length} optional field(s) can still be added`,
            time: 'Action needed'
          }
        ]
      : [
          {
            key: 'profile-complete',
            title: 'Profile completion is on track',
            meta: 'All required profile fields are complete',
            time: `${completion}% complete`
          }
        ]

  const activityItems = [...profileReminderItem, ...recentAnnouncementItems, ...recentMessageItems].slice(0, 5)

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

      <motion.div className='p-6 rounded-lg bg-white/40 dark:bg-black/20 border theme-border' initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <div className='flex items-center gap-3 mb-4'>
          <FaHistory className='text-accent' />
          <div>
            <p className='text-xs uppercase tracking-wide theme-text-secondary'>Recent Activity</p>
            <h3 className='text-lg font-semibold theme-text mt-1'>Latest account updates</h3>
          </div>
        </div>

        <div className='space-y-3'>
          {activityItems.map((item) => (
            <div key={item.key} className='flex items-start justify-between gap-4 p-4 rounded-lg bg-white/40 dark:bg-black/20 border theme-border'>
              <div>
                <p className='font-medium theme-text'>{item.title}</p>
                <p className='text-sm theme-text-secondary mt-1'>{item.meta}</p>
              </div>
              <span className='text-xs theme-text-secondary whitespace-nowrap'>{item.time}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {quickActions.length > 0 && (
        <motion.div className='p-6 rounded-lg bg-white/40 dark:bg-black/20 border theme-border' initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}>
          <div className='flex items-center justify-between gap-4 mb-4'>
            <div>
              <p className='text-xs uppercase tracking-wide theme-text-secondary'>Quick Actions</p>
              <h3 className='text-lg font-semibold theme-text mt-1'>Jump to common tasks</h3>
            </div>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3'>
            {quickActions.map((action) => (
              <button
                key={action.key}
                type='button'
                onClick={action.onClick}
                className='text-left p-4 rounded-lg border theme-border bg-white/40 dark:bg-black/20 hover:border-accent hover:bg-white/60 dark:hover:bg-black/30 transition-colors'>
                <p className='font-medium theme-text'>{action.label}</p>
                <p className='text-sm theme-text-secondary mt-1'>{action.description}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div
        className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border theme-border'
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <p className='text-sm theme-text-secondary'>Profile Completion</p>
            <p className='text-2xl font-bold theme-text mt-1'>{completion}%</p>
          </div>

          <div className='text-sm theme-text-secondary'>
            <p>Missing required: {missingRequired.length}</p>
            <p>Missing optional: {missingOptional.length}</p>
          </div>
        </div>

        <div className='mt-4 w-full h-3 rounded-full bg-light/30 dark:bg-light/20 overflow-hidden'>
          <motion.div className='h-full bg-accent' initial={{ width: 0 }} animate={{ width: `${completion}%` }} transition={{ duration: 0.6 }} />
        </div>

        <div className='mt-4 grid grid-cols-1 md:grid-cols-2 gap-3'>
          <div className='p-3 rounded-lg bg-white/30 dark:bg-black/20'>
            <p className='text-xs uppercase tracking-wide theme-text-secondary mb-2'>Missing required</p>
            {requiredPreview.length > 0 ? (
              <ul className='space-y-1'>
                {requiredPreview.map((item) => (
                  <li key={item.key} className='text-sm text-red-500'>
                    • {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-green-500'>All required fields are complete.</p>
            )}
          </div>

          <div className='p-3 rounded-lg bg-white/30 dark:bg-black/20'>
            <p className='text-xs uppercase tracking-wide theme-text-secondary mb-2'>Recommended next</p>
            {optionalPreview.length > 0 ? (
              <ul className='space-y-1'>
                {optionalPreview.map((item) => (
                  <li key={item.key} className='text-sm theme-text-secondary'>
                    • {item.label}
                  </li>
                ))}
              </ul>
            ) : (
              <p className='text-sm text-green-500'>Optional fields are complete.</p>
            )}
          </div>
        </div>

        {(missingRequired.length > 0 || missingOptional.length > 0) && (
          <div className='mt-4'>
            <button type='button' onClick={() => onOpenSettings?.()} className='px-4 py-2 text-sm font-medium bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors'>
              Complete Profile in Settings
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export default ProfileStats
