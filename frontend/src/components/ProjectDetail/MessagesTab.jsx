import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import GroupedMessagesList from '../Profile/GroupedMessageList'
import { getProjectById } from '../../services/projectService'
import { getProjectMessages } from '../../services/messageService'

const MessagesTab = ({ project, currentUser, messages, messagesLoading, negotiationTimeline, id }) => {
  // Only show if current user is project creator
  if (!project?.user?._id || currentUser?._id !== project.user._id) {
    return null
  }

  const handleRefresh = async () => {
    try {
      const updatedProject = await getProjectById(id)
      const updatedMessages = await getProjectMessages(id)
      // Note: Caller should handle state updates
      return { updatedProject, updatedMessages }
    } catch (error) {
      console.error('Error refreshing data:', error)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <GroupedMessagesList messages={messages} loading={messagesLoading} projectId={id} isProjectCreator={true} systemEvents={negotiationTimeline} onRefresh={handleRefresh} />
    </motion.div>
  )
}

MessagesTab.propTypes = {
  project: PropTypes.shape({
    user: PropTypes.shape({
      _id: PropTypes.string
    }),
    assignee: PropTypes.object
  }).isRequired,
  currentUser: PropTypes.shape({
    _id: PropTypes.string
  }).isRequired,
  messages: PropTypes.array.isRequired,
  messagesLoading: PropTypes.bool,
  negotiationTimeline: PropTypes.array,
  id: PropTypes.string.isRequired
}

export default MessagesTab
