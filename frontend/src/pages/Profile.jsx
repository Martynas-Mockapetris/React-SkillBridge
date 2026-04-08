import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaUser, FaProjectDiagram, FaCog, FaLock, FaEnvelope, FaBriefcase, FaStar, FaShieldAlt } from 'react-icons/fa'
import ProfileStats from '../components/Profile/ProfileStats'
import ProjectsList from '../components/Profile/ProjectsList'
import ProfileSettings from '../components/Profile/ProfileSettings'
import SecuritySettings from '../components/Profile/SecuritySettings'
import FreelanceTab from '../components/Profile/FreelanceTab'
import RatingsSection from '../components/Profile/RatingsSection'
import MessagesList from '../components/Profile/MessagesList'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { getUserMessages } from '../services/messageService'
import { calculateProfileCompleteness } from '../utils/profileCompleteness'
import { getFreelancerRatings, getRatingStats } from '../services/ratingService'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Profile = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const { currentUser } = useAuth()
  const [ratings, setRatings] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [ratingsLoading, setRatingsLoading] = useState(false)
  const navigate = useNavigate()
  const profileCompleteness = calculateProfileCompleteness(currentUser)

  // Redirect if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/login')
    }
  }, [currentUser, navigate])

  // Fetch messages when Messages tab is active
  useEffect(() => {
    const fetchMessages = async () => {
      if (activeTab === 'messages') {
        try {
          setMessagesLoading(true)
          const data = await getUserMessages()
          setMessages(data)
        } catch (error) {
          console.error('Error fetching messages:', error)
        } finally {
          setMessagesLoading(false)
        }
      }
    }

    fetchMessages()
  }, [activeTab])

  // Fetch ratings for freelancers
  useEffect(() => {
    const fetchRatings = async () => {
      // Only fetch if user is freelancer
      if (!currentUser || (currentUser.userType !== 'freelancer' && currentUser.userType !== 'both')) {
        return
      }

      try {
        setRatingsLoading(true)
        const ratingsData = await getFreelancerRatings(currentUser._id)
        const statsData = await getRatingStats(currentUser._id)
        setRatings(ratingsData)
        setRatingStats(statsData)
      } catch (error) {
        console.error('Error fetching ratings:', error)
      } finally {
        setRatingsLoading(false)
      }
    }

    fetchRatings()
  }, [currentUser])

  const getRoleLabel = () => {
    if (!currentUser) return ''
    if (currentUser.userType === 'client') return 'Client'
    if (currentUser.userType === 'freelancer') return 'Freelancer'
    if (currentUser.userType === 'admin') return 'Administrator'
    return 'Client & Freelancer'
  }

  const formatLockDuration = (durationDays) => {
    if (!durationDays) return 'Manual review'
    return `${durationDays} day${durationDays === 1 ? '' : 's'}`
  }

  const getLockCountdown = (lockExpiresAt) => {
    if (!lockExpiresAt) return 'Pending admin review'
    const diffMs = new Date(lockExpiresAt) - new Date()
    if (diffMs <= 0) return 'Unlocking shortly'
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays > 0) return `${diffDays} day${diffDays === 1 ? '' : 's'} remaining`
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    if (diffHours > 0) return `${diffHours} hour${diffHours === 1 ? '' : 's'} remaining`
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} remaining`
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <FaUser /> },
    // Projects tab - not visible to admins
    ...(currentUser?.userType !== 'admin' ? [{ id: 'projects', label: 'Projects', icon: <FaProjectDiagram /> }] : []),
    { id: 'messages', label: 'Messages', icon: <FaEnvelope /> },
    // Freelance tab - only visible to freelancers
    ...(currentUser?.userType === 'freelancer' || currentUser?.userType === 'both'
      ? [
          { id: 'freelance', label: 'Freelance', icon: <FaBriefcase /> },
          { id: 'ratings', label: 'Ratings', icon: <FaStar /> }
        ]
      : []),
    // Admin tab - visible only to admins; click redirects immediately
    ...(currentUser?.userType === 'admin' ? [{ id: 'admin', label: 'Admin', icon: <FaShieldAlt /> }] : []),
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaLock /> }
  ]

  // If still loading or no user, could show a loading state
  if (!currentUser) {
    return <LoadingSpinner fullScreen />
  }

  const handleTabClick = (tabId) => {
    if (tabId === 'admin') {
      navigate('/admin')
      return
    }

    setActiveTab(tabId)
  }

  const handleOpenSettings = () => {
    setActiveTab('settings')
  }

  const handleOpenProjects = () => {
    setActiveTab('projects')
  }

  const handleOpenMessages = () => {
    setActiveTab('messages')
  }

  const handleOpenFreelance = () => {
    setActiveTab('freelance')
  }

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='profile' />

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        {/* Locked Account Banner */}
        {currentUser?.isLocked && (
          <motion.div className='mb-6 p-5 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/60 dark:bg-red-900/20'>
            <div className='flex items-start gap-3'>
              <FaLock className='text-red-600 dark:text-red-300 mt-1' />
              <div className='flex-1'>
                <p className='font-semibold text-red-700 dark:text-red-200 mb-1'>Account Locked</p>
                <p className='text-sm text-red-600 dark:text-red-300 mb-4'>You can finish ongoing work, but new projects, proposals, and outbound messages stay disabled until the lock lifts.</p>
                <dl className='text-sm text-red-700 dark:text-red-200 space-y-1'>
                  <div className='flex flex-wrap gap-1'>
                    <dt className='font-semibold mr-1'>Reason:</dt>
                    <dd>{currentUser.lockReason || 'No reason provided.'}</dd>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    <dt className='font-semibold mr-1'>Lock length:</dt>
                    <dd>{formatLockDuration(currentUser.lockDurationDays)}</dd>
                  </div>
                  <div className='flex flex-wrap gap-1'>
                    <dt className='font-semibold mr-1'>Unlocks:</dt>
                    <dd>{currentUser.lockExpiresAt ? `${new Date(currentUser.lockExpiresAt).toLocaleString()} · ${getLockCountdown(currentUser.lockExpiresAt)}` : 'Manual admin review required'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </motion.div>
        )}
        {/* Profile Header */}
        <motion.div className='flex items-center gap-6 mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className='w-24 h-24 rounded-full overflow-hidden border-4 border-accent' whileHover={{ scale: 1.05 }} transition={{ duration: 0.3 }}>
            <img src={currentUser?.profilePicture || `https://i.pravatar.cc/150?u=${currentUser?._id}`} alt='Profile' className='w-full h-full object-cover' onError={(e) => (e.target.src = '/default-avatar.png')} />
          </motion.div>
          <div>
            <h1 className='text-3xl font-bold theme-text'>
              {currentUser?.firstName} {currentUser?.lastName}
            </h1>
            <p className='theme-text-secondary'>{getRoleLabel()}</p>
            {currentUser?.userType !== 'admin' && (
              <div className='flex items-center gap-2'>
                {ratingStats?.totalRatings > 0 ? (
                  <>
                    <div className='flex items-center gap-1'>
                      <span className='text-lg font-semibold text-accent'>{ratingStats.averageRating.toFixed(1)}</span>
                      <div className='flex'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar key={star} size={14} className={star <= Math.round(ratingStats.averageRating) ? 'text-accent' : 'text-gray-300 dark:text-gray-600'} />
                        ))}
                      </div>
                    </div>
                    <span className='text-sm theme-text-secondary'>
                      ({ratingStats.totalRatings} {ratingStats.totalRatings === 1 ? 'rating' : 'ratings'})
                    </span>
                  </>
                ) : (
                  <p className='text-sm theme-text-secondary'>No ratings yet</p>
                )}
              </div>
            )}
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div className='flex flex-wrap gap-2 border-b dark:border-light/10 border-primary/10 mb-8' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'theme-text-secondary hover:text-accent'}`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}>
              {tab.icon}
              <span>{tab.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode='wait'>
          <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
            {activeTab === 'overview' && (
              <ProfileStats
                user={currentUser}
                profileCompleteness={profileCompleteness}
                onOpenSettings={handleOpenSettings}
                onOpenProjects={currentUser?.userType !== 'admin' ? handleOpenProjects : undefined}
                onOpenMessages={handleOpenMessages}
                onOpenFreelance={currentUser?.userType === 'freelancer' || currentUser?.userType === 'both' ? handleOpenFreelance : undefined}
              />
            )}
            {activeTab === 'projects' && <ProjectsList user={currentUser} />}
            {activeTab === 'messages' && <MessagesList messages={messages} loading={messagesLoading} />}
            {activeTab === 'freelance' && <FreelanceTab user={currentUser} />}
            {activeTab === 'ratings' && <RatingsSection ratings={ratings} stats={ratingStats} loading={ratingsLoading} />}
            {activeTab === 'settings' && <ProfileSettings user={currentUser} />}
            {activeTab === 'security' && <SecuritySettings user={currentUser} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Profile
