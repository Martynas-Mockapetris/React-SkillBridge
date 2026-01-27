import { motion } from 'framer-motion'
import { FaEnvelope, FaEnvelopeOpen, FaClock, FaBriefcase, FaArrowRight } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

const MessagesList = ({ messages, loading }) => {
  const navigate = useNavigate()

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

  return (
    <div className='space-y-4'>
      {messages.map((message, index) => (
        <motion.div
          key={message._id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className='theme-card p-6 rounded-lg hover:shadow-lg transition-all'>
          {/* Project Info Banner */}
          {message.project && (
            <div className='mb-4 pb-4 border-b dark:border-light/10 border-primary/10'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                  <FaBriefcase className='text-accent' />
                  <div>
                    <p className='font-semibold theme-text'>{message.project.title}</p>
                    {message.project.category && <p className='text-sm theme-text-secondary'>{message.project.category}</p>}
                  </div>
                </div>
                <motion.button
                  onClick={() => navigate(`/project/${message.project._id}`)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center gap-2 px-3 py-2 bg-accent/10 text-accent rounded-lg 
                    hover:bg-accent hover:text-white transition-all text-sm'>
                  View Project
                  <FaArrowRight />
                </motion.button>
              </div>
            </div>
          )}

          {/* Message Header */}
          <div className='flex items-start justify-between mb-4'>
            {/* Sender Info */}
            <div className='flex items-center gap-3'>
              <img src={message.sender?.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={message.sender?.firstName} className='w-12 h-12 rounded-full object-cover border-2 border-accent/20' />
              <div>
                <p className='font-semibold theme-text'>
                  {message.sender?.firstName} {message.sender?.lastName}
                </p>
                <p className='text-sm theme-text-secondary'>{message.sender?.email}</p>
              </div>
            </div>

            {/* Timestamp and Read Status */}
            <div className='flex items-center gap-3 text-sm theme-text-secondary'>
              <div className='flex items-center gap-1'>
                <FaClock />
                <span>{formatDate(message.createdAt)}</span>
              </div>
              {message.isRead ? <FaEnvelopeOpen className='text-green-500' title='Read' /> : <FaEnvelope className='text-accent' title='Unread' />}
            </div>
          </div>

          {/* Message Content */}
          <div className='pl-[60px]'>
            <p className='theme-text leading-relaxed'>{message.content}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

export default MessagesList
