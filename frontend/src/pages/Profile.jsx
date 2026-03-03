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
    // Admin tab - only visible to admins
    ...(currentUser?.userType === 'admin' ? [{ id: 'admin', label: 'Admin', icon: <FaShieldAlt /> }] : []),
    { id: 'settings', label: 'Settings', icon: <FaCog /> },
    { id: 'security', label: 'Security', icon: <FaLock /> }
  ]

  // If still loading or no user, could show a loading state
  if (!currentUser) {
    return <LoadingSpinner fullScreen />
  }

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      <PageBackground variant='profile' />

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        {/* Locked Account Banner */}
        {currentUser?.isLocked && (
          <motion.div className='mb-6 p-4 rounded-lg border border-red-200 bg-red-50 dark:border-red-800/60 dark:bg-red-900/20 flex gap-3 items-start' initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <div className='shrink-0 mt-1 text-red-600 dark:text-red-300'>
              <FaLock size={18} />
            </div>
            <div>
              <p className='font-semibold text-red-700 dark:text-red-200'>Account Locked</p>
              <p className='text-sm text-red-600 dark:text-red-300'>You can finish ongoing work, but new projects, proposals, and messages are disabled until your account is unlocked.</p>
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
            <p className='theme-text-secondary'>{currentUser?.userType === 'client' ? 'Client' : currentUser?.userType === 'freelancer' ? 'Freelancer' : 'Client & Freelancer'}</p>
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
          </div>
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div className='flex flex-wrap gap-2 border-b dark:border-light/10 border-primary/10 mb-8' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-6 transition-all duration-300 ${activeTab === tab.id ? 'border-b-2 border-accent text-accent' : 'theme-text-secondary hover:text-accent'}`}
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
            {activeTab === 'overview' && <ProfileStats user={currentUser} />}
            {activeTab === 'projects' && <ProjectsList user={currentUser} />}
            {activeTab === 'messages' && <MessagesList messages={messages} loading={messagesLoading} />}
            {activeTab === 'freelance' && <FreelanceTab user={currentUser} />}
            {activeTab === 'ratings' && <RatingsSection ratings={ratings} stats={ratingStats} loading={ratingsLoading} />}
            {activeTab === 'admin' && (
              <div className='p-8 text-center theme-bg-secondary rounded-lg'>
                <h2 className='text-2xl font-bold theme-text mb-4'>Admin Dashboard</h2>
                <p className='theme-text-secondary mb-6'>Full admin dashboard coming soon...</p>
                <button onClick={() => navigate('/admin')} className='px-6 py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                  Go to Admin Panel
                </button>
              </div>
            )}
            {activeTab === 'settings' && <ProfileSettings user={currentUser} />}
            {activeTab === 'security' && <SecuritySettings user={currentUser} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}

export default Profile
