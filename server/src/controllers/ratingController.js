import User from '../models/User.js'
import Project from '../models/Project.js'

// Submit a rating for a freelancer
export const submitRating = async (req, res) => {
  try {
    const { freelancerId, projectId, score, feedback } = req.body
    const clientId = req.user._id

    // Validate required fields
    if (!freelancerId || !projectId || !score) {
      return res.status(400).json({ message: 'Freelancer ID, Project ID, and score are required' })
    }

    // Validate score is between 1-5
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' })
    }

    // Find the freelancer
    const freelancer = await User.findById(freelancerId)
    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' })
    }

    // Find the project to verify it exists and client owns it
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== clientId.toString()) {
      return res.status(403).json({ message: 'You can only rate freelancers on your own projects' })
    }

    // Check if client already rated this freelancer for this project
    const existingRating = freelancer.ratings.find((rating) => rating.projectId.toString() === projectId && rating.ratedBy.toString() === clientId.toString())

    if (existingRating) {
      return res.status(400).json({ message: 'You have already rated this freelancer for this project' })
    }

    // Add rating to freelancer's ratings array
    const newRating = {
      ratedBy: clientId,
      score,
      feedback: feedback?.trim() || '',
      projectId,
      createdAt: new Date()
    }

    freelancer.ratings.push(newRating)

    // Recalculate average rating
    const totalScore = freelancer.ratings.reduce((sum, rating) => sum + rating.score, 0)
    freelancer.averageRating = totalScore / freelancer.ratings.length
    freelancer.totalRatings = freelancer.ratings.length

    await freelancer.save()

    res.status(201).json({
      message: 'Rating submitted successfully',
      freelancer: {
        _id: freelancer._id,
        averageRating: freelancer.averageRating,
        totalRatings: freelancer.totalRatings
      }
    })
  } catch (error) {
    console.error('Error submitting rating:', error)
    res.status(500).json({ message: 'Failed to submit rating', error: error.message })
  }
}

// Get all ratings for a freelancer
export const getFreelancerRatings = async (req, res) => {
  try {
    const { freelancerId } = req.params

    const freelancer = await User.findById(freelancerId).populate('ratings.ratedBy', 'firstName lastName profilePicture')

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' })
    }

    res.json({
      averageRating: freelancer.averageRating,
      totalRatings: freelancer.totalRatings,
      ratings: freelancer.ratings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    })
  } catch (error) {
    console.error('Error fetching ratings:', error)
    res.status(500).json({ message: 'Failed to fetch ratings', error: error.message })
  }
}

// Get rating statistics
export const getRatingStats = async (req, res) => {
  try {
    const { freelancerId } = req.params

    const freelancer = await User.findById(freelancerId)

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' })
    }

    // Calculate rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0
    }

    freelancer.ratings.forEach((rating) => {
      distribution[rating.score]++
    })

    res.json({
      averageRating: freelancer.averageRating,
      totalRatings: freelancer.totalRatings,
      distribution
    })
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    res.status(500).json({ message: 'Failed to fetch rating stats', error: error.message })
  }
}
