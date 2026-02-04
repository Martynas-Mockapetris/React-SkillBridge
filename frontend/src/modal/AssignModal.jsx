import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'
import { assignUserToProject } from '../services/projectService'

const AssignModal = ({ isOpen, onClose, project, onAssignSuccess }) => {
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [assigning, setAssigning] = useState(false)

  if (!isOpen || !project) return null

  const interestedUsers = project.interestedUsers || []

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
        className='bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto'>
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

          {interestedUsers.length === 0 ? (
            <p className='text-sm theme-text-secondary text-center py-4'>No interested freelancers yet</p>
          ) : (
            <div className='space-y-2'>
              {interestedUsers.map((interested) => (
                <motion.button
                  key={interested.userId._id}
                  onClick={() => setSelectedUserId(interested.userId._id)}
                  className={`w-full p-3 rounded-lg text-left transition-all ${selectedUserId === interested.userId._id ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-800 theme-text hover:bg-accent/10'}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  <div className='flex items-center gap-3'>
                    <img src={interested.userId.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={interested.userId.firstName} className='w-10 h-10 rounded-full object-cover' />
                    <div>
                      <p className='font-semibold'>
                        {interested.userId.firstName} {interested.userId.lastName}
                      </p>
                      <p className='text-xs opacity-75'>{interested.userId.email}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
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
