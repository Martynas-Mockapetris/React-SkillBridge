import User from '../models/User.js'
import Project from '../models/Project.js'

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
