import Project from '../models/Project.js'
import User from '../models/User.js'

// Get freelancer analytics dashboard data
export const getFreelancerAnalytics = async (req, res) => {
  try {
    const freelancerId = req.user._id

    // Get all projects where freelancer has applied
    const appliedProjects = await Project.find({
      'interestedUsers.userId': freelancerId
    }).populate('interestedUsers.userId')

    // Extract interested user records for this freelancer
    const applications = []
    appliedProjects.forEach((project) => {
      const userRecord = project.interestedUsers.find((u) => u.userId._id.toString() === freelancerId.toString())
      if (userRecord) {
        applications.push({
          projectId: project._id,
          projectTitle: project.title,
          ...userRecord.toObject(),
          applicationDate: userRecord.contactedAt
        })
      }
    })

    // Calculate stats
    const stats = {
      totalApplications: applications.length,
      pending: applications.filter((a) => a.status === 'pending').length,
      accepted: applications.filter((a) => a.status === 'accepted').length,
      rejected: applications.filter((a) => a.status === 'rejected').length,
      shortlisted: applications.filter((a) => a.isShortlisted).length,
      skillsVerified: applications.filter((a) => a.skillsVerified).length
    }

    // Calculate rates
    stats.responseRate = stats.totalApplications > 0 ? (((stats.accepted + stats.rejected) / stats.totalApplications) * 100).toFixed(1) : 0

    stats.conversionRate = stats.totalApplications > 0 ? ((stats.accepted / stats.totalApplications) * 100).toFixed(1) : 0

    stats.shortlistRate = stats.totalApplications > 0 ? ((stats.shortlisted / stats.totalApplications) * 100).toFixed(1) : 0

    stats.verificationRate = stats.shortlisted > 0 ? ((stats.skillsVerified / stats.shortlisted) * 100).toFixed(1) : 0

    // Get profile views
    const freelancer = await User.findById(freelancerId)
    stats.profileViews = freelancer.profileViewCount || 0

    // Generate time-series data for applications (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const applicationsByDate = {}
    applications
      .filter((a) => new Date(a.applicationDate) >= thirtyDaysAgo)
      .forEach((app) => {
        const dateKey = new Date(app.applicationDate).toISOString().split('T')[0]
        applicationsByDate[dateKey] = (applicationsByDate[dateKey] || 0) + 1
      })

    // Format for chart
    const trendData = Object.entries(applicationsByDate)
      .map(([date, count]) => ({
        date,
        applications: count
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))

    // Status breakdown for pie chart
    const statusBreakdown = [
      { name: 'Pending', value: stats.pending, color: '#f59e0b' },
      { name: 'Accepted', value: stats.accepted, color: '#10b981' },
      { name: 'Rejected', value: stats.rejected, color: '#ef4444' }
    ]

    res.status(200).json({
      success: true,
      data: {
        stats,
        trendData,
        statusBreakdown,
        recentApplications: applications.sort((a, b) => new Date(b.applicationDate) - new Date(a.applicationDate)).slice(0, 10)
      }
    })
  } catch (error) {
    console.error('Analytics error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// Record profile view
export const recordProfileView = async (req, res) => {
  try {
    const viewedUserId = req.params.userId
    const viewerUserId = req.user._id

    // Don't record if user views their own profile
    if (viewedUserId === viewerUserId.toString()) {
      return res.status(200).json({ success: true })
    }

    const user = await User.findByIdAndUpdate(
      viewedUserId,
      {
        $inc: { profileViewCount: 1 },
        $push: {
          profileViews: {
            viewedBy: viewerUserId,
            viewedAt: new Date()
          }
        }
      },
      { new: true }
    )

    res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.error('Profile view tracking error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
