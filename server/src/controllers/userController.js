import User from '../models/User.js'
import Project from '../models/Project.js'
import Announcement from '../models/Announcement.js'
import AdminActionLog from '../models/AdminActionLog.js'
import { buildFieldChanges, logAdminAction } from '../utils/adminActionLogger.js'
import { sendPasswordResetEmail } from '../utils/accountRecoveryService.js'
import { sendVerificationEmail } from '../utils/emailVerificationService.js'

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.ensureUnlockedIfExpired()

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
      'headline',
      'availabilityStatus',
      'profileVisibility',
      'responseTime',
      'servicesOffered',
      'tools',
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

// @desc    Change current user's password
// @route   PUT /api/users/profile/password
// @access  Private
export const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required.' })
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({ message: 'New password must be at least 8 characters long.' })
    }

    if (String(currentPassword) === String(newPassword)) {
      return res.status(400).json({ message: 'New password must be different from your current password.' })
    }

    const user = await User.findById(req.user._id).select('+password')

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const passwordMatches = await user.comparePassword(currentPassword)

    if (!passwordMatches) {
      return res.status(400).json({ message: 'Current password is incorrect.' })
    }

    user.password = newPassword
    user.forcePasswordReset = false
    user.forcePasswordResetSetAt = null
    user.passwordResetTokenHash = null
    user.passwordResetTokenExpiresAt = null
    user.passwordResetRequestedAt = null

    await user.save()

    res.json({ message: 'Password updated successfully.' })
  } catch (error) {
    console.error('Error changing user password:', error)
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

    const totalNonAdminUsers = await User.countDocuments({ userType: { $ne: 'admin' } })
    const activeUsersLast30 = await User.countDocuments({
      userType: { $ne: 'admin' },
      isLocked: false,
      lastLogin: { $gte: thirtyDaysAgo }
    })
    const activeUserRate = totalNonAdminUsers === 0 ? 0 : Math.round((activeUsersLast30 / totalNonAdminUsers) * 100)

    const newProjectsLast30 = await Project.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
    const newProjectsPrev30 = await Project.countDocuments({
      createdAt: { $gte: sixtyDaysAgo, $lt: thirtyDaysAgo }
    })
    const newProjectsTrend = percentChange(newProjectsLast30, newProjectsPrev30)

    const avgCompletedProjectValue = completedProjects === 0 ? 0 : Math.round(revenue / completedProjects)
    const completionRate = activeProjects + completedProjects === 0 ? 0 : Math.round((completedProjects / (activeProjects + completedProjects)) * 100)

    // ====================
    // ALERT SIGNALS
    // ====================
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const lockedUsers = await User.countDocuments({ isLocked: true })

    const inactiveUsers = await User.countDocuments({
      isLocked: false,
      userType: { $ne: 'admin' },
      lastLogin: { $ne: null, $lt: twoWeeksAgo }
    })

    const unverifiedUsers = await User.countDocuments({
      userType: { $ne: 'admin' },
      isEmailVerified: false
    })

    const passwordResetRequiredUsers = await User.countDocuments({
      forcePasswordReset: true
    })

    const stalledProjects = await Project.countDocuments({
      status: { $in: activeStatuses },
      updatedAt: { $lt: twoWeeksAgo }
    })

    const alerts = []

    if (lockedUsers >= 5) {
      alerts.push({
        id: 'locked-users',
        severity: lockedUsers >= 15 ? 'critical' : 'warning',
        title: 'High number of locked users',
        message: `${lockedUsers} users are currently locked.`,
        metric: lockedUsers
      })
    }

    if (inactiveUsers >= 20) {
      alerts.push({
        id: 'inactive-users',
        severity: inactiveUsers >= 50 ? 'critical' : 'warning',
        title: 'User inactivity spike',
        message: `${inactiveUsers} users inactive for 14+ days.`,
        metric: inactiveUsers
      })
    }

    if (stalledProjects >= 5) {
      alerts.push({
        id: 'stalled-projects',
        severity: stalledProjects >= 15 ? 'critical' : 'warning',
        title: 'Stalled active projects',
        message: `${stalledProjects} active projects not updated in 14+ days.`,
        metric: stalledProjects
      })
    }

    if (unverifiedUsers >= 10) {
      alerts.push({
        id: 'unverified-users',
        severity: unverifiedUsers >= 25 ? 'critical' : 'warning',
        title: 'High number of unverified users',
        message: `${unverifiedUsers} non-admin users still have not verified their email.`,
        metric: unverifiedUsers
      })
    }

    if (passwordResetRequiredUsers >= 5) {
      alerts.push({
        id: 'password-reset-required-users',
        severity: passwordResetRequiredUsers >= 15 ? 'critical' : 'warning',
        title: 'Users still need password reset',
        message: `${passwordResetRequiredUsers} users are marked as requiring a password reset.`,
        metric: passwordResetRequiredUsers
      })
    }

    if (revenueTrend < -20) {
      alerts.push({
        id: 'revenue-drop',
        severity: 'warning',
        title: 'Revenue trend dropped',
        message: `Revenue trend is down ${Math.abs(revenueTrend)}% compared to previous 30 days.`,
        metric: revenueTrend
      })
    }

    const alertSummary = {
      total: alerts.length,
      critical: alerts.filter((a) => a.severity === 'critical').length,
      warning: alerts.filter((a) => a.severity === 'warning').length,
      info: alerts.filter((a) => a.severity === 'info').length
    }

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
      },
      kpis: {
        activeUserRate,
        avgCompletedProjectValue,
        completionRate,
        newProjectsLast30,
        newProjectsTrend
      },
      alertSummary,
      alerts,
      healthSignals: {
        lockedUsers,
        inactiveUsers,
        unverifiedUsers,
        passwordResetRequiredUsers,
        stalledProjects
      }
    })
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get paginated admin audit logs
// @route   GET /api/users/admin/audit-logs
// @access  Admin
export const getAdminAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 20, action = '', targetType = '', search = '' } = req.query

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100)

    const query = {}

    if (action) {
      query.action = action
    }

    if (targetType) {
      query.targetType = targetType
    }

    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [{ summary: regex }, { targetLabel: regex }, { actorRole: regex }]
    }

    const [logs, total, actions, targetTypes] = await Promise.all([
      AdminActionLog.find(query)
        .populate('actor', 'firstName lastName email profilePicture userType')
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      AdminActionLog.countDocuments(query),
      AdminActionLog.distinct('action'),
      AdminActionLog.distinct('targetType')
    ])

    res.json({
      logs,
      total,
      page: pageNumber,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      limit: pageSize,
      filterOptions: {
        actions: actions.filter(Boolean).sort((a, b) => a.localeCompare(b)),
        targetTypes: targetTypes.filter(Boolean).sort((a, b) => a.localeCompare(b))
      }
    })
  } catch (error) {
    console.error('Error fetching admin audit logs:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get admin-safe user detail (admin)
// @route   GET /api/users/admin/users/:userId
// @access  Admin
export const getAdminUserDetail = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select('-password -favorites -favoriteFreelancers')
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.ensureUnlockedIfExpired()

    const [createdProjects, assignedProjects, completedProjects, totalAnnouncements, activeAnnouncements] = await Promise.all([
      Project.countDocuments({ user: userId }),
      Project.countDocuments({ assignee: userId }),
      Project.countDocuments({
        $or: [{ user: userId }, { assignee: userId }],
        status: 'completed'
      }),
      Announcement.countDocuments({ userId }),
      Announcement.countDocuments({ userId, isActive: true })
    ])

    res.json({
      user,
      metrics: {
        createdProjects,
        assignedProjects,
        completedProjects,
        totalAnnouncements,
        activeAnnouncements
      }
    })
  } catch (error) {
    console.error('Error fetching admin user detail:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get paginated projects for a specific user (admin)
// @route   GET /api/users/admin/users/:userId/projects
// @access  Admin
export const getAdminUserProjects = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10, status = '', scope = 'all', sort = 'createdAt:desc' } = req.query

    const userExists = await User.exists({ _id: userId })
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)

    const query = {}
    if (scope === 'created') {
      query.user = userId
    } else if (scope === 'assigned') {
      query.assignee = userId
    } else {
      query.$or = [{ user: userId }, { assignee: userId }]
    }

    if (status && status !== 'all') {
      query.status = status
    }

    const [sortField, sortDirection] = String(sort).split(':')
    const direction = sortDirection === 'asc' ? 1 : -1
    const sortMap = {
      createdAt: { createdAt: direction },
      deadline: { deadline: direction },
      budget: { budget: direction },
      status: { status: direction }
    }
    const sortConfig = sortMap[sortField] || { createdAt: -1 }

    // Unlock expired locks before counting/fetching to keep pagination consistent
    const expiredLockedProjects = await Project.find({
      ...query,
      isLocked: true,
      lockExpiresAt: { $lt: new Date() }
    })
    await Promise.all(expiredLockedProjects.map((project) => project.ensureUnlockedIfExpired()))

    const [projects, total] = await Promise.all([
      Project.find(query)
        .populate('user', 'firstName lastName email profilePicture')
        .populate('assignee', 'firstName lastName email profilePicture')
        .sort(sortConfig)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Project.countDocuments(query)
    ])

    res.json({
      projects,
      total,
      page: pageNumber,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      limit: pageSize
    })
  } catch (error) {
    console.error('Error fetching admin user projects:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get paginated announcements for a specific user (admin)
// @route   GET /api/users/admin/users/:userId/announcements
// @access  Admin
export const getAdminUserAnnouncements = async (req, res) => {
  try {
    const { userId } = req.params
    const { page = 1, limit = 10, status = 'all', sort = 'createdAt:desc' } = req.query

    const userExists = await User.exists({ _id: userId })
    if (!userExists) {
      return res.status(404).json({ message: 'User not found' })
    }

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 10, 1), 100)

    const query = { userId }
    if (status === 'active') query.isActive = true
    if (status === 'inactive') query.isActive = false

    const [sortField, sortDirection] = String(sort).split(':')
    const direction = sortDirection === 'asc' ? 1 : -1
    const sortMap = {
      createdAt: { createdAt: direction },
      title: { title: direction },
      hourlyRate: { hourlyRate: direction }
    }
    const sortConfig = sortMap[sortField] || { createdAt: -1 }

    const [announcements, total] = await Promise.all([
      Announcement.find(query)
        .sort(sortConfig)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Announcement.countDocuments(query)
    ])

    res.json({
      announcements,
      total,
      page: pageNumber,
      pages: Math.max(Math.ceil(total / pageSize), 1),
      limit: pageSize
    })
  } catch (error) {
    console.error('Error fetching admin user announcements:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get all users (admin)
// @route   GET /api/users/admin/users
// @access  Admin
export const getAdminUsers = async (req, res) => {
  try {
    const { search = '', role = '', status = '', verification = '', passwordResetRequired = '', adminTag = '', notesState = '', page = 1, limit = 10, sort = 'createdAt:desc' } = req.query

    const query = {}
    const escapedAdminTag = String(adminTag || '')
      .trim()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

    // Search by name or email
    if (search) {
      query.$or = [{ firstName: { $regex: search, $options: 'i' } }, { lastName: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }]
    }

    // Filter by userType
    if (role) {
      query.userType = role
    }

    // Filter by email verification status
    if (verification === 'verified') {
      query.isEmailVerified = true
    }

    if (verification === 'unverified') {
      query.isEmailVerified = false
    }

    if (passwordResetRequired === 'true') {
      query.forcePasswordReset = true
    }

    if (passwordResetRequired === 'false') {
      query.forcePasswordReset = false
    }

    if (escapedAdminTag) {
      query.adminTags = { $regex: escapedAdminTag, $options: 'i' }
    }

    if (notesState === 'with_notes') {
      query.$and = [...(query.$and || []), { adminNotes: { $exists: true, $ne: '' } }]
    }

    if (notesState === 'without_notes') {
      query.$and = [...(query.$and || []), { $or: [{ adminNotes: { $exists: false } }, { adminNotes: '' }] }]
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

    await Promise.all(users.map((user) => user.ensureUnlockedIfExpired()))

    const refreshedUsers = await User.find(query).select('-password').sort(sortConfig).skip(skip).limit(Number(limit))

    res.json({
      users: refreshedUsers,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit))
    })
  } catch (error) {
    console.error('Error fetching admin users:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

const PRIVILEGED_USER_TYPES = ['admin', 'moderator', 'blogger', 'config_manager']
const ADMIN_USER_EDITABLE_FIELDS = ['firstName', 'lastName', 'email', 'userType', 'phone', 'location', 'skills', 'bio', 'hourlyRate', 'experienceLevel', 'adminNotes', 'adminTags']

const normalizeAdminTags = (value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean)
  }

  return []
}

// @desc    Toggle user lock status (admin)
// @route   PATCH /api/users/admin/:userId/lock
// @access  Admin
export const toggleUserLock = async (req, res) => {
  try {
    const { userId } = req.params
    const { reason = '', durationDays = 14 } = req.body

    const user = await User.findById(userId)
    if (!user) return res.status(404).json({ message: 'User not found' })

    await user.ensureUnlockedIfExpired()

    if (PRIVILEGED_USER_TYPES.includes(user.userType)) {
      return res.status(403).json({ message: 'Cannot lock or unlock privileged users' })
    }

    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'
    const beforeSnapshot = {
      isLocked: user.isLocked,
      lockReason: user.lockReason,
      lockExpiresAt: user.lockExpiresAt,
      lockDurationDays: user.lockDurationDays,
      lockedAt: user.lockedAt
    }

    if (user.isLocked) {
      user.isLocked = false
      user.lockReason = ''
      user.lockExpiresAt = null
      user.lockDurationDays = null
      user.lockedAt = null
      await user.save()

      await logAdminAction({
        req,
        action: 'user.unlocked',
        targetType: 'user',
        targetId: user._id,
        targetLabel,
        summary: `Unlocked user ${targetLabel}`,
        changes: buildFieldChanges(beforeSnapshot, user.toObject(), ['isLocked', 'lockReason', 'lockExpiresAt', 'lockDurationDays', 'lockedAt']),
        metadata: {
          targetEmail: user.email
        }
      })

      return res.json({ message: 'User unlocked successfully', isLocked: false })
    }

    if (!reason.trim()) {
      return res.status(400).json({ message: 'Lock reason is required' })
    }

    const days = Number(durationDays) || 0
    const expiresAt = days > 0 ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null

    user.isLocked = true
    user.lockReason = reason.trim()
    user.lockExpiresAt = expiresAt
    user.lockDurationDays = days > 0 ? days : null
    user.lockedAt = new Date()
    await user.save()

    await logAdminAction({
      req,
      action: 'user.locked',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Locked user ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, user.toObject(), ['isLocked', 'lockReason', 'lockExpiresAt', 'lockDurationDays', 'lockedAt']),
      metadata: {
        targetEmail: user.email,
        reason: user.lockReason,
        durationDays: user.lockDurationDays
      }
    })

    res.json({
      message: 'User locked successfully',
      isLocked: true,
      lockReason: user.lockReason,
      lockExpiresAt: user.lockExpiresAt
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

    const updates = {}
    ADMIN_USER_EDITABLE_FIELDS.forEach((field) => {
      if (req.body[field] === undefined) {
        return
      }

      if (field === 'adminTags') {
        updates[field] = normalizeAdminTags(req.body[field])
        return
      }

      if (field === 'adminNotes') {
        updates[field] = String(req.body[field] || '').trim()
        return
      }

      updates[field] = req.body[field]
    })

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided' })
    }

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPrivilegedUser = PRIVILEGED_USER_TYPES.includes(user.userType)
    const isChangingUserType = updates.userType !== undefined
    const isChangingToDifferentRole = isChangingUserType && updates.userType !== user.userType

    if (isPrivilegedUser && isChangingToDifferentRole) {
      return res.status(403).json({ message: 'Cannot change the role of privileged users' })
    }

    const beforeSnapshot = ADMIN_USER_EDITABLE_FIELDS.reduce((snapshot, field) => {
      snapshot[field] = user[field]
      return snapshot
    }, {})

    Object.assign(user, updates)
    const updatedUser = await user.save()

    const targetLabel = `${updatedUser.firstName || ''} ${updatedUser.lastName || ''}`.trim() || updatedUser.email || 'User'
    const changedFields = Object.keys(updates)

    await logAdminAction({
      req,
      action: 'user.updated',
      targetType: 'user',
      targetId: updatedUser._id,
      targetLabel,
      summary: `Updated user ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, updatedUser.toObject(), changedFields),
      metadata: {
        targetEmail: updatedUser.email,
        updatedFields: changedFields
      }
    })

    res.json({ message: 'User updated successfully', user: updatedUser })
  } catch (error) {
    console.error('Error updating user:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Trigger password reset email for a user (admin)
// @route   POST /api/users/admin/:userId/password-reset
// @access  Admin
export const requestAdminPasswordReset = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (PRIVILEGED_USER_TYPES.includes(user.userType)) {
      return res.status(403).json({ message: 'Cannot trigger password reset for privileged users' })
    }

    const mailResult = await sendPasswordResetEmail(user, { forcePasswordReset: true })
    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'

    await logAdminAction({
      req,
      action: 'user.password_reset_requested',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Requested password reset for ${targetLabel}`,
      metadata: {
        targetEmail: user.email,
        forcePasswordReset: true,
        delivered: mailResult.delivered,
        deliveryReason: mailResult.reason || null
      }
    })

    res.json({
      message: mailResult.delivered ? 'Password reset email sent.' : 'Password reset link generated, but email delivery is not configured.',
      delivery: mailResult
    })
  } catch (error) {
    console.error('Error requesting admin password reset:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Trigger verification email for a user (admin)
// @route   POST /api/users/admin/:userId/verify-email
// @access  Admin
export const requestAdminEmailVerification = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'User email is already verified.' })
    }

    const mailResult = await sendVerificationEmail(user)
    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'

    await logAdminAction({
      req,
      action: 'user.email_verification_requested',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Requested email verification for ${targetLabel}`,
      metadata: {
        targetEmail: user.email,
        delivered: mailResult.delivered,
        deliveryReason: mailResult.reason || null
      }
    })

    res.json({
      message: mailResult.delivered ? 'Verification email sent.' : 'Verification link generated, but email delivery is not configured.',
      delivery: mailResult
    })
  } catch (error) {
    console.error('Error requesting admin email verification:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Reactivate user activity by refreshing last login (admin)
// @route   PATCH /api/users/admin/:userId/reactivate
// @access  Admin
export const reactivateAdminUser = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.ensureUnlockedIfExpired()

    if (PRIVILEGED_USER_TYPES.includes(user.userType)) {
      return res.status(403).json({ message: 'Cannot reactivate privileged users' })
    }

    if (user.isLocked) {
      return res.status(400).json({ message: 'Locked users must be unlocked before reactivation' })
    }

    const beforeSnapshot = {
      lastLogin: user.lastLogin
    }

    user.lastLogin = new Date()
    await user.save()

    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'

    await logAdminAction({
      req,
      action: 'user.reactivated',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Reactivated user ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, user.toObject(), ['lastLogin']),
      metadata: {
        targetEmail: user.email,
        reactivatedAt: user.lastLogin
      }
    })

    res.json({
      message: 'User reactivated successfully',
      user: {
        _id: user._id,
        lastLogin: user.lastLogin
      }
    })
  } catch (error) {
    console.error('Error reactivating user:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Directly verify user email without sending verification mail (admin)
// @route   PATCH /api/users/admin/:userId/verify-email/direct
// @access  Admin
export const verifyAdminUserDirect = async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (PRIVILEGED_USER_TYPES.includes(user.userType)) {
      return res.status(403).json({ message: 'Cannot directly verify privileged users' })
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: 'User email is already verified.' })
    }

    const beforeSnapshot = {
      isEmailVerified: user.isEmailVerified,
      emailVerifiedAt: user.emailVerifiedAt,
      emailVerificationTokenHash: user.emailVerificationTokenHash,
      emailVerificationTokenExpiresAt: user.emailVerificationTokenExpiresAt
    }

    user.isEmailVerified = true
    user.emailVerifiedAt = new Date()
    user.emailVerificationTokenHash = null
    user.emailVerificationTokenExpiresAt = null

    await user.save()

    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'

    await logAdminAction({
      req,
      action: 'user.email_verified_direct',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Directly verified email for ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, user.toObject(), ['isEmailVerified', 'emailVerifiedAt', 'emailVerificationTokenHash', 'emailVerificationTokenExpiresAt']),
      metadata: {
        targetEmail: user.email,
        verifiedAt: user.emailVerifiedAt
      }
    })

    res.json({
      message: 'User email verified successfully',
      user: {
        _id: user._id,
        isEmailVerified: user.isEmailVerified,
        emailVerifiedAt: user.emailVerifiedAt
      }
    })
  } catch (error) {
    console.error('Error directly verifying user email:', error)
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

    if (PRIVILEGED_USER_TYPES.includes(user.userType)) {
      return res.status(403).json({ message: 'Cannot delete privileged users' })
    }

    const targetLabel = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'User'

    await Project.deleteMany({
      $or: [{ user: userId }, { assignee: userId }]
    })

    await user.deleteOne()

    await logAdminAction({
      req,
      action: 'user.deleted',
      targetType: 'user',
      targetId: user._id,
      targetLabel,
      summary: `Deleted user ${targetLabel}`,
      metadata: {
        targetEmail: user.email,
        deletedProjectAssociations: true
      }
    })

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
