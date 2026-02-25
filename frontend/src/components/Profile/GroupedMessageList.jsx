import { motion } from 'framer-motion'
import { FaEnvelope } from 'react-icons/fa'
import SenderBlock from './SenderBlock'
import LoadingSpinner from '../shared/LoadingSpinner'

const GroupedMessagesList = ({ messages, loading, projectId, isProjectCreator, onRefresh, systemEvents = [] }) => {
  // Get current user to exclude from interested count
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // Group ALL messages by sender (including owner's)
  const groupedMessages = messages.reduce((groups, message) => {
    const senderId = message.sender._id

    if (!groups[senderId]) {
      groups[senderId] = {
        sender: message.sender,
        messages: []
      }
    }

    groups[senderId].messages.push(message)
    return groups
  }, {})

  // Convert to array and sort by first message time
  const sortedGroups = Object.values(groupedMessages).sort((a, b) => {
    const timeA = new Date(a.messages[0].createdAt)
    const timeB = new Date(b.messages[0].createdAt)
    return timeB - timeA // Newest first
  })

  // Filter out owner for counting interested people
  const interestedCount = sortedGroups.filter((group) => {
    const senderId = group.sender._id || group.sender
    return senderId !== currentUser._id
  }).length

  if (loading) {
    return (
      <div className='flex justify-center py-8'>
        <LoadingSpinner />
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className='text-center py-12'>
        <FaEnvelope className='text-6xl theme-text-secondary mx-auto mb-4 opacity-30' />
        <h3 className='text-xl font-semibold theme-text mb-2'>No messages yet</h3>
        <p className='theme-text-secondary'>People interested in your project will appear here.</p>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className='space-y-8'>
      {/* Summary */}
      <div className='p-4 bg-accent/10 rounded-lg'>
        <p className='theme-text font-semibold'>
          {interestedCount} {interestedCount === 1 ? 'person' : 'people'} interested in this project
        </p>
      </div>

      {/* System events */}
      {systemEvents.length > 0 && (
        <div className='space-y-2'>
          {systemEvents.map((event, idx) => (
            <div key={`system-${idx}`} className='flex items-center gap-3 text-xs theme-text-secondary bg-accent/5 border border-accent/10 rounded-lg px-3 py-2'>
              <span className='font-semibold text-accent'>System</span>
              <span className='flex-1'>{event.text}</span>
              <span className='whitespace-nowrap'>{event.time ? new Date(event.time).toLocaleDateString() : ''}</span>
            </div>
          ))}
        </div>
      )}

      {/* Grouped messages */}
      {sortedGroups.map((group, index) => (
        <SenderBlock key={group.sender._id} sender={group.sender} messages={group.messages} index={index} projectId={projectId} isProjectCreator={isProjectCreator} onAssignSuccess={onRefresh} />
      ))}
    </motion.div>
  )
}

export default GroupedMessagesList
