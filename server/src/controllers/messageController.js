import Message from '../models/Message.js'
import Project from '../models/Project.js'

// @desc    Send a message about a project
// @route   POST /api/messages
// @access  Private (must be logged in)
const sendMessage = async (req, res) => {
  try {
    const { projectId, receiverId, content } = req.body

    // Validate required fields
    if (!projectId || !receiverId || !content) {
      return res.status(400).json({ message: 'Project ID, receiver ID, and content are required' })
    }

    // Check if project exists
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Prevent sending message to yourself
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' })
    }

    // Create message
    const message = new Message({
      project: projectId,
      sender: req.user._id, // From auth middleware
      receiver: receiverId,
      content
    })

    const savedMessage = await message.save()

    // Populate sender and receiver info before sending response
    await savedMessage.populate('sender', 'firstName lastName email profilePicture')
    await savedMessage.populate('receiver', 'firstName lastName email profilePicture')
    await savedMessage.populate('project', 'title')

    res.status(201).json(savedMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get all messages for a specific project
// @route   GET /api/messages/project/:projectId
// @access  Private (must be logged in)
const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params

    // Find all messages related to this project
    const messages = await Message.find({ project: projectId }).populate('sender', 'firstName lastName email profilePicture').populate('receiver', 'firstName lastName email profilePicture').sort({ createdAt: 1 }) // Oldest first (chronological order)

    res.json(messages)
  } catch (error) {
    console.error('Error fetching project messages:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all messages for the logged-in user
// @route   GET /api/messages/my-messages
// @access  Private
const getUserMessages = async (req, res) => {
  try {
    // Find messages where user is sender or receiver
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'firstName lastName email profilePicture')
      .populate('receiver', 'firstName lastName email profilePicture')
      .populate('project', 'title category')
      .sort({ createdAt: -1 }) // Newest first

    res.json(messages)
  } catch (error) {
    console.error('Error fetching user messages:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    message.isRead = true
    await message.save()

    res.json(message)
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export { sendMessage, getProjectMessages, getUserMessages, markAsRead }
