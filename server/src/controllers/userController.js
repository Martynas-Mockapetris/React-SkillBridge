import User from '../models/User.js'
import Project from '../models/Project.js'
import Announcement from '../models/Announcement.js'

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  console.log('PUT /profile route reached')
  console.log('Request body:', req.body)
  console.log('User from token:', req.user)

  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Update only the fields that are provided in the request
    const fieldsToUpdate = [
      'firstName',
      'lastName',
      'phone',
      'location',
      'skills',
      'bio',
      'website',
      'github',
      'linkedin',
      'twitter',
      'hourlyRate',
      'experienceLevel',
      'languages',
      'certifications',
      'serviceCategories',
      'upworkProfile',
      'fiverrProfile',
      'profilePicture'
    ]

    // Apply updates to user object
    fieldsToUpdate.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field]
      }
    })

    // Save with validation error handling
    try {
      const updatedUser = await user.save()

      // Convert to plain object and remove password
      const userResponse = updatedUser.toObject()
      delete userResponse.password

      res.json(userResponse)
    } catch (validationError) {
      console.error('Validation error:', validationError)
      return res.status(400).json({
        message: 'Validation error',
        errors: validationError.errors
      })
    }
  } catch (error) {
    console.error('Error updating user profile:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Delete user account
// @route   DELETE /api/users/profile
// @access  Private
export const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.deleteOne()

    res.json({ message: 'User account deleted successfully' })
  } catch (error) {
    console.error('Error deleting user account:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get user statistics with 30-day trends
// @route   GET /api/users/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Calculate date ranges for trend comparison
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // ====================
    // TOTAL PROJECTS (created + assigned)
    // ====================

    // Current total: all projects where user is creator OR assignee
    const totalProjects = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }]
    })

    // Last 30 days: projects created OR assigned in last 30 days
    const totalProjectsLast30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      createdAt: { $gte: thirtyDaysAgo }
    })

    // Previous 30 days: projects created OR assigned between 60-30 days ago
    const totalProjectsPrev30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })

    // Trend: difference between last 30 and previous 30
    const totalProjectsTrend = totalProjectsLast30 - totalProjectsPrev30

    // ====================
    // COMPLETED PROJECTS (status='completed', created + assigned)
    // ====================

    const completed = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'completed'
    })

    const completedLast30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'completed',
      updatedAt: { $gte: thirtyDaysAgo } // Use updatedAt for status changes
    })

    const completedPrev30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'completed',
      updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })

    const completedTrend = completedLast30 - completedPrev30

    // ====================
    // IN PROGRESS PROJECTS (status='in_progress', created + assigned)
    // ====================

    const inProgress = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'in_progress'
    })

    const inProgressLast30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'in_progress',
      updatedAt: { $gte: thirtyDaysAgo }
    })

    const inProgressPrev30 = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'in_progress',
      updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })

    const inProgressTrend = inProgressLast30 - inProgressPrev30

    // ====================
    // SUCCESS RATE (completed / total * 100)
    // ====================

    const successRate = totalProjects > 0 ? Math.round((completed / totalProjects) * 100) : 0

    // Calculate previous 30-day success rate for trend (pure 30 vs 30)
    const totalProjectsPrev30ForRate = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } // Previous 30 days window
    })

    const completedPrev30ForRate = await Project.countDocuments({
      $or: [{ user: userId }, { assignee: userId }],
      status: 'completed',
      updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } // Completed in previous 30 days
    })

    const previousSuccessRate = totalProjectsPrev30ForRate > 0 ? Math.round((completedPrev30ForRate / totalProjectsPrev30ForRate) * 100) : 0

    // Trend: percentage point change
    const successRateTrend = successRate - previousSuccessRate

    // ====================
    // TOTAL EARNINGS (ONLY assigned + completed projects, sum budgets)
    // ====================

    // Get all completed projects where user is ASSIGNEE (freelancer earning money)
    const completedAssignedProjects = await Project.find({
      assignee: userId,
      status: 'completed'
    }).select('budget updatedAt')

    // Sum total earnings
    const totalEarnings = completedAssignedProjects.reduce((sum, project) => sum + project.budget, 0)

    // Last 30 days earnings
    const earningsLast30 = completedAssignedProjects.filter((p) => new Date(p.updatedAt) >= thirtyDaysAgo).reduce((sum, project) => sum + project.budget, 0)

    // Previous 30 days earnings
    const earningsPrev30 = completedAssignedProjects
      .filter((p) => {
        const date = new Date(p.updatedAt)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      })
      .reduce((sum, project) => sum + project.budget, 0)

    // Trend: euro change
    const totalEarningsTrend = earningsLast30 - earningsPrev30

    // ====================
    // RETURN ALL STATS
    // ====================

    res.json({
      totalProjects,
      totalProjectsTrend,
      completed,
      completedTrend,
      inProgress,
      inProgressTrend,
      successRate,
      successRateTrend,
      totalEarnings,
      totalEarningsTrend
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get admin dashboard stats (global)
// @route   GET /api/users/admin/stats
// @access  Admin
export const getAdminDashboardStats = async (req, res) => {
  const percentChange = (current, previous) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  try {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000)

    // ====================
    // TOTAL USERS
    // ====================
    const totalUsers = await User.countDocuments()
    const totalUsersLast30 = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const totalUsersPrev30 = await User.countDocuments({ createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo } })
    const usersTrend = percentChange(totalUsersLast30, totalUsersPrev30)

    // ====================
    // ACTIVE PROJECTS
    // ====================
    const activeStatuses = ['active', 'assigned', 'negotiating', 'in_progress', 'under_review']
    const activeProjects = await Project.countDocuments({ status: { $in: activeStatuses } })
    const activeProjectsLast30 = await Project.countDocuments({
      status: { $in: activeStatuses },
      updatedAt: { $gte: thirtyDaysAgo }
    })
    const activeProjectsPrev30 = await Project.countDocuments({
      status: { $in: activeStatuses },
      updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })
    const activeProjectsTrend = percentChange(activeProjectsLast30, activeProjectsPrev30)

    // ====================
    // COMPLETED PROJECTS
    // ====================
    const completedProjects = await Project.countDocuments({ status: 'completed' })
    const completedLast30 = await Project.countDocuments({
      status: 'completed',
      updatedAt: { $gte: thirtyDaysAgo }
    })
    const completedPrev30 = await Project.countDocuments({
      status: 'completed',
      updatedAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })
    const completedTrend = percentChange(completedLast30, completedPrev30)

    // ====================
    // REVENUE
    // ====================
    const completedProjectsRevenue = await Project.find({
      status: 'completed',
      budget: { $gt: 0 }
    }).select('budget updatedAt')

    const revenue = completedProjectsRevenue.reduce((sum, project) => sum + (project.budget || 0), 0)

    const revenueLast30 = completedProjectsRevenue.filter((p) => new Date(p.updatedAt) >= thirtyDaysAgo).reduce((sum, project) => sum + (project.budget || 0), 0)

    const revenuePrev30 = completedProjectsRevenue
      .filter((p) => {
        const date = new Date(p.updatedAt)
        return date >= sixtyDaysAgo && date < thirtyDaysAgo
      })
      .reduce((sum, project) => sum + (project.budget || 0), 0)

    const revenueTrend = percentChange(revenueLast30, revenuePrev30)
    res.json({
      totalUsers,
      activeProjects,
      completedProjects,
      revenue,
      comparisons: {
        users: usersTrend,
        activeProjects: activeProjectsTrend,
        completedProjects: completedTrend,
        revenue: revenueTrend
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get all users (admin)
// @route   GET /api/users/admin/users
// @access  Admin
export const getAdminUsers = async (req, res) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 10, sort = 'createdAt:desc' } = req.query

    const query = {}

    // Search by name or email
    if (search) {
      query.$or = [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }

    // Filter by userType
    if (role) {
      query.userType = role
    }

    // Filter by status (Active / Inactive / Locked)
    if (status) {
      const normalizedStatus = status.toLowerCase()
      const inactiveThreshold = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)

      if (normalizedStatus === 'locked') {
        query.isLocked = true
      }

      if (normalizedStatus === 'active') {
        query.isLocked = false
        query.$and = [...(query.$and || []), { $or: [{ lastLogin: { $gte: inactiveThreshold } }, { lastLogin: null, createdAt: { $gte: inactiveThreshold } }] }]
      }

      if (normalizedStatus === 'inactive') {
        query.isLocked = false
        query.$and = [...(query.$and || []), { $or: [{ lastLogin: null, createdAt: { $lt: inactiveThreshold } }, { lastLogin: { $lt: inactiveThreshold } }] }]
      }
    }

    // Sorting
    const [sortField, sortOrder] = sort.split(':')
    const sortConfig = { [sortField]: sortOrder === 'asc' ? 1 : -1 }

    const skip = (Number(page) - 1) * Number(limit)

    const [users, total] = await Promise.all([User.find(query).select('-password').sort(sortConfig).skip(skip).limit(Number(limit)), User.countDocuments(query)])

    res.json({
      users,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Toggle user lock status (admin)
// @route   PATCH /api/users/admin/:userId/lock
// @access  Admin
export const toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Don't allow locking/unlocking admins
    if (user.userType === 'admin') {
      return res.status(403).json({ message: 'Cannot lock/unlock admin users' })
    }

    user.isLocked = !user.isLocked
    await user.save()

    res.json({
      message: `User ${user.isLocked ? 'locked' : 'unlocked'} successfully`,
      isLocked: user.isLocked
    })
  } catch (error) {
    console.error('Error toggling user lock:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Update user fields (admin)
// @route   PUT /api/users/admin/:userId
// @access  Admin
export const updateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params
    const allowedFields = ['firstName', 'lastName', 'email', 'userType', 'phone', 'location', 'skills', 'bio', 'hourlyRate', 'experienceLevel']

    const updates = {}
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field]
      }
    })

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.userType === 'admin' && updates.userType && updates.userType !== 'admin') {
      return res.status(403).json({ message: 'Cannot downgrade admin accounts' })
    }

    Object.assign(user, updates)
    const updatedUser = await user.save()

    res.json({ message: 'User updated successfully', user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Delete user (admin)
// @route   DELETE /api/users/admin/:userId
// @access  Admin
export const deleteAdminUser = async (req, res) => {
  try {
    const { userId } = req.params
    const user = await User.findById(userId)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    // Don't allow deleting admins
    if (user.userType === 'admin') {
      return res.status(403).json({ message: 'Cannot delete admin users' })
    }

    // Delete user's projects too
    await Project.deleteMany({
      $or: [{ user: userId }, { assignee: userId }]
    })

    await user.deleteOne()

    res.json({ message: 'User deleted successfully' })
  } catch (error) {
    console.error('Error deleting user:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Add project to favorites
// @route   POST /api/users/favorites/:projectId
// @access  Private
export const addToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const projectId = req.params.projectId

    // Check if already favorited
    if (user.favorites.includes(projectId)) {
      return res.status(400).json({ message: 'Project already in favorites' })
    }

    user.favorites.push(projectId)
    await user.save()

    res.json({ message: 'Added to favorites', favorites: user.favorites })
  } catch (error) {
    console.error('Error adding to favorites:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Remove project from favorites
// @route   DELETE /api/users/favorites/:projectId
// @access  Private
export const removeFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const projectId = req.params.projectId

    user.favorites = user.favorites.filter((id) => id.toString() !== projectId)
    await user.save()

    res.json({ message: 'Removed from favorites', favorites: user.favorites })
  } catch (error) {
    console.error('Error removing from favorites:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get user's favorite projects
// @route   GET /api/users/favorites
// @access  Private
export const getFavoriteProjects = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'favorites',
      populate: {
        path: 'user',
        select: 'firstName lastName email profilePicture'
      }
    })

    res.json(user.favorites || [])
  } catch (error) {
    console.error('Error fetching favorites:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all freelancers (freelancer + both) with their active announcements
// @route   GET /api/users/freelancers
// @access  Public
export const getFreelancers = async (req, res) => {
  try {
    // Get all freelancers
    const freelancers = await User.find({
      userType: { $in: ['freelancer', 'both'] }
    }).select('firstName lastName profilePicture skills bio userType createdAt hourlyRate _id')

    // Fetch announcements for each freelancer
    const freelancersWithAnnouncements = []

    for (const freelancer of freelancers) {
      const announcements = await Announcement.find({
        userId: freelancer._id,
        isActive: true
      }).select('title background hourlyRate skills isActive')

      freelancersWithAnnouncements.push({
        _id: freelancer._id,
        firstName: freelancer.firstName,
        lastName: freelancer.lastName,
        profilePicture: freelancer.profilePicture,
        skills: freelancer.skills,
        bio: freelancer.bio,
        userType: freelancer.userType,
        createdAt: freelancer.createdAt,
        hourlyRate: freelancer.hourlyRate,
        announcements: announcements
      })
    }

    res.json(freelancersWithAnnouncements)
  } catch (error) {
    console.error('Error fetching freelancers:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get user by ID (for freelancer detail view)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Add freelancer to favorites
// @route   POST /api/users/favorites/freelancer/:freelancerId
// @access  Private
export const addFreelancerToFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const freelancerId = req.params.freelancerId

    // Check if already favorited
    if (user.favoriteFreelancers.includes(freelancerId)) {
      return res.status(400).json({ message: 'Freelancer already in favorites' })
    }

    user.favoriteFreelancers.push(freelancerId)
    await user.save()

    res.json({ message: 'Added to favorites', favoriteFreelancers: user.favoriteFreelancers })
  } catch (error) {
    console.error('Error adding freelancer to favorites:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Remove freelancer from favorites
// @route   DELETE /api/users/favorites/freelancer/:freelancerId
// @access  Private
export const removeFreelancerFromFavorites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const freelancerId = req.params.freelancerId

    user.favoriteFreelancers = user.favoriteFreelancers.filter((id) => id.toString() !== freelancerId)
    await user.save()

    res.json({ message: 'Removed from favorites', favoriteFreelancers: user.favoriteFreelancers })
  } catch (error) {
    console.error('Error removing freelancer from favorites:', error)
    res.status(500).json({ message: 'Server error' })
  }
}
