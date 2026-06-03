import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaBriefcase, FaCheck, FaClock, FaEnvelope, FaGithub, FaGlobe, FaLinkedin, FaStar, FaTimes, FaUserFriends } from 'react-icons/fa'
import { acceptConnectionRequest, declineConnectionRequest, getMyConnections, removeConnection } from '../../services/userService'
import LoadingSpinner from '../shared/LoadingSpinner'
import VerificationBadge from '../shared/VerificationBadge'
import DirectContactModal from '../../modal/DirectContactModal'
import HireFreelancerModal from '../../modal/HireFreelancerModal'

const parseCommaSeparatedList = (value) => {
  if (!value || typeof value !== 'string') return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
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
      return ''
  }
}

const truncateText = (value, maxLength = 160) => {
  if (!value || typeof value !== 'string') return ''
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength).trimEnd()}...`
}

const formatConnectionActivity = (connection, sectionKey) => {
  const requestedDate = connection.requestedAt ? new Date(connection.requestedAt) : null
  const respondedDate = connection.respondedAt ? new Date(connection.respondedAt) : null

  if (sectionKey === 'accepted' && respondedDate) {
    return `Connected since ${respondedDate.toLocaleDateString()}`
  }

  if (sectionKey === 'incoming' && requestedDate) {
    return `Requested on ${requestedDate.toLocaleDateString()}`
  }

  if (sectionKey === 'outgoing' && requestedDate) {
    return `Sent on ${requestedDate.toLocaleDateString()}`
  }

  if (requestedDate) {
    return `Updated on ${requestedDate.toLocaleDateString()}`
  }

  return ''
}

const getConnectionSortTimestamp = (connection, sectionKey) => {
  if (sectionKey === 'accepted' && connection.respondedAt) {
    return new Date(connection.respondedAt).getTime()
  }

  if (connection.requestedAt) {
    return new Date(connection.requestedAt).getTime()
  }

  return 0
}

const sortConnections = (items = [], sectionKey) => {
  return [...items].sort((left, right) => {
    const rightTimestamp = getConnectionSortTimestamp(right, sectionKey)
    const leftTimestamp = getConnectionSortTimestamp(left, sectionKey)

    if (rightTimestamp !== leftTimestamp) {
      return rightTimestamp - leftTimestamp
    }

    const rightRatings = right.otherUser?.totalRatings || 0
    const leftRatings = left.otherUser?.totalRatings || 0

    if (rightRatings !== leftRatings) {
      return rightRatings - leftRatings
    }

    const rightCompletedProjects = right.otherUser?.completedProjectsCount || 0
    const leftCompletedProjects = left.otherUser?.completedProjectsCount || 0

    if (rightCompletedProjects !== leftCompletedProjects) {
      return rightCompletedProjects - leftCompletedProjects
    }

    const rightName = `${right.otherUser?.firstName || ''} ${right.otherUser?.lastName || ''}`.trim()
    const leftName = `${left.otherUser?.firstName || ''} ${left.otherUser?.lastName || ''}`.trim()

    return rightName.localeCompare(leftName)
  })
}

const filterAcceptedConnections = (items = [], filter) => {
  if (filter === 'available') {
    return items.filter((connection) => connection.otherUser?.availabilityStatus === 'available')
  }

  if (filter === 'strongest') {
    return items.filter((connection) => {
      const totalRatings = connection.otherUser?.totalRatings || 0
      const completedProjectsCount = connection.otherUser?.completedProjectsCount || 0
      return totalRatings > 0 || completedProjectsCount > 0
    })
  }

  return items
}

const searchAcceptedConnections = (items = [], searchValue = '') => {
  const normalizedQuery = searchValue.trim().toLowerCase()

  if (!normalizedQuery) {
    return items
  }

  return items.filter((connection) => {
    const otherUser = connection.otherUser || {}
    const fullName = `${otherUser.firstName || ''} ${otherUser.lastName || ''}`.trim().toLowerCase()
    const headline = (otherUser.headline || '').toLowerCase()
    const skills = (otherUser.skills || '').toLowerCase()
    const services = (otherUser.servicesOffered || '').toLowerCase()
    const location = (otherUser.location || '').toLowerCase()

    return fullName.includes(normalizedQuery) || headline.includes(normalizedQuery) || skills.includes(normalizedQuery) || services.includes(normalizedQuery) || location.includes(normalizedQuery)
  })
}

const applyAcceptedPreset = (presetKey, setAcceptedFilter, setAcceptedSearch) => {
  if (presetKey === 'availableStrongest') {
    setAcceptedFilter('available')
    setAcceptedSearch('')
    return
  }

  if (presetKey === 'reviewedTalent') {
    setAcceptedFilter('strongest')
    setAcceptedSearch('review')
    return
  }

  if (presetKey === 'clear') {
    setAcceptedFilter('all')
    setAcceptedSearch('')
  }
}

const getNetworkSpotlights = (items = []) => {
  const availableNow = items.find((connection) => connection.otherUser?.availabilityStatus === 'available') || null

  const mostReviewed =
    [...items].sort((left, right) => {
      const rightRatings = right.otherUser?.totalRatings || 0
      const leftRatings = left.otherUser?.totalRatings || 0

      if (rightRatings !== leftRatings) {
        return rightRatings - leftRatings
      }

      const rightAverage = right.otherUser?.averageRating || 0
      const leftAverage = left.otherUser?.averageRating || 0

      return rightAverage - leftAverage
    })[0] || null

  const mostExperienced =
    [...items].sort((left, right) => {
      const rightExperience = right.otherUser?.yearsOfExperience || 0
      const leftExperience = left.otherUser?.yearsOfExperience || 0

      if (rightExperience !== leftExperience) {
        return rightExperience - leftExperience
      }

      const rightCompletedProjects = right.otherUser?.completedProjectsCount || 0
      const leftCompletedProjects = left.otherUser?.completedProjectsCount || 0

      return rightCompletedProjects - leftCompletedProjects
    })[0] || null

  return [
    {
      key: 'availableNow',
      label: 'Available Now',
      description: 'Ready to respond quickly',
      connection: availableNow
    },
    {
      key: 'mostReviewed',
      label: 'Most Reviewed',
      description: 'Strongest social proof',
      connection: mostReviewed
    },
    {
      key: 'mostExperienced',
      label: 'Most Experienced',
      description: 'Deepest track record',
      connection: mostExperienced
    }
  ].filter((item) => item.connection)
}

const ConnectionsTab = () => {
  const navigate = useNavigate()
  const [connections, setConnections] = useState({
    incomingRequests: [],
    outgoingRequests: [],
    acceptedConnections: [],
    summary: {
      incomingCount: 0,
      outgoingCount: 0,
      connectionsCount: 0
    }
  })
  const [loading, setLoading] = useState(true)
  const [actionId, setActionId] = useState('')
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedConnectionUser, setSelectedConnectionUser] = useState(null)
  const [showHireModal, setShowHireModal] = useState(false)
  const [acceptedFilter, setAcceptedFilter] = useState('all')
  const [acceptedSearch, setAcceptedSearch] = useState('')

  const loadConnections = async () => {
    try {
      setLoading(true)
      const data = await getMyConnections()
      setConnections(data)
    } catch (error) {
      console.error('Failed to load connections:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConnections()
  }, [])

  const handleAction = async (connectionId, action) => {
    try {
      setActionId(connectionId)

      if (action === 'accept') {
        await acceptConnectionRequest(connectionId)
      } else if (action === 'decline') {
        await declineConnectionRequest(connectionId)
      } else {
        await removeConnection(connectionId)
      }

      await loadConnections()
    } catch (error) {
      console.error('Failed to update connection:', error)
      alert(error.response?.data?.message || 'Failed to update connection')
    } finally {
      setActionId('')
    }
  }

  const handleOpenDirectMessage = (user) => {
    setSelectedConnectionUser(user)
    setShowContactModal(true)
  }

  const handleOpenProjectInvite = (user) => {
    setSelectedConnectionUser(user)
    setShowHireModal(true)
  }

  const handleOpenFreelancerSection = (userId, focusSection) => {
    navigate(`/freelancer/${userId}`, {
      state: {
        returnTo: '/profile',
        focusSection
      }
    })
  }

  const sections = [
    {
      key: 'incoming',
      title: 'Incoming Requests',
      description: 'People who want to add you to their professional network.',
      items: sortConnections(connections.incomingRequests, 'incoming'),
      emptyMessage: 'No incoming requests right now.'
    },
    {
      key: 'outgoing',
      title: 'Pending Requests',
      description: 'Requests you already sent and are waiting on.',
      items: sortConnections(connections.outgoingRequests, 'outgoing'),
      emptyMessage: 'No pending requests.'
    },
    {
      key: 'accepted',
      title: 'Your Network',
      description: 'People you are already connected with.',
      items: sortConnections(searchedAcceptedConnections, 'accepted'),
      emptyMessage: acceptedSearch.trim() ? 'No connections match your search right now.' : acceptedFilter === 'all' ? 'No accepted connections yet.' : 'No connections match this filter right now.'
    }
  ]

  if (loading) {
    return (
      <div className='flex justify-center py-12'>
        <LoadingSpinner />
      </div>
    )
  }

  const acceptedFilterOptions = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available Now' },
    { key: 'strongest', label: 'Strongest Profiles' }
  ]
  const acceptedPresetOptions = [
    { key: 'availableStrongest', label: 'Ready to Hire' },
    { key: 'reviewedTalent', label: 'Reviewed Talent' },
    { key: 'clear', label: 'Reset View' }
  ]
  const filteredAcceptedConnections = filterAcceptedConnections(connections.acceptedConnections, acceptedFilter)
  const searchedAcceptedConnections = searchAcceptedConnections(filteredAcceptedConnections, acceptedSearch)
  const filteredAcceptedCount = searchedAcceptedConnections.length
  const acceptedSpotlights = getNetworkSpotlights(searchedAcceptedConnections)

  return (
    <div className='space-y-8'>
      <div className='grid gap-4 md:grid-cols-3'>
        <div className='theme-card rounded-2xl p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Connections</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.connectionsCount}</p>
        </div>
        <div className='theme-card rounded-2xl p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Incoming</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.incomingCount}</p>
        </div>
        <div className='theme-card rounded-2xl p-5'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Pending</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.outgoingCount}</p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.key} className='space-y-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1'>
              <h2 className='text-xl font-semibold theme-text'>{section.title}</h2>
              <p className='text-sm theme-text-secondary'>{section.description}</p>

              {section.key === 'accepted' && (
                <p className='text-xs font-medium uppercase tracking-[0.14em] theme-text-secondary'>
                  Showing {filteredAcceptedCount} of {connections.acceptedConnections.length} connections
                  {acceptedFilter !== 'all' ? ` • Filter: ${acceptedFilterOptions.find((option) => option.key === acceptedFilter)?.label}` : ''}
                  {acceptedSearch.trim() ? ` • Search: ${acceptedSearch.trim()}` : ''}
                </p>
              )}

              {section.key === 'accepted' && acceptedSpotlights.length > 0 && (
                <div className='mt-4 grid gap-3 md:grid-cols-3'>
                  {acceptedSpotlights.map((spotlight) => {
                    const spotlightUser = spotlight.connection.otherUser || {}

                    return (
                      <button
                        key={spotlight.key}
                        type='button'
                        onClick={() => navigate(`/freelancer/${spotlightUser._id}`, { state: { returnTo: '/profile' } })}
                        className='rounded-2xl border border-primary/10 bg-primary/5 p-4 text-left transition-colors hover:border-accent hover:bg-accent/5 dark:border-light/10 dark:bg-light/5'>
                        <p className='text-[11px] font-semibold uppercase tracking-[0.14em] text-accent'>{spotlight.label}</p>
                        <p className='mt-2 text-sm font-semibold theme-text'>{[spotlightUser.firstName, spotlightUser.lastName].filter(Boolean).join(' ') || 'User'}</p>
                        <p className='mt-1 text-sm theme-text-secondary'>{spotlight.description}</p>
                        <div className='mt-3 flex flex-wrap gap-2 text-xs theme-text-secondary'>
                          {spotlight.key === 'mostReviewed' ? <span className='rounded-full bg-primary/10 px-3 py-1 dark:bg-light/10'>{spotlightUser.totalRatings || 0} reviews</span> : null}
                          {spotlight.key === 'mostExperienced' ? <span className='rounded-full bg-primary/10 px-3 py-1 dark:bg-light/10'>{spotlightUser.yearsOfExperience || 0}+ yrs</span> : null}
                          {spotlight.key === 'availableNow' ? <span className='rounded-full bg-primary/10 px-3 py-1 dark:bg-light/10'>Available</span> : null}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {section.key === 'accepted' && (
              <div className='flex w-full flex-col gap-3 md:w-auto md:items-end'>
                <input
                  type='text'
                  value={acceptedSearch}
                  onChange={(event) => setAcceptedSearch(event.target.value)}
                  placeholder='Search by name, skill, service, or location'
                  className='w-full rounded-full border border-primary/10 bg-transparent px-4 py-2 text-sm theme-text placeholder:theme-text-secondary dark:border-light/10 md:w-[320px]'
                />

                <div className='flex flex-wrap gap-2 md:justify-end'>
                  {acceptedPresetOptions.map((preset) => (
                    <button
                      key={preset.key}
                      type='button'
                      onClick={() => applyAcceptedPreset(preset.key, setAcceptedFilter, setAcceptedSearch)}
                      className='rounded-full border border-primary/10 px-3 py-1.5 text-xs font-medium theme-text-secondary transition-colors hover:border-accent hover:text-accent dark:border-light/10'>
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div className='flex flex-wrap gap-2 md:justify-end'>
                  {acceptedFilterOptions.map((option) => (
                    <button
                      key={option.key}
                      type='button'
                      onClick={() => setAcceptedFilter(option.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                        acceptedFilter === option.key ? 'bg-accent text-white' : 'bg-primary/5 theme-text-secondary hover:bg-primary/10 dark:bg-light/5'
                      }`}>
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {section.items.length === 0 ? (
            <div className='rounded-2xl border border-dashed dark:border-light/10 border-primary/10 px-6 py-8 text-center theme-text-secondary'>
              <p>{section.emptyMessage}</p>
              {section.key === 'accepted' && (acceptedFilter !== 'all' || acceptedSearch.trim()) && (
                <button
                  type='button'
                  onClick={() => {
                    setAcceptedFilter('all')
                    setAcceptedSearch('')
                  }}
                  className='mt-4 inline-flex rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white'>
                  Clear Search & Filter
                </button>
              )}
            </div>
          ) : (
            <div className='grid gap-4'>
              {section.items.map((connection) => {
                const otherUser = connection.otherUser || {}
                const canOpenFreelancerProfile = ['freelancer', 'both'].includes(otherUser.userType)
                const hourlyRateLabel = otherUser.showHourlyRate && otherUser.hourlyRate ? `€${otherUser.hourlyRate}/hr` : 'Rate on request'
                const locationLabel = otherUser.showLocationPublic && otherUser.location ? otherUser.location : ''
                const canDirectMessage = otherUser.allowDirectMessages !== false
                const canInviteToProjects = otherUser.allowProjectInvites !== false
                const topSkills = parseCommaSeparatedList(otherUser.skills).slice(0, 4)
                const topServices = parseCommaSeparatedList(otherUser.servicesOffered).slice(0, 3)
                const experienceLevelLabel = formatExperienceLevelLabel(otherUser.experienceLevel)
                const yearsExperienceLabel = otherUser.yearsOfExperience > 0 ? `${otherUser.yearsOfExperience}+ yrs experience` : ''
                const ratingValue = typeof otherUser.averageRating === 'number' ? otherUser.averageRating : 0
                const totalRatings = typeof otherUser.totalRatings === 'number' ? otherUser.totalRatings : 0
                const hasRatings = totalRatings > 0
                const completedProjectsCount = typeof otherUser.completedProjectsCount === 'number' ? otherUser.completedProjectsCount : 0
                const hasCompletedProjects = completedProjectsCount > 0
                const recentReview = otherUser.recentReview || null
                const hasRecentReview = Boolean(recentReview?.feedback)
                const publicLinks = [
                  otherUser.website
                    ? {
                        key: 'website',
                        label: 'Website',
                        href: otherUser.website.startsWith('http') ? otherUser.website : `https://${otherUser.website}`,
                        icon: FaGlobe
                      }
                    : null,
                  otherUser.github
                    ? {
                        key: 'github',
                        label: 'GitHub',
                        href: otherUser.github.startsWith('http') ? otherUser.github : `https://${otherUser.github}`,
                        icon: FaGithub
                      }
                    : null,
                  otherUser.linkedin
                    ? {
                        key: 'linkedin',
                        label: 'LinkedIn',
                        href: otherUser.linkedin.startsWith('http') ? otherUser.linkedin : `https://${otherUser.linkedin}`,
                        icon: FaLinkedin
                      }
                    : null
                ].filter(Boolean)
                const hasOpportunities = topServices.length > 0
                const activityLabel = formatConnectionActivity(connection, section.key)

                return (
                  <motion.div key={connection._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className='theme-card rounded-2xl p-5'>
                    <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                      <div className='flex items-start gap-4'>
                        <img src={otherUser.profilePicture || `https://i.pravatar.cc/150?u=${otherUser._id}`} alt={otherUser.firstName || 'User'} className='h-14 w-14 rounded-full object-cover border border-accent/20' />
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-2'>
                            <h3 className='text-lg font-semibold theme-text'>{[otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || 'User'}</h3>
                            <VerificationBadge isVerified={otherUser.isEmailVerified} />
                          </div>
                          <p className='text-sm theme-text-secondary'>{otherUser.headline || 'Professional profile'}</p>

                          {activityLabel && (
                            <div className='mt-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent'>
                              <FaClock size={10} />
                              <span>{activityLabel}</span>
                            </div>
                          )}

                          <div className='mt-2 flex flex-wrap gap-2 text-xs theme-text-secondary'>
                            {otherUser.availabilityStatus ? <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{otherUser.availabilityStatus.replace('_', ' ')}</span> : null}
                            <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{hourlyRateLabel}</span>
                            {locationLabel ? <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{locationLabel}</span> : null}
                          </div>

                          {section.key === 'accepted' &&
                            (experienceLevelLabel || yearsExperienceLabel || topServices.length > 0 || hasRatings || hasCompletedProjects || hasRecentReview || topSkills.length > 0 || publicLinks.length > 0) && (
                              <div className='mt-4 space-y-3'>
                                {(experienceLevelLabel || yearsExperienceLabel) && (
                                  <div className='flex flex-wrap gap-2 text-xs'>
                                    {experienceLevelLabel ? <span className='rounded-full bg-accent/10 px-3 py-1 font-medium text-accent'>{experienceLevelLabel}</span> : null}
                                    {yearsExperienceLabel ? <span className='rounded-full bg-primary/5 px-3 py-1 theme-text-secondary dark:bg-light/5'>{yearsExperienceLabel}</span> : null}
                                  </div>
                                )}

                                {topServices.length > 0 && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Services</p>
                                    <div className='flex flex-wrap gap-2'>
                                      {topServices.map((service) => (
                                        <span key={service} className='rounded-full border border-primary/10 px-3 py-1 text-xs theme-text-secondary dark:border-light/10'>
                                          {service}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {hasRatings && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Reputation</p>
                                    <div className='flex flex-wrap items-center gap-3'>
                                      <div className='flex items-center gap-2'>
                                        <span className='text-sm font-semibold text-accent'>{ratingValue.toFixed(1)}</span>
                                        <div className='flex items-center gap-1'>
                                          {[1, 2, 3, 4, 5].map((star) => (
                                            <FaStar key={star} className={star <= Math.round(ratingValue) ? 'text-accent' : 'theme-text-muted'} size={12} />
                                          ))}
                                        </div>
                                      </div>
                                      <span className='text-xs theme-text-secondary'>
                                        {totalRatings} {totalRatings === 1 ? 'review' : 'reviews'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {hasCompletedProjects && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Delivery</p>
                                    <div className='flex flex-wrap items-center gap-2'>
                                      <span className='rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                                        {completedProjectsCount} completed {completedProjectsCount === 1 ? 'project' : 'projects'}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {hasRecentReview && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Recent Review</p>
                                    <div className='rounded-2xl border border-primary/10 bg-primary/5 p-4 dark:border-light/10 dark:bg-light/5'>
                                      <p className='text-sm italic theme-text'>"${truncateText(recentReview.feedback)}"</p>
                                      <div className='mt-3 flex flex-wrap items-center gap-3 text-xs theme-text-secondary'>
                                        {typeof recentReview.score === 'number' ? (
                                          <span className='inline-flex items-center gap-1 rounded-full bg-accent/10 px-3 py-1 font-medium text-accent'>
                                            <FaStar size={10} />
                                            {recentReview.score}/5
                                          </span>
                                        ) : null}
                                        {recentReview.createdAt ? <span>{new Date(recentReview.createdAt).toLocaleDateString()}</span> : null}
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {publicLinks.length > 0 && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Profile Links</p>
                                    <div className='flex flex-wrap gap-2'>
                                      {publicLinks.map((link) => {
                                        const Icon = link.icon

                                        return (
                                          <a
                                            key={link.key}
                                            href={link.href}
                                            target='_blank'
                                            rel='noreferrer'
                                            className='inline-flex items-center gap-2 rounded-full border border-primary/10 px-3 py-1 text-xs theme-text-secondary transition-colors hover:border-accent hover:text-accent dark:border-light/10'>
                                            <Icon size={12} />
                                            <span>{link.label}</span>
                                          </a>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )}

                                {topSkills.length > 0 && (
                                  <div>
                                    <p className='mb-2 text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Top Skills</p>
                                    <div className='flex flex-wrap gap-2'>
                                      {topSkills.map((skill) => (
                                        <span key={skill} className='rounded-full bg-primary/5 px-3 py-1 text-xs theme-text-secondary dark:bg-light/5'>
                                          {skill}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className='flex flex-wrap items-center gap-3'>
                        {section.key === 'incoming' && (
                          <>
                            <button
                              type='button'
                              onClick={() => handleAction(connection._id, 'accept')}
                              disabled={actionId === connection._id}
                              className='inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500 disabled:opacity-60'>
                              <FaCheck />
                              <span>Accept</span>
                            </button>
                            <button
                              type='button'
                              onClick={() => handleAction(connection._id, 'decline')}
                              disabled={actionId === connection._id}
                              className='inline-flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2 text-sm font-medium theme-text transition-colors hover:text-red-500 disabled:opacity-60 dark:border-light/10'>
                              <FaTimes />
                              <span>Decline</span>
                            </button>
                          </>
                        )}

                        {section.key === 'outgoing' && (
                          <button
                            type='button'
                            onClick={() => handleAction(connection._id, 'remove')}
                            disabled={actionId === connection._id}
                            className='inline-flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2 text-sm font-medium theme-text transition-colors hover:text-red-500 disabled:opacity-60 dark:border-light/10'>
                            <FaClock />
                            <span>Cancel Request</span>
                          </button>
                        )}

                        {section.key === 'accepted' && canDirectMessage && (
                          <button
                            type='button'
                            onClick={() => handleOpenDirectMessage(otherUser)}
                            className='inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90'>
                            <FaEnvelope />
                            <span>Message</span>
                          </button>
                        )}

                        {section.key === 'accepted' && canInviteToProjects && (
                          <button
                            type='button'
                            onClick={() => handleOpenProjectInvite(otherUser)}
                            className='inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent/90'>
                            <FaBriefcase />
                            <span>Invite to Project</span>
                          </button>
                        )}

                        {section.key === 'accepted' && hasRatings && canOpenFreelancerProfile && (
                          <button
                            type='button'
                            onClick={() => handleOpenFreelancerSection(otherUser._id, 'reviews')}
                            className='inline-flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm font-medium theme-text transition-colors hover:bg-primary hover:text-white dark:bg-light/5'>
                            <FaStar />
                            <span>View Reviews</span>
                          </button>
                        )}

                        {section.key === 'accepted' && hasOpportunities && canOpenFreelancerProfile && (
                          <button
                            type='button'
                            onClick={() => handleOpenFreelancerSection(otherUser._id, 'announcements')}
                            className='inline-flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2 text-sm font-medium theme-text transition-colors hover:bg-primary hover:text-white dark:bg-light/5'>
                            <FaBriefcase />
                            <span>View Opportunities</span>
                          </button>
                        )}

                        {section.key === 'accepted' && canOpenFreelancerProfile ? (
                          <button
                            type='button'
                            onClick={() => navigate(`/freelancer/${otherUser._id}`, { state: { returnTo: '/profile' } })}
                            className='inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white'>
                            <FaArrowRight />
                            <span>View Profile</span>
                          </button>
                        ) : null}

                        {section.key === 'accepted' && (
                          <button
                            type='button'
                            onClick={() => handleAction(connection._id, 'remove')}
                            disabled={actionId === connection._id}
                            className='inline-flex items-center gap-2 rounded-lg border border-primary/10 px-4 py-2 text-sm font-medium theme-text transition-colors hover:text-red-500 disabled:opacity-60 dark:border-light/10'>
                            <FaUserFriends />
                            <span>Remove</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      ))}
      <DirectContactModal isOpen={showContactModal} onClose={() => setShowContactModal(false)} freelancer={selectedConnectionUser} />
      <HireFreelancerModal isOpen={showHireModal} onClose={() => setShowHireModal(false)} freelancer={selectedConnectionUser} />
    </div>
  )
}

export default ConnectionsTab
