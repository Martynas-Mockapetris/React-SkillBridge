import React, { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaArrowLeft, FaPhone, FaEnvelope, FaBriefcase, FaClock, FaEuroSign, FaMapMarkerAlt, FaGlobe, FaTools, FaCheckCircle, FaUserPlus } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getFreelancerRatings, getRatingStats } from '../services/ratingService'
import { getUserById, getMyConnections, sendConnectionRequest, acceptConnectionRequest } from '../services/userService'
import { getAllAnnouncements } from '../services/announcementService'
import RatingsSection from '../components/Profile/RatingsSection'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import molecularPattern from '../assets/molecular-pattern.svg'
import DirectContactModal from '../modal/DirectContactModal'
import HireFreelancerModal from '../modal/HireFreelancerModal'
import AvailabilityCalendar from '../components/shared/AvailabilityCalendar'

const formatAvailabilityLabel = (value) => {
  switch (value) {
    case 'available':
      return 'Available'
    case 'limited':
      return 'Limited availability'
    case 'unavailable':
      return 'Unavailable'
    default:
      return 'Availability not specified'
  }
}

const formatResponseTimeLabel = (value) => {
  switch (value) {
    case 'within_24_hours':
      return 'Within 24 hours'
    case 'within_3_days':
      return 'Within 3 days'
    case 'within_week':
      return 'Within a week'
    case 'flexible':
      return 'Flexible'
    default:
      return 'Not specified'
  }
}

const formatWorkPreferenceLabel = (value) => {
  switch (value) {
    case 'remote':
      return 'Remote'
    case 'hybrid':
      return 'Hybrid'
    case 'onsite':
      return 'On-site'
    case 'flexible':
      return 'Flexible'
    default:
      return 'Not specified'
  }
}

const formatExperienceLevelLabel = (value) => {
  switch (value) {
    case 'entry':
      return 'Entry level'
    case 'intermediate':
      return 'Intermediate'
    case 'expert':
      return 'Expert'
    default:
      return 'Not specified'
  }
}

const formatProjectSizeLabel = (value) => {
  switch (value) {
    case 'small':
      return 'Small'
    case 'medium':
      return 'Medium'
    case 'large':
      return 'Large'
    case 'ongoing':
      return 'Ongoing'
    case 'flexible':
      return 'Flexible'
    default:
      return 'Not specified'
  }
}

