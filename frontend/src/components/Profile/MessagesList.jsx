import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaClock, FaBriefcase, FaArrowRight, FaPaperPlane, FaChevronDown, FaChevronUp, FaPlus, FaTimes } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { sendMessage, markMessageAsRead, sendMessageWithAttachments } from '../../services/messageService'
import LoadingSpinner from '../shared/LoadingSpinner'

const MessagesList = ({ messages, loading, onReplySent }) => {
  const navigate = useNavigate()

  // State for managing replies per project
  const [replyTexts, setReplyTexts] = useState({}) // { projectId: 'reply text' }
  const [sendingStates, setSendingStates] = useState({}) // { projectId: true/false }

  // State for managing expanded/collapsed conversations
  const [expandedConversations, setExpandedConversations] = useState({}) // { projectId: true/false }

  // File upload state
  const fileInputRefs = useRef({}) // { projectId: ref }
  const [selectedFiles, setSelectedFiles] = useState({}) // { projectId: [files] }

  // Toggle conversation expansion and mark unread incoming messages as read when opening
  const toggleConversation = async (conversationKey, groupMessages) => {
    const isOpening = !expandedConversations[conversationKey]

    setExpandedConversations((prev) => ({
      ...prev,
      [conversationKey]: !prev[conversationKey]
    }))

    if (!isOpening) return

    const unreadIncomingMessages = getUnreadIncomingMessages(groupMessages)
    if (unreadIncomingMessages.length === 0) return

    try {
      await Promise.all(unreadIncomingMessages.map((message) => markMessageAsRead(message._id)))

      if (onReplySent) {
        await onReplySent()
      }
    } catch (error) {
      console.error('Failed to mark messages as read:', error)
    }
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

  // Group messages by project ID or conversation (for direct messages)
  const groupMessagesByProject = () => {
    const grouped = {}

    messages.forEach((message) => {
      // Project-based messages
      if (message.project) {
        const projectId = message.project._id
        if (!grouped[projectId]) {
          grouped[projectId] = {
            project: message.project,
            messages: [],
            isDirectMessage: false
          }
        }
        grouped[projectId].messages.push(message)
      } else {
        // Direct messages - group by the other user (not current user)
        const otherUserId = message.sender._id === currentUser._id ? message.receiver._id : message.sender._id
        const conversationKey = `direct-${otherUserId}`

        if (!grouped[conversationKey]) {
          const otherUser = message.sender._id === currentUser._id ? message.receiver : message.sender
          grouped[conversationKey] = {
            projectTitle: `Conversation with ${otherUser.firstName} ${otherUser.lastName}`,
            otherUser: otherUser,
            messages: [],
            isDirectMessage: true
          }
        }
        grouped[conversationKey].messages.push(message)
      }
    })

    return Object.values(grouped).sort((a, b) => {
      const aLastMessage = a.messages?.[a.messages.length - 1]
      const bLastMessage = b.messages?.[b.messages.length - 1]

      const aTime = aLastMessage?.createdAt ? new Date(aLastMessage.createdAt).getTime() : 0
      const bTime = bLastMessage?.createdAt ? new Date(bLastMessage.createdAt).getTime() : 0

      return bTime - aTime
    })
  }
  const getDisplayName = (user) => {
    if (!user) return 'Unknown'
    return user.userType === 'admin' ? 'Administrator' : `${user.firstName} ${user.lastName}`
  }

  const canReplyToUser = (user) => {
    return user?.userType !== 'admin'
  }

  const getLastMessagePreviewData = (groupMessages) => {
    if (!Array.isArray(groupMessages) || groupMessages.length === 0) {
      return null
    }

    const lastMessage = groupMessages[groupMessages.length - 1]
    const isOwnMessage = lastMessage.sender?._id === currentUser._id || lastMessage.sender === currentUser._id
    const senderName = isOwnMessage ? 'You' : lastMessage.sender?.firstName || 'Unknown'

    return {
      lastMessage,
      senderName,
      timestamp: formatDate(lastMessage.createdAt)
    }
  }

  const getUnreadIncomingMessages = (groupMessages) => {
    if (!Array.isArray(groupMessages)) return []

    return groupMessages.filter((message) => {
      const receiverId = message.receiver?._id || message.receiver
      return !message.isRead && receiverId === currentUser._id
    })
  }

  const handleReply = async (conversationKeyOrProjectId, receiverId, isDirectMessage = false) => {
    const replyText = replyTexts[conversationKeyOrProjectId]
    const files = selectedFiles[conversationKeyOrProjectId]

    // Don't send if empty
    if (!replyText || !replyText.trim()) return

    try {
      // Mark as sending
      setSendingStates({ ...sendingStates, [conversationKeyOrProjectId]: true })

      // Send the message
      if (files && files.length > 0) {
        // With file attachments
        if (isDirectMessage) {
          await sendMessageWithAttachments(receiverId, replyText, Array.from(files), null, null)
        } else {
          await sendMessageWithAttachments(receiverId, replyText, Array.from(files), null, conversationKeyOrProjectId)
        }
      } else {
        // Without file attachments
        if (isDirectMessage) {
          await sendMessage(receiverId, replyText, null, null)
        } else {
          await sendMessage(receiverId, replyText, null, conversationKeyOrProjectId)
        }
      }

      // Clear the input and files
      setReplyTexts({ ...replyTexts, [conversationKeyOrProjectId]: '' })
      setSelectedFiles({ ...selectedFiles, [conversationKeyOrProjectId]: undefined })

      if (onReplySent) {
        await onReplySent()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      // Mark as not sending
      setSendingStates({ ...sendingStates, [conversationKeyOrProjectId]: false })
    }
  }

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
        <p className='theme-text-secondary'>Messages about projects will appear here.</p>
      </div>
    )
  }

  const groupedMessages = groupMessagesByProject()

  return (
    <div className='space-y-6'>
      {groupedMessages.map((group, groupIndex) => {
        const { project, otherUser, messages: groupMessages, isDirectMessage, projectTitle } = group

        // HANDLE DIRECT MESSAGES
        if (isDirectMessage) {
          const conversationKey = `direct-${otherUser._id}`
          const currentReplyText = replyTexts[conversationKey] || ''
          const isSending = sendingStates[conversationKey] || false
          const title = otherUser.userType === 'admin' ? 'Message from Administrator' : `Conversation with ${otherUser.firstName} ${otherUser.lastName}`
          const canReplyDirect = canReplyToUser(otherUser)
          const lastMessagePreview = getLastMessagePreviewData(groupMessages)
          const unreadIncomingMessages = getUnreadIncomingMessages(groupMessages)

          return (
            <motion.div
              key={conversationKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
              className='theme-card p-6 rounded-lg hover:shadow-lg transition-all'>
              {/* Direct Message Header */}
              <div className='mb-4 pb-4 border-b dark:border-light/10 border-primary/10 cursor-pointer' onClick={() => toggleConversation(conversationKey, groupMessages)}>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-3 flex-1'>
                    <motion.div animate={{ rotate: expandedConversations[conversationKey] ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <FaChevronDown className='theme-text-secondary' />
                    </motion.div>
                    <FaEnvelope className='text-accent' />
                    <div className='flex-1'>
                      <p className='font-semibold theme-text'>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            if (otherUser.userType !== 'admin') {
                              navigate(`/freelancer/${otherUser._id}`)
                            }
                          }}
                          className='hover:text-accent transition-colors cursor-pointer underline'>
                          {title}
                        </button>
                      </p>
                      <p className='text-sm theme-text-secondary'>{otherUser.userType === 'admin' ? 'Administrator notice' : 'Direct message'}</p>
                    </div>
                    <div className='flex items-center gap-2'>
                      {unreadIncomingMessages.length > 0 ? <span className='px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold'>{unreadIncomingMessages.length} unread</span> : null}

                      <div className='px-3 py-1 bg-accent/10 rounded-full'>
                        <span className='text-sm font-semibold text-accent'>
                          {groupMessages.length} {groupMessages.length === 1 ? 'message' : 'messages'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {!expandedConversations[conversationKey] && lastMessagePreview && (
                <div className='ml-8'>
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='font-semibold theme-text'>{lastMessagePreview.senderName}:</span>
                    <span className='theme-text-secondary line-clamp-1 flex-1'>{lastMessagePreview.lastMessage.content}</span>
                    <span className='text-xs theme-text-secondary whitespace-nowrap'>{lastMessagePreview.timestamp}</span>
                  </div>
                </div>
              )}

              {/* Messages List */}
              <AnimatePresence>
                {expandedConversations[conversationKey] && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className='overflow-hidden'>
                    <div className='space-y-3 mb-4 pt-4'>
                      {groupMessages.map((message, msgIndex) => {
                        const isOwnMessage = message.sender._id === currentUser._id || message.sender === currentUser._id
                        return (
                          <motion.div
                            key={message._id}
                            initial={{ opacity: 0, x: isOwnMessage ? 10 : -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: msgIndex * 0.05 }}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] p-4 rounded-lg ${isOwnMessage ? 'bg-accent/10 border border-accent/20' : 'theme-card border dark:border-light/10 border-primary/10'}`}>
                              {!isOwnMessage && (
                                <div className='flex items-center gap-2 mb-2'>
                                  <img
                                    src={message.sender?.profilePicture || `https://i.pravatar.cc/150?u=${message.sender?._id}`}
                                    alt={message.sender?.firstName}
                                    className='w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80'
                                    onClick={() => {
                                      if (message.sender?.userType !== 'admin') {
                                        navigate(`/freelancer/${message.sender?._id}`)
                                      }
                                    }}
                                    title={message.sender?.userType === 'admin' ? 'Administrator' : 'View profile'}
                                  />
                                  {message.sender?.userType === 'admin' ? (
                                    <span className='text-sm font-semibold theme-text'>Administrator</span>
                                  ) : (
                                    <button onClick={() => navigate(`/freelancer/${message.sender?._id}`)} className='text-sm font-semibold theme-text hover:text-accent transition-colors underline'>
                                      {message.sender?.firstName} {message.sender?.lastName}
                                    </button>
                                  )}
                                </div>
                              )}
                              {message.subject && <p className='text-sm font-semibold text-accent mb-2'>{message.subject}</p>}
                              {/* Message content */}
                              <p className={`theme-text leading-relaxed mb-2 ${isOwnMessage ? 'text-right' : ''}`}>{message.content}</p>

                              {/* Attachments Display */}
                              {message.attachments && message.attachments.length > 0 && (
                                <div className='mt-3 pt-3 border-t border-gray-300 dark:border-gray-600'>
                                  <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2'>📎 Attachments ({message.attachments.length})</p>
                                  <div className='space-y-2'>
                                    {message.attachments.map((attachment, idx) => (
                                      <a
                                        key={idx}
                                        href={`/${attachment.path}`}
                                        download={attachment.originalName}
                                        className='flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm break-all'>
                                        <span className='text-xs'>📄</span>
                                        <span className='text-gray-700 dark:text-gray-300 flex-1 truncate'>{attachment.originalName}</span>
                                        <span className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>{attachment.size < 1024 ? attachment.size + 'B' : (attachment.size / 1024).toFixed(1) + 'KB'}</span>
                                      </a>
                                    ))}
                                  </div>
                                </div>
                              )}

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
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Reply Input or Admin Notice */}
              {expandedConversations[conversationKey] &&
                (canReplyDirect ? (
                  <div className='flex gap-2 pt-4 border-t dark:border-light/10 border-primary/10'>
                    <input
                      type='text'
                      value={currentReplyText}
                      onChange={(e) => setReplyTexts({ ...replyTexts, [conversationKey]: e.target.value })}
                      placeholder='Type your reply...'
                      className='flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 border-gray-300 theme-bg theme-text focus:outline-none focus:border-accent'
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          handleReply(conversationKey, otherUser._id, true)
                        }
                      }}
                    />
                    <motion.button
                      onClick={() => handleReply(conversationKey, otherUser._id, true)}
                      disabled={!currentReplyText.trim() || isSending}
                      className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      {isSending ? (
                        'Sending...'
                      ) : (
                        <>
                          <FaPaperPlane /> Reply
                        </>
                      )}
                    </motion.button>
                  </div>
                ) : (
                  <p className='text-sm theme-text-secondary pt-4 border-t dark:border-light/10 border-primary/10'>Replies are disabled for administrator notices.</p>
                ))}
            </motion.div>
          )
        }

        // HANDLE PROJECT-BASED MESSAGES (existing code)
        const otherPersonMessage = groupMessages.find((msg) => (msg.sender._id || msg.sender) !== currentUser._id)
        const isProjectOwner = (project.user._id || project.user) === currentUser._id
        const receiverId = isProjectOwner ? otherPersonMessage?.sender._id || otherPersonMessage?.sender : project.user._id || project.user

        const currentReplyText = replyTexts[project._id] || ''
        const isSending = sendingStates[project._id] || false
        const unreadIncomingMessages = getUnreadIncomingMessages(groupMessages)

        return (
          <motion.div
            key={project._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: groupIndex * 0.05 }}
            className='theme-card p-6 rounded-lg hover:shadow-lg transition-all'>
            {/* Project Header - Clickable Accordion */}
            <div className='mb-4 pb-4 border-b dark:border-light/10 border-primary/10 cursor-pointer' onClick={() => toggleConversation(project._id, groupMessages)}>
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
                  <div className='flex items-center gap-2'>
                    {unreadIncomingMessages.length > 0 ? <span className='px-2.5 py-1 rounded-full bg-red-500 text-white text-xs font-semibold'>{unreadIncomingMessages.length} unread</span> : null}

                    <div className='px-3 py-1 bg-accent/10 rounded-full'>
                      <span className='text-sm font-semibold text-accent'>
                        {groupMessages.length} {groupMessages.length === 1 ? 'message' : 'messages'}
                      </span>
                    </div>
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

              {/* Last Message Preview (when collapsed) - Show most recent message */}
              {!expandedConversations[project._id] &&
                groupMessages.length > 0 &&
                (() => {
                  // Get the most recent message (first in sorted array)
                  const lastMessage = groupMessages[groupMessages.length - 1] // Newest at end
                  const isOwnMessage = lastMessage.sender._id === currentUser._id || lastMessage.sender === currentUser._id

                  // Format sender name: "You" for own messages, first name for others
                  const senderName = isOwnMessage ? 'You' : lastMessage.sender?.firstName || 'Unknown'

                  return (
                    <div className='mt-3 ml-8'>
                      <div className='flex items-center gap-2 text-sm'>
                        {/* Sender name with styling */}
                        <span className='font-semibold theme-text'>{senderName}:</span>
                        {/* Message preview - truncated */}
                        <span className='theme-text-secondary line-clamp-1 flex-1'>{lastMessage.content}</span>
                        {/* Timestamp */}
                        <span className='text-xs theme-text-secondary whitespace-nowrap'>{formatDate(lastMessage.createdAt)}</span>
                      </div>
                    </div>
                  )
                })()}
            </div>

            {/* Expanded Project Messages */}
            {expandedConversations[project._id] && (
              <AnimatePresence>
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className='overflow-hidden'>
                  <div className='space-y-3 mb-4 pt-4'>
                    {groupMessages.map((message, msgIndex) => {
                      const isOwnMessage = message.sender._id === currentUser._id || message.sender === currentUser._id
                      return (
                        <motion.div
                          key={message._id}
                          initial={{ opacity: 0, x: isOwnMessage ? 10 : -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.2, delay: msgIndex * 0.05 }}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] p-4 rounded-lg ${isOwnMessage ? 'bg-accent/10 border border-accent/20' : 'theme-card border dark:border-light/10 border-primary/10'}`}>
                            {!isOwnMessage && (
                              <div className='flex items-center gap-2 mb-2'>
                                <img
                                  src={message.sender?.profilePicture || `https://i.pravatar.cc/150?u=${message.sender?._id}`}
                                  alt={message.sender?.firstName}
                                  className='w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-80'
                                  onClick={() => {
                                    if (message.sender?.userType !== 'admin') {
                                      navigate(`/freelancer/${message.sender?._id}`)
                                    }
                                  }}
                                  title={message.sender?.userType === 'admin' ? 'Administrator' : 'View profile'}
                                />
                                {message.sender?.userType === 'admin' ? (
                                  <span className='text-sm font-semibold theme-text'>Administrator</span>
                                ) : (
                                  <button onClick={() => navigate(`/freelancer/${message.sender?._id}`)} className='text-sm font-semibold theme-text hover:text-accent transition-colors underline'>
                                    {message.sender?.firstName} {message.sender?.lastName}
                                  </button>
                                )}
                              </div>
                            )}
                            {message.subject && <p className='text-sm font-semibold text-accent mb-2'>{message.subject}</p>}
                            <p className={`theme-text leading-relaxed mb-2 ${isOwnMessage ? 'text-right' : ''}`}>{message.content}</p>

                            {/* Attachments Display */}
                            {message.attachments && message.attachments.length > 0 && (
                              <div className='mt-3 pt-3 border-t border-gray-300 dark:border-gray-600'>
                                <p className='text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2'>📎 Attachments ({message.attachments.length})</p>
                                <div className='space-y-2'>
                                  {message.attachments.map((attachment, idx) => (
                                    <a
                                      key={idx}
                                      href={`/${attachment.path}`}
                                      download={attachment.originalName}
                                      className='flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm break-all'>
                                      <span className='text-xs'>📄</span>
                                      <span className='text-gray-700 dark:text-gray-300 flex-1 truncate'>{attachment.originalName}</span>
                                      <span className='text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap'>{attachment.size < 1024 ? attachment.size + 'B' : (attachment.size / 1024).toFixed(1) + 'KB'}</span>
                                    </a>
                                  ))}
                                </div>
                              </div>
                            )}

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
                </motion.div>
              </AnimatePresence>
            )}

            {/* Reply Input - Only show if there's another person in the conversation */}
            {expandedConversations[project._id] && otherPersonMessage && (
              <div className='pt-4 border-t dark:border-light/10 border-primary/10'>
                {/* File Display Preview */}
                {selectedFiles[project._id] && selectedFiles[project._id].length > 0 && (
                  <div className='mb-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-800'>
                    <p className='text-xs font-semibold text-blue-700 dark:text-blue-300 mb-2'>📎 Selected Files:</p>
                    <div className='space-y-1'>
                      {Array.from(selectedFiles[project._id]).map((file, idx) => (
                        <div key={idx} className='flex items-center justify-between text-xs text-blue-600 dark:text-blue-400'>
                          <span>{file.name}</span>
                          <button
                            type='button'
                            onClick={() => {
                              const newFiles = Array.from(selectedFiles[project._id]).filter((_, i) => i !== idx)
                              if (newFiles.length === 0) {
                                setSelectedFiles({ ...selectedFiles, [project._id]: undefined })
                              } else {
                                setSelectedFiles({ ...selectedFiles, [project._id]: newFiles })
                              }
                            }}
                            className='text-blue-500 hover:text-blue-700'>
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input Area */}
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={currentReplyText}
                    onChange={(e) => setReplyTexts({ ...replyTexts, [project._id]: e.target.value })}
                    placeholder='Type your reply...'
                    className='flex-1 px-4 py-2 rounded-lg border dark:border-gray-700 border-gray-300 theme-bg theme-text focus:outline-none focus:border-accent'
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleReply(project._id, receiverId)
                      }
                    }}
                  />

                  {/* File Upload Button */}
                  <input
                    ref={(el) => {
                      if (el) fileInputRefs.current[project._id] = el
                    }}
                    type='file'
                    multiple
                    accept='*/*'
                    onChange={(e) => setSelectedFiles({ ...selectedFiles, [project._id]: e.target.files })}
                    className='hidden'
                  />
                  <motion.button
                    type='button'
                    onClick={() => fileInputRefs.current[project._id]?.click()}
                    className='px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title='Attach files'>
                    <FaPlus />
                  </motion.button>

                  {/* Send Button */}
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
              </div>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

export default MessagesList
