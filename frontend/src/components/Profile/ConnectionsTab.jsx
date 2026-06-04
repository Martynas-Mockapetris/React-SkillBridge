import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaBriefcase, FaCheck, FaClock, FaEnvelope, FaSearch, FaThumbtack, FaTimes, FaUserFriends } from 'react-icons/fa'
import { acceptConnectionRequest, declineConnectionRequest, getMyConnections, removeConnection } from '../../services/userService'
import LoadingSpinner from '../shared/LoadingSpinner'
import VerificationBadge from '../shared/VerificationBadge'
import DirectContactModal from '../../modal/DirectContactModal'
import HireFreelancerModal from '../../modal/HireFreelancerModal'

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

const sortConnections = (items = [], sectionKey, pinnedConnectionIds = []) => {
  return [...items].sort((left, right) => {
    if (sectionKey === 'accepted') {
      const leftPinned = pinnedConnectionIds.includes(left._id)
      const rightPinned = pinnedConnectionIds.includes(right._id)

      if (leftPinned !== rightPinned) {
        return leftPinned ? -1 : 1
      }
    }
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

const getPinnedConnectionsStorageKey = () => {
  if (typeof window === 'undefined') {
    return 'skillbridge:pinned-connections'
  }

  try {
    const currentUser = JSON.parse(window.localStorage.getItem('user') || '{}')
    return currentUser?._id ? `skillbridge:pinned-connections:${currentUser._id}` : 'skillbridge:pinned-connections'
  } catch {
    return 'skillbridge:pinned-connections'
  }
}

const readPinnedConnectionIds = () => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(getPinnedConnectionsStorageKey()) || '[]')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
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
  const [pinnedConnectionIds, setPinnedConnectionIds] = useState(() => readPinnedConnectionIds())

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

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }

    window.localStorage.setItem(getPinnedConnectionsStorageKey(), JSON.stringify(pinnedConnectionIds))
  }, [pinnedConnectionIds])

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

  const handleTogglePinnedConnection = (connectionId) => {
    setPinnedConnectionIds((currentIds) => (currentIds.includes(connectionId) ? currentIds.filter((id) => id !== connectionId) : [...currentIds, connectionId]))
  }

  const acceptedFilterOptions = [
    { key: 'all', label: 'All' },
    { key: 'available', label: 'Available Now' },
    { key: 'strongest', label: 'Strongest Profiles' }
  ]
  const filteredAcceptedConnections = filterAcceptedConnections(connections.acceptedConnections, acceptedFilter)
  const searchedAcceptedConnections = searchAcceptedConnections(filteredAcceptedConnections, acceptedSearch)
  const filteredAcceptedCount = searchedAcceptedConnections.length
  const pinnedAcceptedCount = connections.acceptedConnections.filter((connection) => pinnedConnectionIds.includes(connection._id)).length

  const sections = [
    {
      key: 'incoming',
      title: 'Incoming Requests',
      description: 'People who want to add you to their professional network.',
      items: sortConnections(connections.incomingRequests, 'incoming', pinnedConnectionIds),
      emptyMessage: 'No incoming requests right now.'
    },
    {
      key: 'outgoing',
      title: 'Pending Requests',
      description: 'Requests you already sent and are waiting on.',
      items: sortConnections(connections.outgoingRequests, 'outgoing', pinnedConnectionIds),
      emptyMessage: 'No pending requests.'
    },
    {
      key: 'accepted',
      title: 'Your Network',
      description: 'People you are already connected with.',
      items: sortConnections(searchedAcceptedConnections, 'accepted', pinnedConnectionIds),
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

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 xl:grid-cols-[minmax(0,1fr)_180px_180px_180px] xl:items-stretch'>
        <div className='overflow-hidden rounded-2xl border border-primary/10 bg-gradient-to-br from-white/80 via-white/60 to-accent/5 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-light/10 dark:from-light/[0.06] dark:via-light/[0.03] dark:to-accent/10'>
          <div className='flex flex-col gap-4 px-5 py-5 md:px-6'>
            <div className='grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end'>
              <label className='block'>
                <span className='mb-2 block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Search network</span>
                <div className='relative'>
                  <FaSearch className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent/80' size={16} />
                  <input
                    id='accepted-network-search'
                    type='text'
                    value={acceptedSearch}
                    onChange={(event) => setAcceptedSearch(event.target.value)}
                    placeholder='Search by name, skill, service, headline, or location'
                    className='h-[50px] w-full rounded-lg border border-primary/10 bg-white/80 pl-11 pr-4 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-light/10 dark:bg-light/[0.06]'
                  />
                </div>
              </label>

              <div className='flex flex-wrap gap-2 xl:justify-end'>
                {acceptedFilterOptions.map((option) => (
                  <button
                    key={option.key}
                    type='button'
                    onClick={() => setAcceptedFilter(option.key)}
                    className={`inline-flex h-[50px] items-center justify-center rounded-lg px-5 text-sm font-medium transition-all ${
                      acceptedFilter === option.key ? 'bg-accent text-white' : 'border border-primary/10 theme-text-secondary hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-light/10'
                    }`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className='flex flex-col gap-3 border-t border-primary/10 pt-3 dark:border-light/10 lg:flex-row lg:items-center lg:justify-between'>
              <p className='text-xs font-medium uppercase tracking-[0.14em] theme-text-secondary'>
                Showing {filteredAcceptedCount} of {connections.acceptedConnections.length} connections
                {pinnedAcceptedCount > 0 ? ` • Pinned: ${pinnedAcceptedCount}` : ''}
                {acceptedFilter !== 'all' ? ` • Filter: ${acceptedFilterOptions.find((option) => option.key === acceptedFilter)?.label}` : ''}
                {acceptedSearch.trim() ? ` • Search: ${acceptedSearch.trim()}` : ''}
              </p>

              <button
                type='button'
                onClick={() => {
                  setAcceptedFilter('all')
                  setAcceptedSearch('')
                }}
                className='inline-flex items-center justify-center rounded-full border border-primary/10 px-4 py-2 text-sm font-medium theme-text-secondary transition-all hover:border-accent hover:bg-accent/5 hover:text-accent dark:border-light/10'>
                Clear tools
              </button>
            </div>
          </div>
        </div>

        <div className='theme-card rounded-2xl px-5 py-4'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Connections</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.connectionsCount}</p>
        </div>

        <div className='theme-card rounded-2xl px-5 py-4'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Incoming</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.incomingCount}</p>
        </div>

        <div className='theme-card rounded-2xl px-5 py-4'>
          <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Pending</p>
          <p className='mt-2 text-3xl font-bold theme-text'>{connections.summary.outgoingCount}</p>
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.key} className='space-y-3'>
          <div className='space-y-1'>
            <h2 className='text-xl font-semibold theme-text'>{section.title}</h2>
            <p className='text-sm theme-text-secondary'>{section.description}</p>
          </div>

          {section.items.length === 0 ? (
            <div className='rounded-2xl border border-dashed dark:border-light/10 border-primary/10 px-6 py-10 text-center theme-text-secondary'>
              <p>{section.emptyMessage}</p>
              {section.key === 'accepted' && (acceptedFilter !== 'all' || acceptedSearch.trim()) && (
                <button
                  type='button'
                  onClick={() => {
                    setAcceptedFilter('all')
                    setAcceptedSearch('')
                  }}
                  className='mt-4 inline-flex rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white'>
                  Reset Network Tools
                </button>
              )}
            </div>
          ) : (
            <div className={section.key === 'accepted' ? 'grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4' : 'grid gap-3'}>
              {section.items.map((connection) => {
                const otherUser = connection.otherUser || {}
                const canOpenFreelancerProfile = ['freelancer', 'both'].includes(otherUser.userType)
                const locationLabel = otherUser.showLocationPublic && otherUser.location ? otherUser.location : ''
                const canDirectMessage = otherUser.allowDirectMessages !== false
                const canInviteToProjects = otherUser.allowProjectInvites !== false
                const activityLabel = formatConnectionActivity(connection, section.key)
                const isPinned = pinnedConnectionIds.includes(connection._id)
                const isAcceptedCard = section.key === 'accepted'

                return (
                  <motion.div
                    key={connection._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`rounded-2xl border transition-all ${
                      isAcceptedCard
                        ? 'h-full border-accent/20 bg-gradient-to-br from-white via-white to-accent/5 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 hover:shadow-[0_18px_38px_rgba(0,0,0,0.1)] dark:border-accent/20 dark:from-light/[0.06] dark:via-light/[0.04] dark:to-accent/10'
                        : 'theme-card border-primary/10 p-4 md:p-5 dark:border-light/10'
                    }`}>
                    <div className={section.key === 'accepted' ? 'flex h-full flex-col gap-3' : 'flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between'}>
                      <div className={section.key === 'accepted' ? 'flex items-start gap-2.5' : 'flex items-start gap-3'}>
                        <img
                          src={otherUser.profilePicture || `https://i.pravatar.cc/150?u=${otherUser._id}`}
                          alt={otherUser.firstName || 'User'}
                          className={`${section.key === 'accepted' ? 'h-10 w-10' : 'h-12 w-12'} rounded-full object-cover border border-accent/20`}
                        />
                        <div className='min-w-0'>
                          {isAcceptedCard && (
                            <div className='mb-2 flex flex-wrap items-center gap-2'>
                              <span className='inline-flex rounded-full bg-accent/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-accent'>Connected</span>
                              {isPinned && (
                                <span className='inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent'>
                                  <FaThumbtack size={10} />
                                  <span>Pinned</span>
                                </span>
                              )}
                            </div>
                          )}

                          <div className='flex flex-wrap items-center gap-2'>
                            <h3 className={`${isAcceptedCard ? 'text-sm' : 'text-lg'} font-semibold theme-text`}>{[otherUser.firstName, otherUser.lastName].filter(Boolean).join(' ') || 'User'}</h3>
                            <VerificationBadge isVerified={otherUser.isEmailVerified} />
                          </div>
                          <p className={`${isAcceptedCard ? 'mt-1 text-[11px] leading-5' : 'text-sm'} theme-text-secondary`}>{otherUser.headline || 'Professional profile'}</p>

                          {activityLabel && (
                            <div className='mt-2 inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent'>
                              <FaClock size={10} />
                              <span>{activityLabel}</span>
                            </div>
                          )}

                          <div className='mt-2 flex flex-wrap gap-1.5 text-[11px] theme-text-secondary'>
                            {otherUser.availabilityStatus ? <span className='rounded-full bg-primary/5 px-2 py-0.5 dark:bg-light/5'>{otherUser.availabilityStatus.replace('_', ' ')}</span> : null}
                            {locationLabel ? <span className='rounded-full bg-primary/5 px-2 py-0.5 dark:bg-light/5'>{locationLabel}</span> : null}
                          </div>
                        </div>
                      </div>

                      <div
                        className={
                          isAcceptedCard ? 'mt-auto flex flex-wrap items-center gap-1.5 border-t border-primary/10 pt-3 dark:border-light/10' : 'flex flex-wrap items-center gap-2.5 xl:max-w-[420px] xl:justify-end'
                        }>
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
                            className='inline-flex items-center gap-1.5 rounded-lg bg-accent px-2.5 py-1.5 text-[11px] font-medium text-white transition-colors hover:bg-accent/90'>
                            <FaEnvelope />
                            <span>Message</span>
                          </button>
                        )}

                        {section.key === 'accepted' && canInviteToProjects && (
                          <button
                            type='button'
                            onClick={() => handleOpenProjectInvite(otherUser)}
                            className='inline-flex items-center gap-1.5 rounded-lg bg-primary/5 px-2.5 py-1.5 text-[11px] font-medium theme-text transition-colors hover:bg-primary hover:text-white dark:bg-light/5'>
                            <FaBriefcase />
                            <span>Invite to Project</span>
                          </button>
                        )}

                        {section.key === 'accepted' && (
                          <button
                            type='button'
                            onClick={() => handleTogglePinnedConnection(connection._id)}
                            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[11px] font-medium transition-colors ${
                              isPinned ? 'bg-accent text-white hover:bg-accent/90' : 'bg-primary/5 theme-text hover:bg-primary hover:text-white dark:bg-light/5'
                            }`}>
                            <FaThumbtack />
                            <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                          </button>
                        )}

                        {section.key === 'accepted' && canOpenFreelancerProfile ? (
                          <button
                            type='button'
                            onClick={() => navigate(`/freelancer/${otherUser._id}`, { state: { returnTo: '/profile' } })}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-primary/10 px-2.5 py-1.5 text-[11px] font-medium theme-text transition-colors hover:border-accent hover:text-accent dark:border-light/10'>
                            <FaArrowRight />
                            <span>View Profile</span>
                          </button>
                        ) : null}

                        {section.key === 'accepted' && (
                          <button
                            type='button'
                            onClick={() => handleAction(connection._id, 'remove')}
                            disabled={actionId === connection._id}
                            className='inline-flex items-center gap-1.5 rounded-lg border border-primary/10 px-2 py-1.5 text-[11px] font-medium theme-text transition-colors hover:text-red-500 disabled:opacity-60 dark:border-light/10'>
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
