import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { FaArrowRight, FaBriefcase, FaCheck, FaClock, FaEnvelope, FaTimes, FaUserFriends } from 'react-icons/fa'
import { acceptConnectionRequest, declineConnectionRequest, getMyConnections, removeConnection } from '../../services/userService'
import LoadingSpinner from '../shared/LoadingSpinner'
import VerificationBadge from '../shared/VerificationBadge'
import DirectContactModal from '../../modal/DirectContactModal'
import HireFreelancerModal from '../../modal/HireFreelancerModal'

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

  const sections = [
    {
      key: 'incoming',
      title: 'Incoming Requests',
      description: 'People who want to add you to their professional network.',
      items: connections.incomingRequests,
      emptyMessage: 'No incoming requests right now.'
    },
    {
      key: 'outgoing',
      title: 'Pending Requests',
      description: 'Requests you already sent and are waiting on.',
      items: connections.outgoingRequests,
      emptyMessage: 'No pending requests.'
    },
    {
      key: 'accepted',
      title: 'Your Network',
      description: 'People you are already connected with.',
      items: connections.acceptedConnections,
      emptyMessage: 'No accepted connections yet.'
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
          <div>
            <h2 className='text-xl font-semibold theme-text'>{section.title}</h2>
            <p className='text-sm theme-text-secondary'>{section.description}</p>
          </div>

          {section.items.length === 0 ? (
            <div className='rounded-2xl border border-dashed dark:border-light/10 border-primary/10 px-6 py-8 text-center theme-text-secondary'>{section.emptyMessage}</div>
          ) : (
            <div className='grid gap-4'>
              {section.items.map((connection) => {
                const otherUser = connection.otherUser || {}
                const canOpenFreelancerProfile = ['freelancer', 'both'].includes(otherUser.userType)
                const hourlyRateLabel = otherUser.showHourlyRate && otherUser.hourlyRate ? `€${otherUser.hourlyRate}/hr` : 'Rate on request'
                const locationLabel = otherUser.showLocationPublic && otherUser.location ? otherUser.location : ''
                const canDirectMessage = otherUser.allowDirectMessages !== false
                const canInviteToProjects = otherUser.allowProjectInvites !== false

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
                          <div className='mt-2 flex flex-wrap gap-2 text-xs theme-text-secondary'>
                            {otherUser.availabilityStatus ? <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{otherUser.availabilityStatus.replace('_', ' ')}</span> : null}
                            <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{hourlyRateLabel}</span>
                            {locationLabel ? <span className='rounded-full bg-primary/5 px-3 py-1 dark:bg-light/5'>{locationLabel}</span> : null}
                          </div>
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
