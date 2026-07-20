import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes, FaStar } from 'react-icons/fa'
import { assignUserToProject, toggleShortlistApplicant, toggleSkillsVerified } from '../services/projectService'

const formatContactedAt = (value) => {
  if (!value) return 'Recently applied'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently applied'

  return `Applied ${date.toLocaleDateString()}`
}

const AssignModal = ({ isOpen, onClose, project, onAssignSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [assigning, setAssigning] = useState(false)
  const [togglingUserId, setTogglingUserId] = useState(null)

  if (!isOpen || !project) return null

  const interestedUsers = project.interestedUsers || []

  // Sort with shortlisted applicants first
  const sortedApplicants = [...interestedUsers].sort((a, b) => b.isShortlisted - a.isShortlisted)

  // Use sortedApplicants in render
  const displayedApplicants = sortedApplicants

  const handleToggleShortlist = async (userId) => {
    try {
      setTogglingUserId(userId)
      const interested = interestedUsers.find((u) => u.userId._id === userId)
      await toggleShortlistApplicant(project._id, userId, !interested?.isShortlisted)
      onAssignSuccess?.() // Refresh project data
    } catch (error) {
      console.error('Failed to toggle shortlist:', error)
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleToggleSkillsVerified = async (userId) => {
    try {
      setTogglingUserId(userId)
      const interested = interestedUsers.find((u) => u.userId._id === userId)
      await toggleSkillsVerified(project._id, userId, !interested?.skillsVerified)
      onAssignSuccess?.() // Refresh project data
    } catch (error) {
      console.error('Failed to toggle skills verification:', error)
    } finally {
      setTogglingUserId(null)
    }
  }

  const handleAssign = async () => {
    if (!selectedUserId) return

    try {
      setAssigning(true)
      await assignUserToProject(project._id, selectedUserId)
      onAssignSuccess?.()
      onClose()
    } catch (error) {
      console.error('Failed to assign user:', error)
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-50'>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className='bg-white dark:bg-gray-900 rounded-lg p-6 max-w-xl w-full mx-4 max-h-[80vh] overflow-y-auto'>
        {/* Header */}
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold theme-text'>Assign Project</h2>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <FaTimes size={20} />
          </button>
        </div>

        {/* Project info */}
        <div className='mb-4 p-3 bg-accent/10 rounded'>
          <p className='text-sm theme-text-secondary'>Project:</p>
          <p className='font-semibold theme-text'>{project.title}</p>
        </div>

        {/* Interested users list */}
        <div className='mb-6'>
          <p className='text-sm theme-text-secondary mb-3'>Select a freelancer:</p>

          {displayedApplicants.length === 0 ? (
            <p className='text-sm theme-text-secondary text-center py-4'>No interested freelancers yet</p>
          ) : (
            <div className='space-y-2'>
              {displayedApplicants.map((interested) => (
                <motion.button
                  key={interested.userId._id}
                  onClick={() => setSelectedUserId(interested.userId._id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${selectedUserId === interested.userId._id ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-800 theme-text hover:bg-accent/10'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  <div className='flex items-start gap-3'>
                    <img src={interested.userId.profilePicture || `https://i.pravatar.cc/150?u=${interested.userId._id}`} alt={interested.userId.firstName} className='w-10 h-10 rounded-full object-cover mt-0.5' />

                    <div className='min-w-0 flex-1'>
                      <div className='flex items-start justify-between gap-3'>
                        <div>
                          <p className='font-semibold'>
                            {interested.userId.firstName} {interested.userId.lastName}
                          </p>
                          <p className='text-xs opacity-75 break-all'>{interested.userId.email}</p>
                        </div>

                        <div className='flex gap-2 items-center'>
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${selectedUserId === interested.userId._id ? 'bg-white/20 text-white' : 'bg-accent/10 text-accent'}`}>
                            {formatContactedAt(interested.contactedAt)}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleShortlist(interested.userId._id)
                            }}
                            disabled={togglingUserId === interested.userId._id}
                            className={`text-lg p-1 transition-all ${interested.isShortlisted ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'} disabled:opacity-50`}
                            title={interested.isShortlisted ? 'Remove from shortlist' : 'Add to shortlist'}>
                            {interested.isShortlisted ? '★' : '☆'}
                          </button>

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleToggleSkillsVerified(interested.userId._id)
                            }}
                            disabled={togglingUserId === interested.userId._id}
                            className={`text-lg p-1 transition-all ${interested.skillsVerified ? 'text-green-500' : 'text-gray-400 hover:text-green-400'} disabled:opacity-50`}
                            title={interested.skillsVerified ? 'Remove skills verification' : 'Verify skills'}>
                            {interested.skillsVerified ? '✓' : '○'}
                          </button>
                        </div>
                      </div>

                      <p className={`mt-3 text-sm leading-6 ${selectedUserId === interested.userId._id ? 'text-white/90' : 'theme-text-secondary'}`}>
                        {interested.proposalPreview || 'No proposal preview available yet. Open the project conversation to review the full message.'}
                      </p>

                      {interested.isShortlisted && (
                        <div className={`mt-2 inline-block px-2 py-1 rounded text-xs font-semibold ${selectedUserId === interested.userId._id ? 'bg-white/20' : 'bg-yellow-100'}`}>★ Shortlisted</div>
                      )}

                      {interested.skillsVerified && (
                        <div className={`mt-2 ml-2 inline-block px-2 py-1 rounded text-xs font-semibold ${selectedUserId === interested.userId._id ? 'bg-white/20' : 'bg-green-100'}`}>✓ Skills Verified</div>
                      )}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
        <div className='flex gap-3'>
          <motion.button onClick={onClose} className='flex-1 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-all' whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            Cancel
          </motion.button>
          <motion.button
            onClick={handleAssign}
            disabled={!selectedUserId || assigning}
            className='flex-1 py-2 bg-accent text-white rounded hover:bg-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}>
            {assigning ? 'Assigning...' : 'Assign'}
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}

export default AssignModal