const parseCommaSeparatedList = (value) => {
  if (!value || typeof value !== 'string') return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const resolveConnectionState = (connectionData, userId) => {
  if (!connectionData || !userId) {
    return { status: 'none', connection: null }
  }

  const findMatch = (items = []) => items.find((item) => item.otherUser?._id === userId)

  const accepted = findMatch(connectionData.acceptedConnections)
  if (accepted) {
    return { status: 'accepted', connection: accepted }
  }

  const incoming = findMatch(connectionData.incomingRequests)
  if (incoming) {
    return { status: 'incoming', connection: incoming }
  }

  const outgoing = findMatch(connectionData.outgoingRequests)
  if (outgoing) {
    return { status: 'pending', connection: outgoing }
  }

  return { status: 'none', connection: null }
}

const UserDetail = () => {
  const { freelancerId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth()

  // State
  const [freelancer, setFreelancer] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [ratings, setRatings] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState('none')
  const [connectionRecord, setConnectionRecord] = useState(null)
  const [connectionLoading, setConnectionLoading] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showHireModal, setShowHireModal] = useState(false)
  const reviewsSectionRef = useRef(null)
  const announcementsSectionRef = useRef(null)

  // Fetch freelancer data, announcements, and ratings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const freelancerData = await getUserById(freelancerId)
        setFreelancer(freelancerData)

        // Load the current connection state for this freelancer profile
        if (currentUser) {
          try {
            const connectionData = await getMyConnections()
            const nextConnectionState = resolveConnectionState(connectionData, freelancerId)
            setConnectionStatus(nextConnectionState.status)
            setConnectionRecord(nextConnectionState.connection)
          } catch (error) {
            console.error('Error checking connection status:', error)
            setConnectionStatus('none')
            setConnectionRecord(null)
          }
        } else {
          setConnectionStatus('none')
          setConnectionRecord(null)
        }

        // Fetch announcements
        const allAnnouncements = await getAllAnnouncements()
        const freelancerAnnouncements = allAnnouncements.filter((ann) => (typeof ann.userId === 'string' ? ann.userId === freelancerId : ann.userId._id === freelancerId || ann.userId === freelancerId))
        setAnnouncements(freelancerAnnouncements)

        // Fetch ratings
        const ratingsData = await getFreelancerRatings(freelancerId)
        const statsData = await getRatingStats(freelancerId)
        setRatings(ratingsData)
        setRatingStats(statsData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching freelancer data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [freelancerId, currentUser])

  useEffect(() => {
    if (loading) return

    if (location.state?.focusSection === 'reviews' && reviewsSectionRef.current) {
      reviewsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      return
    }

    if (location.state?.focusSection === 'announcements' && announcementsSectionRef.current) {
      announcementsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [loading, location.state])

  if (loading) {
    return <LoadingSpinner fullScreen />
  }

  const handleBack = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo)
      return
    }

    navigate(-1)
  }

  if (!freelancer) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <h1 className='text-2xl font-bold theme-text mb-4'>Freelancer not found</h1>
        <button onClick={handleBack} className='btn-primary'>
          Back to Listings
        </button>
      </div>
    )
  }

  const handleConnectionAction = async () => {
    if (!currentUser) {
      alert('Please login to manage connections')
      return
    }

    try {
      setConnectionLoading(true)

      if (connectionStatus === 'incoming' && connectionRecord?._id) {
        await acceptConnectionRequest(connectionRecord._id)
      } else if (connectionStatus === 'none') {
        await sendConnectionRequest(freelancerId)
      } else {
        return
      }

      const connectionData = await getMyConnections()
      const nextConnectionState = resolveConnectionState(connectionData, freelancerId)
      setConnectionStatus(nextConnectionState.status)
      setConnectionRecord(nextConnectionState.connection)
    } catch (error) {
      console.error('Error updating connection:', error)
      alert(error.response?.data?.message || 'Failed to update connection')
    } finally {
      setConnectionLoading(false)
    }
  }

  const availabilityLabel = formatAvailabilityLabel(freelancer.availabilityStatus)
  const visibleLocation = freelancer.showLocationPublic ? freelancer.location : ''
  const visibleHourlyRate = freelancer.showHourlyRate && freelancer.hourlyRate ? `€${freelancer.hourlyRate}/hr` : 'Rate on request'
  const profileSkills = parseCommaSeparatedList(freelancer.skills).slice(0, 6)
  const offeredServices = parseCommaSeparatedList(freelancer.servicesOffered).slice(0, 4)
  const responseTimeLabel = formatResponseTimeLabel(freelancer.responseTime)
  const workPreferenceLabel = formatWorkPreferenceLabel(freelancer.workPreference)
  const experienceLevelLabel = formatExperienceLevelLabel(freelancer.experienceLevel)
  const preferredProjectSizeLabel = formatProjectSizeLabel(freelancer.preferredProjectSize)
  const canDirectMessage = freelancer.allowDirectMessages !== false
  const canInviteToProjects = freelancer.allowProjectInvites !== false
  const announcementServicePreview = parseCommaSeparatedList(freelancer.servicesOffered).slice(0, 3)
  const announcementCategoryPreview = parseCommaSeparatedList(freelancer.serviceCategories).slice(0, 3)

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      {/* Molecular patterns */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-20 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[500px] h-[500px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-50deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 py-12 relative z-10'>
        {/* Back Button */}
        <motion.button onClick={handleBack} className='flex items-center gap-2 text-accent hover:text-accent/80 mb-8 transition-colors' whileHover={{ x: -5 }}>
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>

        {/* Freelancer Header */}
        <motion.div className='flex items-start gap-6 mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className='w-32 h-32 rounded-full overflow-hidden border-4 border-accent' whileHover={{ scale: 1.05 }}>
            <img src={freelancer.profilePicture || `https://i.pravatar.cc/150?u=${freelancer._id}`} alt='Profile' className='w-full h-full object-cover' />
          </motion.div>
          <div className='flex-1'>
            <h1 className='text-4xl font-bold theme-text mb-2'>
              {freelancer.firstName} {freelancer.lastName}
            </h1>
            <div className='flex flex-wrap items-center gap-2 mb-2'>
              <p className='theme-text-secondary'>{freelancer.headline || 'Freelancer'}</p>
              {freelancer.isEmailVerified && (
                <span className='inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                  <FaCheckCircle className='text-[10px]' />
                  Verified
                </span>
              )}
            </div>
            {ratingStats && (
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-2xl font-bold text-accent'>{ratingStats.averageRating.toFixed(1)}</span>
                <div className='flex'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} size={18} className={star <= Math.round(ratingStats.averageRating) ? 'text-accent' : 'theme-text-muted'} />
                  ))}
                </div>
                <span className='text-sm theme-text-secondary'>({ratingStats.totalRatings} ratings)</span>
              </div>
            )}
            {/* Action Buttons */}
            <div className='flex flex-wrap gap-3'>
              {canDirectMessage ? (
                <motion.button onClick={() => setShowContactModal(true)} className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all' whileHover={{ scale: 1.05 }}>
                  Contact Freelancer
                </motion.button>
              ) : (
                <div className='px-6 py-2 rounded-lg bg-gray-100 dark:bg-light/10 theme-text-secondary text-sm border dark:border-light/10 border-primary/10'>Direct messages disabled</div>
              )}

              {canInviteToProjects ? (
                <motion.button
                  onClick={() => {
                    if (!currentUser) {
                      alert('Please login to hire a freelancer')
                      return
                    }
                    setShowHireModal(true)
                  }}
                  className='px-6 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all'
                  whileHover={{ scale: 1.05 }}>
                  Hire
                </motion.button>
              ) : (
                <div className='px-6 py-2 rounded-lg bg-gray-100 dark:bg-light/10 theme-text-secondary text-sm border dark:border-light/10 border-primary/10'>Project invites disabled</div>
              )}

              {currentUser?._id !== freelancerId && (
                <motion.button
                  onClick={handleConnectionAction}
                  disabled={connectionLoading || connectionStatus === 'pending' || connectionStatus === 'accepted'}
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg transition-all ${
                    connectionStatus === 'accepted'
                      ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800/40 cursor-default'
                      : connectionStatus === 'pending'
                        ? 'bg-primary/10 text-primary/60 dark:bg-light/10 dark:text-light/60 cursor-not-allowed'
                        : connectionStatus === 'incoming'
                          ? 'bg-green-600 text-white hover:bg-green-500'
                          : 'bg-accent/10 text-accent hover:bg-accent hover:text-white'
                  }`}
                  whileHover={connectionStatus === 'pending' || connectionStatus === 'accepted' ? {} : { scale: 1.05 }}>
                  <FaUserPlus />
                  <span>{connectionStatus === 'accepted' ? 'Connected' : connectionStatus === 'pending' ? 'Request Sent' : connectionStatus === 'incoming' ? 'Accept Connection' : 'Connect'}</span>
                </motion.button>
              )}
            </div>
            <div className='mt-3 space-y-2'>
              {(!canDirectMessage || !canInviteToProjects) && <p className='text-sm theme-text-secondary'>This freelancer has limited contact preferences enabled in their profile settings.</p>}

              {connectionStatus === 'pending' && <p className='text-sm theme-text-secondary'>Your connection request has been sent and is waiting for approval.</p>}
              {connectionStatus === 'incoming' && <p className='text-sm theme-text-secondary'>This freelancer already sent you a connection request. You can accept it here.</p>}
              {connectionStatus === 'accepted' && <p className='text-sm text-green-700 dark:text-green-300'>You are connected in the network. Use direct messages or project invites to keep the relationship active.</p>}
            </div>
          </div>
        </motion.div>

        <motion.div className='mb-12 grid lg:grid-cols-2 gap-6 items-stretch' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <div className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border dark:border-light/10 border-primary/10'>
            <h2 className='text-2xl font-bold theme-text mb-4'>Professional Snapshot</h2>

            {freelancer.bio && <p className='theme-text-secondary leading-7 mb-5'>{freelancer.bio}</p>}

            <div className='flex flex-wrap gap-3 mb-5'>
              <span className='inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                <FaClock className='text-accent' />
                {availabilityLabel}
              </span>

              <span className='inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                <FaBriefcase className='text-accent' />
                {freelancer.yearsOfExperience > 0 ? `Years of experience: ${freelancer.yearsOfExperience}+` : 'Years of experience: N/A'}
              </span>

              <span className='inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                <FaEuroSign className='text-accent' />
                {visibleHourlyRate}
              </span>

              {visibleLocation && (
                <span className='inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                  <FaMapMarkerAlt className='text-accent' />
                  {visibleLocation}
                </span>
              )}

              {freelancer.timezone && (
                <span className='inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                  <FaGlobe className='text-accent' />
                  {freelancer.timezone}
                </span>
              )}
            </div>

            {profileSkills.length > 0 && (
              <div className='mb-5'>
                <p className='text-xs uppercase tracking-wide theme-text-muted mb-3'>Core Skills</p>
                <div className='flex flex-wrap gap-2'>
                  {profileSkills.map((skill) => (
                    <span key={skill} className='px-3 py-1 rounded-full text-sm bg-accent/15 text-accent'>
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {offeredServices.length > 0 && (
              <div>
                <p className='text-xs uppercase tracking-wide theme-text-muted mb-3'>Services Offered</p>
                <div className='flex flex-wrap gap-2'>
                  {offeredServices.map((service) => (
                    <span key={service} className='px-3 py-1 rounded-full text-sm bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='h-full p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border dark:border-light/10 border-primary/10'>
            <h2 className='text-2xl font-bold theme-text mb-3'>Working Style</h2>
            <div className='grid sm:grid-cols-2 gap-3'>
              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Work Preference</p>
                <p className='text-sm theme-text-secondary leading-6'>{workPreferenceLabel}</p>
              </div>

              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Response Time</p>
                <p className='text-sm theme-text-secondary leading-6'>{responseTimeLabel}</p>
              </div>

              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Experience Level</p>
                <p className='text-sm theme-text-secondary leading-6'>{experienceLevelLabel}</p>
              </div>

              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Preferred Project Size</p>
                <p className='text-sm theme-text-secondary leading-6'>{preferredProjectSizeLabel}</p>
              </div>

              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Preferred Engagements</p>
                <p className='text-sm theme-text-secondary leading-6'>
                  {Array.isArray(freelancer.preferredEngagements) && freelancer.preferredEngagements.length > 0 ? freelancer.preferredEngagements.join(', ') : 'Not specified'}
                </p>
              </div>

              <div className='p-3 rounded-lg bg-primary/5 dark:bg-light/5 border dark:border-light/10 border-primary/10'>
                <p className='text-[11px] uppercase tracking-wide theme-text-muted mb-1'>Availability Details</p>
                <p className='text-sm theme-text-secondary leading-6'>{freelancer.availabilityDetails || 'No additional availability details provided.'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <motion.div ref={announcementsSectionRef} className='mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className='text-2xl font-bold theme-text mb-6'>Active Announcements</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {announcements.map((announcement) => (
                <motion.div
                  key={announcement._id}
                  className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border dark:border-light/10 border-primary/10 backdrop-blur-sm h-full flex flex-col'>
                  <div className='flex items-start justify-between gap-4 mb-4'>
                    <div>
                      <p className='text-[11px] uppercase tracking-wide text-accent/80 mb-2'>Freelance Offer</p>
                      <h3 className='text-xl font-bold theme-text leading-snug'>{announcement.title}</h3>
                    </div>
                    <span className='shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-accent/15 text-accent'>€{announcement.hourlyRate}/hr</span>
                  </div>

                  <p className='theme-text-secondary leading-7 mb-5'>{announcement.background}</p>

                  {announcement.skills?.length > 0 && (
                    <div className='mb-4'>
                      <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Announcement Skills</p>
                      <div className='flex flex-wrap gap-2'>
                        {announcement.skills.map((skill) => (
                          <span key={skill} className='px-3 py-1 rounded-full text-sm bg-accent/15 text-accent'>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {(announcementServicePreview.length > 0 || announcementCategoryPreview.length > 0) && (
                    <div className='mt-auto pt-4 border-t dark:border-light/10 border-primary/10 grid sm:grid-cols-2 gap-4'>
                      <div>
                        <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Services</p>
                        <div className='flex flex-wrap gap-2'>
                          {announcementServicePreview.length > 0 ? (
                            announcementServicePreview.map((service) => (
                              <span key={service} className='px-3 py-1 rounded-full text-xs bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                                {service}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm theme-text-secondary'>Not specified</span>
                          )}
                        </div>
                      </div>

                      <div>
                        <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Categories</p>
                        <div className='flex flex-wrap gap-2'>
                          {announcementCategoryPreview.length > 0 ? (
                            announcementCategoryPreview.map((category) => (
                              <span key={category} className='px-3 py-1 rounded-full text-xs bg-primary/10 dark:bg-light/10 theme-text-secondary border dark:border-light/10 border-primary/10'>
                                {category}
                              </span>
                            ))
                          ) : (
                            <span className='text-sm theme-text-secondary'>Not specified</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Public Availability Calendar */}
        <motion.div className='mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
          <h2 className='text-2xl font-bold theme-text mb-6'>Project Availability</h2>
          <p className='theme-text-secondary mb-6'>View {freelancer.firstName}'s current availability and project timeline. This helps you understand their capacity before sending a project invitation.</p>
          <AvailabilityCalendar freelancerId={freelancer._id} isOwnProfile={false} isPublicView={true} />
        </motion.div>

        {/* Ratings Section */}
        {ratings && ratingStats && (
          <motion.div ref={reviewsSectionRef} className='mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className='text-2xl font-bold theme-text mb-6'>Reviews & Ratings</h2>
            <RatingsSection ratings={ratings} stats={ratingStats} loading={false} />
          </motion.div>
        )}
      </div>
      <DirectContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} freelancer={freelancer} />
      <HireFreelancerModal isOpen={showHireModal} onClose={() => setShowHireModal(false)} freelancer={freelancer} />
    </section>
  )
}

export default UserDetail
