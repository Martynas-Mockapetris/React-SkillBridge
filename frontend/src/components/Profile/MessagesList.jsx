import { useState } from 'react' // Add useState for reply functionality
import { motion } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaClock, FaBriefcase, FaArrowRight, FaPaperPlane, FaChevronDown, FaChevronUp } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { sendMessage } from '../../services/messageService' // Import message service

const MessagesList = ({ messages, loading }) => {
  const navigate = useNavigate()

  // State for managing replies per project
  const [replyTexts, setReplyTexts] = useState({}) // { projectId: 'reply text' }
  const [sendingStates, setSendingStates] = useState({}) // { projectId: true/false }

  // State for managing expanded/collapsed conversations
  const [expandedConversations, setExpandedConversations] = useState({}) // { projectId: true/false }

  // Toggle conversation expansion
  const toggleConversation = (projectId) => {
    setExpandedConversations((prev) => ({
      ...prev,
      [projectId]: !prev[projectId]
    }))
  }

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return 'Yesterday'
    return date.toLocaleDateString()
  }

  // Group messages by project ID
  const groupMessagesByProject = () => {
    const grouped = {}

    messages.forEach((message) => {
      const projectId = message.project._id
      if (!grouped[projectId]) {
        grouped[projectId] = {
          project: message.project,
          messages: []
        }
      }
      grouped[projectId].messages.push(message)
    })

    return Object.values(grouped)
  }

  // Handle sending a reply
  const handleReply = async (projectId, receiverId) => {
    const replyText = replyTexts[projectId]

    // Don't send if empty
    if (!replyText || !replyText.trim()) return

    try {
      // Mark as sending
      setSendingStates({ ...sendingStates, [projectId]: true })

      // Send the message
      await sendMessage(projectId, receiverId, replyText)

      // Clear the input for this project
      setReplyTexts({ ...replyTexts, [projectId]: '' })

      // TODO: Refresh messages to show new reply
      window.location.reload() // Temporary solution
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      // Mark as not sending
      setSendingStates({ ...sendingStates, [projectId]: false })
    }
  }

  if (loading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
      </div>
    )
  }

  if (!messages || messages.length === 0) {
    return (
      <div className='text-center py-12'>
        <FaEnvelope className='text-6xl theme-text-secondary mx-auto mb-4 opacity-30' />
        <h3 className='text-xl font-semibold theme-text mb-2'>No messages yet</h3>
        <p className='theme-text-secondary'>Messages about projects will appear here.</p>
      </div>
    )
  }

  const groupedMessages = groupMessagesByProject()

  return (
    <div className='space-y-6'>
      {groupedMessages.map((group, groupIndex) => {
        const { project, messages: projectMessages } = group

        // Find the OTHER person in the conversation (not current user)
        const otherPersonMessage = projectMessages.find((msg) => (msg.sender._id || msg.sender) !== currentUser._id)

        // Determine receiver: if you're the owner, send to interested person; if interested person, send to owner
        const isProjectOwner = (project.user._id || project.user) === currentUser._id
        const receiverId = isProjectOwner
          ? otherPersonMessage?.sender._id || otherPersonMessage?.sender // Owner replies to interested person
          : project.user._id || project.user // Interested person replies to owner

        const currentReplyText = replyTexts[project._id] || ''
        const isSending = sendingStates[project._id] || false

        return (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
            className='theme-card p-6 rounded-lg hover:shadow-lg transition-all'>
            {/* Project Header */}
            {/* Project Header - Clickable Accordion */}
            <div className='mb-4 pb-4 border-b dark:border-light/10 border-primary/10 cursor-pointer' onClick={() => toggleConversation(project._id)}>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3 flex-1'>
                  {/* Expand/Collapse Icon */}
                  <motion.div animate={{ rotate: expandedConversations[project._id] ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <FaChevronDown className='theme-text-secondary' />
                  </motion.div>

                  {/* Project Info */}
                  <FaBriefcase className='text-accent' />
                  <div className='flex-1'>
                    <p className='font-semibold theme-text'>{project.title}</p>
                    {project.category && <p className='text-sm theme-text-secondary'>{project.category}</p>}
                  </div>

                  {/* Message Count Badge */}
                  <div className='px-3 py-1 bg-accent/10 rounded-full'>
                    <span className='text-sm font-semibold text-accent'>
                      {projectMessages.length} {projectMessages.length === 1 ? 'message' : 'messages'}
                    </span>
                  </div>
                </div>

                {/* View Project Button - Stop propagation to prevent accordion toggle */}
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation() // Prevent accordion toggle when clicking button
                    navigate(`/project/${project._id}`)
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg 
                  hover:bg-accent hover:text-white transition-all text-sm ml-3'>
                  View Project
                  <FaArrowRight />
                </motion.button>
              </div>

              {/* Last Message Preview (when collapsed) */}
              {!expandedConversations[project._id] && projectMessages.length > 0 && (
                <div className='mt-3 ml-8 text-sm theme-text-secondary line-clamp-1'>
                  {projectMessages[projectMessages.length - 1].sender._id === currentUser._id ? 'You: ' : ''}
                  {projectMessages[projectMessages.length - 1].content}
                </div>
              )}
            </div>

            {/* Conversation Thread - Only show when expanded */}
            {expandedConversations[project._id] && (
              <div className='space-y-3 mb-4'>
                {projectMessages.map((message, msgIndex) => {
                  // Check if this message is from the current user
                  const isOwnMessage = message.sender._id === currentUser._id || message.sender === currentUser._id

                  return (
                    <motion.div
                      key={message._id}
                      initial={{ opacity: 0, x: isOwnMessage ? 10 : -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: msgIndex * 0.05 }}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-4 rounded-lg ${isOwnMessage ? 'bg-accent/10 border border-accent/20' : 'theme-card border dark:border-light/10 border-primary/10'}`}>
                        {/* Sender name for received messages */}
                        {!isOwnMessage && (
                          <div className='flex items-center gap-2 mb-2'>
                            <img src={message.sender?.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={message.sender?.firstName} className='w-6 h-6 rounded-full object-cover' />
                            <p className='text-sm font-semibold theme-text'>
                              {message.sender?.firstName} {message.sender?.lastName}
                            </p>
                          </div>
                        )}

                        {/* Message content */}
                        <p className={`theme-text leading-relaxed mb-2 ${isOwnMessage ? 'text-right' : ''}`}>{message.content}</p>

                        {/* Timestamp */}
                        <div className={`flex items-center gap-1 text-xs theme-text-secondary ${isOwnMessage ? 'justify-end' : ''}`}>
                          <FaClock />
                          <span>{formatDate(message.createdAt)}</span>
                          {message.isRead && <FaEnvelopeOpen className='text-green-500 ml-1' title='Read' />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {/* Reply Input - Only show if there's another person in the conversation */}
            {expandedConversations[project._id] && otherPersonMessage && (
              <div className='flex gap-2 pt-4 border-t dark:border-light/10 border-primary/10'>
                <input
                  type='text'
                  value={currentReplyText}
                  onChange={(e) => setReplyTexts({ ...replyTexts, [project._id]: e.target.value })}
                  placeholder='Type your reply...'
                  className='flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 border-gray-300 theme-bg theme-text focus:outline-none focus:border-accent'
                  onKeyPress={(e) => {
                    // Send on Enter key
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleReply(project._id, receiverId)
                    }
                  }}
                />
                <motion.button
                  onClick={() => handleReply(project._id, receiverId)}
                  disabled={!currentReplyText.trim() || isSending}
                  className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}>
                  {isSending ? (
                    'Sending...'
                  ) : (
                    <>
                      <FaPaperPlane />
                      Reply
                    </>
                  )}
                </motion.button>
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default MessagesList
