import Message from '../models/Message.js'
import Project from '../models/Project.js'
import User from '../models/User.js'

// @desc    Send a message (project-based or direct to freelancer)
// @route   POST /api/messages
// @access  Private (must be logged in)
export const sendMessage = async (req, res) => {
  try {
    const { projectId, receiverId, content, subject } = req.body

    // Validate required fields
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' })
    }

    // Check if receiver exists
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      return res.status(404).json({ message: 'Receiver not found' })
    }

    // Prevent sending message to yourself
    if (req.user._id.toString() === receiverId) {
      return res.status(400).json({ message: 'Cannot send message to yourself' })
    }

    // If project is provided, validate it exists
    if (projectId) {
      const project = await Project.findById(projectId)
      if (!project) {
        return res.status(404).json({ message: 'Project not found' })
      }
    }

    // Create message object
    const messageData = {
      sender: req.user._id,
      receiver: receiverId,
      content
    }

    // Add optional fields
    if (projectId) messageData.project = projectId
    if (subject) messageData.subject = subject

    // Create and save message
    const message = new Message(messageData)
    const savedMessage = await message.save()

    // If project-based, add sender to interestedUsers
    if (projectId) {
      const project = await Project.findById(projectId)
      const isProjectOwner = project.user.toString() === req.user._id.toString()
      const alreadyInterested = project.interestedUsers.some((user) => user.userId.toString() === req.user._id.toString())

      if (!isProjectOwner && !alreadyInterested) {
        project.interestedUsers.push({
          userId: req.user._id,
          status: 'pending',
          contactedAt: new Date()
        })
        await project.save()
      }
    }

    // Populate sender and receiver info before sending response
    await savedMessage.populate('sender', 'firstName lastName email profilePicture')
    await savedMessage.populate('receiver', 'firstName lastName email profilePicture')
    if (projectId) {
      await savedMessage.populate('project', 'title')
    }

    res.status(201).json(savedMessage)
  } catch (error) {
    console.error('Error sending message:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get all messages for a specific project
// @route   GET /api/messages/project/:projectId
// @access  Private (must be logged in)
export const getProjectMessages = async (req, res) => {
  try {
    const { projectId } = req.params

    const messages = await Message.find({ project: projectId }).populate('sender', 'firstName lastName email profilePicture').populate('receiver', 'firstName lastName email profilePicture').sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error('Error fetching project messages:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all messages for the logged-in user
// @route   GET /api/messages/my-messages
// @access  Private
export const getUserMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }]
    })
      .populate('sender', 'firstName lastName email profilePicture')
      .populate('receiver', 'firstName lastName email profilePicture')
      .populate('project', 'title category user')
      .sort({ createdAt: -1 })

    res.json(messages)
  } catch (error) {
    console.error('Error fetching user messages:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get messages with a specific user (conversation thread)
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getConversation = async (req, res) => {
  try {
    const { userId } = req.params

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: userId },
        { sender: userId, receiver: req.user._id }
      ]
    })
      .populate('sender', 'firstName lastName email profilePicture')
      .populate('receiver', 'firstName lastName email profilePicture')
      .sort({ createdAt: 1 })

    res.json(messages)
  } catch (error) {
    console.error('Error fetching conversation:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)

    if (!message) {
      return res.status(404).json({ message: 'Message not found' })
    }

    // Only receiver can mark as read
    if (message.receiver.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    message.isRead = true
    await message.save()

    res.json(message)
  } catch (error) {
    console.error('Error marking message as read:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
