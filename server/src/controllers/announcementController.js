import Announcement from '../models/Announcement.js'

// Create a new announcement
export const createAnnouncement = async (req, res) => {
  try {
    const { hourlyRate, skills, background, title } = req.body
    const userId = req.user._id

    // Validate required fields
    if (!hourlyRate || !skills || !background || !title) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (skills.length === 0) {
      return res.status(400).json({ message: 'At least one skill is required' })
    }

    // Create announcement with userId from authenticated request
    const announcement = new Announcement({
      userId,
      hourlyRate,
      skills,
      background,
      title,
      isActive: true
    })

    await announcement.save()

    // Populate userId to return full user data
    await announcement.populate('userId', 'firstName lastName profilePicture')

    res.status(201).json(announcement)
  } catch (error) {
    console.error('Error creating announcement:', error)
    res.status(500).json({ message: 'Failed to create announcement', error: error.message })
  }
}

// Get all announcements for a specific freelancer
export const getAnnouncementsByUser = async (req, res) => {
  try {
    const userId = req.user._id

    const announcements = await Announcement.find({ userId }).populate('userId', 'firstName lastName profilePicture').sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message })
  }
}

// Get all active announcements (for browsing)
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).populate('userId', 'firstName lastName profilePicture userType').sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message })
  }
}

// Update announcement
export const updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id
    const { hourlyRate, skills, background, title } = req.body

    // Find announcement and verify ownership
    const announcement = await Announcement.findById(id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only update your own announcements' })
    }

    // Update fields
    if (hourlyRate !== undefined) announcement.hourlyRate = hourlyRate
    if (skills) announcement.skills = skills
    if (background) announcement.background = background
    if (title) announcement.title = title

    await announcement.save()
    await announcement.populate('userId', 'firstName lastName profilePicture')

    res.json(announcement)
  } catch (error) {
    console.error('Error updating announcement:', error)
    res.status(500).json({ message: 'Failed to update announcement', error: error.message })
  }
}

// Delete announcement
export const deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const announcement = await Announcement.findById(id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only delete your own announcements' })
    }

    await Announcement.findByIdAndDelete(id)

    res.json({ message: 'Announcement deleted successfully' })
  } catch (error) {
    console.error('Error deleting announcement:', error)
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message })
  }
}

// Toggle announcement active status (for pause/unpause in Task 10)
export const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const announcement = await Announcement.findById(id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId.toString() !== userId) {
      return res.status(403).json({ message: 'You can only toggle your own announcements' })
    }

    announcement.isActive = !announcement.isActive
    await announcement.save()

    res.json({ message: `Announcement ${announcement.isActive ? 'paused' : 'resumed'}`, announcement })
  } catch (error) {
    console.error('Error toggling announcement status:', error)
    res.status(500).json({ message: 'Failed to toggle announcement status', error: error.message })
  }
}
