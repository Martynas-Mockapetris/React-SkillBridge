import { motion } from 'framer-motion'
import { FaClock } from 'react-icons/fa'

const SenderBlock = ({ sender, messages, index }) => {
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
    </motion.div>
  )
}

export default SenderBlock
