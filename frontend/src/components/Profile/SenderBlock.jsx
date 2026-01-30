import { useState } from 'react'
import { motion } from 'framer-motion'
import { FaClock } from 'react-icons/fa'
import { assignUserToProject } from '../../services/projectService'
import { sendMessage } from '../../services/messageService'

const SenderBlock = ({ sender, messages, index, projectId, isProjectCreator, onAssignSuccess }) => {
  const [assigning, setAssigning] = useState(false)
  const [replyText, setReplyText] = useState('') // Store reply message
  const [sending, setSending] = useState(false) // Track sending state

  // Get current user to check if this is sender's own messages
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isOwnMessages = sender?._id === currentUser._id

  // Format time nicely
  const formatTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  const handleAssign = async () => {
    try {
      setAssigning(true)
      await assignUserToProject(projectId, sender._id)
      onAssignSuccess?.() // Refresh parent
    } catch (error) {
      console.error('Failed to assign user:', error)
    } finally {
      setAssigning(false)
    }
  }

  const handleReply = async () => {
    // Don't send if empty
    if (!replyText.trim()) return

    try {
      setSending(true)

      // Send the reply (we'll create this service function next)
      await sendMessage(projectId, sender._id, replyText)

      // Clear input and refresh
      setReplyText('')
      onAssignSuccess?.() // Refresh messages
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: index * 0.1 }} className='mb-6'>
      {/* Sender Header */}
      <div className='flex items-center gap-3 mb-4 pb-3 border-b dark:border-light/10 border-primary/10'>
        <img src={sender?.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={sender?.firstName} className='w-12 h-12 rounded-full object-cover border-2 border-accent/20' />
        <div>
          <h3 className='font-semibold theme-text'>
            {sender?.firstName} {sender?.lastName}
          </h3>
          <p className='text-sm theme-text-secondary'>{sender?.email}</p>
        </div>
        {isProjectCreator && !isOwnMessages && (
          <motion.button
            onClick={handleAssign}
            disabled={assigning}
            className='px-3 py-1 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded text-sm transition-all'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}>
            {assigning ? 'Assigning...' : 'Assign'}
          </motion.button>
        )}
      </div>

      {/* Messages from this sender */}
      <div className='space-y-3 pl-16'>
        {messages.map((message, msgIndex) => (
          <motion.div key={message._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2, delay: msgIndex * 0.05 }} className='theme-card p-4 rounded-lg'>
            {/* Message content */}
            <p className='theme-text leading-relaxed mb-2'>{message.content}</p>

            {/* Timestamp */}
            <div className='flex items-center gap-1 text-xs theme-text-secondary'>
              <FaClock />
              <span>{formatTime(message.createdAt)}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Reply Input (only for project creator) */}
      {isProjectCreator && !isOwnMessages && (
        <div className='mt-4 pl-16'>
          <div className='flex gap-2'>
            <input
              type='text'
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder='Type your reply...'
              className='flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 border-gray-300 theme-bg theme-text focus:outline-none focus:border-accent'
              onKeyPress={(e) => {
                // Send on Enter key
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleReply()
                }
              }}
            />
            <motion.button
              onClick={handleReply}
              disabled={!replyText.trim() || sending}
              className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              {sending ? 'Sending...' : 'Reply'}
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default SenderBlock
