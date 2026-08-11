import Announcement from '../models/Announcement.js'

const announcementListingUserFields = [
  'firstName',
  'lastName',
  'profilePicture',
  'userType',
  'headline',
  'availabilityStatus',
  'experienceLevel',
  'yearsOfExperience',
  'skills',
  'serviceCategories',
  'location',
  'timezone',
  'hourlyRate',
  'showHourlyRate',
  'showLocationPublic',
  'profileVisibility',
  'isEmailVerified'
].join(' ')

// @desc    Create a new service announcement
// @route   POST /api/announcements
// @access  Private
export const createAnnouncement = async (req, res) => {
  try {
    const { hourlyRate, skills, background, title } = req.body
    const userId = req.user._id

    if (!req.user.isEmailVerified) {
      return res.status(403).json({
        message: 'Verify your email before publishing announcements.'
      })
    }

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

// @desc    Get all announcements for the logged-in freelancer
// @route   GET /api/announcements
// @access  Private
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

// @desc    Get all active announcements for browsing
// @route   GET /api/announcements/all
// @access  Public
export const getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true }).populate('userId', announcementListingUserFields).sort({ createdAt: -1 })

    res.json(announcements)
  } catch (error) {
    console.error('Error fetching announcements:', error)
    res.status(500).json({ message: 'Failed to fetch announcements', error: error.message })
  }
}

// @desc    Update an existing announcement
// @route   PUT /api/announcements/:id
// @access  Private
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

// @desc    Delete an announcement
// @route   DELETE /api/announcements/:id
// @access  Private
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

// @desc    Toggle announcement active status (pause/resume)
// @route   PATCH /api/announcements/:id/toggle
// @access  Private
export const toggleAnnouncementStatus = async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user._id

    const announcement = await Announcement.findById(id)

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    if (announcement.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'You can only toggle your own announcements' })
    }

    const nextIsActive = !announcement.isActive

    if (nextIsActive && !req.user.isEmailVerified) {
      return res.status(403).json({
        message: 'Verify your email before publishing announcements.'
      })
    }

    announcement.isActive = nextIsActive
    await announcement.save()

    res.json({ message: `Announcement ${announcement.isActive ? 'resumed' : 'paused'}`, announcement })
  } catch (error) {
    console.error('Error toggling announcement status:', error)
    res.status(500).json({ message: 'Failed to toggle announcement status', error: error.message })
  }
}

// @desc    Toggle announcement status as admin (pause/resume)
// @route   PATCH /api/announcements/admin/:id/toggle
// @access  Admin
export const toggleAnnouncementStatusAsAdmin = async (req, res) => {
  try {
    const { id } = req.params

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    announcement.isActive = !announcement.isActive
    await announcement.save()

    res.json({
      message: `Announcement ${announcement.isActive ? 'resumed' : 'paused'} by admin`,
      announcement
    })
  } catch (error) {
    console.error('Error toggling announcement status as admin:', error)
    res.status(500).json({ message: 'Failed to toggle announcement status', error: error.message })
  }
}

// @desc    Delete announcement as admin
// @route   DELETE /api/announcements/admin/:id
// @access  Admin
export const deleteAnnouncementAsAdmin = async (req, res) => {
  try {
    const { id } = req.params

    const announcement = await Announcement.findById(id)
    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' })
    }

    await Announcement.findByIdAndDelete(id)

    res.json({ message: 'Announcement deleted by admin' })
  } catch (error) {
    console.error('Error deleting announcement as admin:', error)
    res.status(500).json({ message: 'Failed to delete announcement', error: error.message })
  }
}
