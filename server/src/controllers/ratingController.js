import User from '../models/User.js'
import Project from '../models/Project.js'

// Submit a rating for a freelancer or client
export const submitRating = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      console.log('[RATING SUBMIT] Not authenticated - no user in request')
      return res.status(401).json({ message: 'You must be logged in to submit a rating' })
    }

    const { receiverId, projectId, score, feedback } = req.body
    const raterId = req.user._id

    console.log('[RATING SUBMIT START]', { receiverId, projectId, score, raterId: raterId.toString() })

    // Validate required fields
    if (!receiverId || !projectId || !score) {
      return res.status(400).json({ message: 'Receiver ID, Project ID, and score are required' })
    }

    // Validate score is between 1-5
    if (score < 1 || score > 5) {
      return res.status(400).json({ message: 'Score must be between 1 and 5' })
    }

    // Find the receiver (person being rated)
    const receiver = await User.findById(receiverId)
    if (!receiver) {
      console.log('[RATING SUBMIT] User not found:', receiverId)
      return res.status(404).json({ message: 'User not found' })
    }

    console.log('[RATING SUBMIT] Receiver found:', receiver._id.toString())

    // Find the project to verify authorization
    const project = await Project.findById(projectId)
    if (!project) {
      console.log('[RATING SUBMIT] Project not found:', projectId)
      return res.status(404).json({ message: 'Project not found' })
    }

    console.log('[RATING SUBMIT] Project found:', project._id.toString())

    // Determine if rating freelancer or client and verify authorization
    let isRatingFreelancer
    if (project.assignee && project.assignee.toString() === receiverId) {
      // Rating a freelancer - rater must be the project creator (client)
      isRatingFreelancer = true
      if (project.user.toString() !== raterId.toString()) {
        return res.status(403).json({ message: 'You can only rate freelancers on your own projects' })
      }
    } else if (project.user.toString() === receiverId) {
      // Rating a client - rater must be the project assignee (freelancer)
      isRatingFreelancer = false
      if (!project.assignee || project.assignee.toString() !== raterId.toString()) {
        return res.status(403).json({ message: 'You can only rate clients on projects you are assigned to' })
      }
    } else {
      return res.status(400).json({ message: 'Invalid rating parameters' })
    }

    // Check if rater already rated this user for this project
    const existingRating = receiver.ratings.find((rating) => rating.projectId.toString() === projectId && rating.ratedBy.toString() === raterId.toString())

    if (existingRating) {
      console.log('[RATING SUBMIT] User already rated this person for this project')
      return res.status(400).json({ message: 'You have already rated this user for this project' })
    }

    console.log('[RATING SUBMIT] Creating new rating entry')

    // Add rating to receiver's ratings array
    const newRating = {
      ratedBy: raterId,
      score,
      feedback: feedback?.trim() || '',
      projectId,
      createdAt: new Date()
    }

    receiver.ratings.push(newRating)

    console.log('[RATING SUBMIT] Rating pushed to array, recalculating average')

    // Recalculate average rating
    const totalScore = receiver.ratings.reduce((sum, rating) => sum + rating.score, 0)
    receiver.averageRating = totalScore / receiver.ratings.length
    receiver.totalRatings = receiver.ratings.length

    console.log('[RATING SUBMIT] Saving receiver with new rating:', { averageRating: receiver.averageRating, totalRatings: receiver.totalRatings })

    await receiver.save()

    console.log('[RATING SUBMIT] SUCCESS')

    res.status(201).json({
      message: 'Rating submitted successfully',
      user: {
        _id: receiver._id,
        averageRating: receiver.averageRating,
        totalRatings: receiver.totalRatings
      }
    })
  } catch (error) {
    console.error('[RATING SUBMIT ERROR]', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      receiverId: req.body.receiverId,
      projectId: req.body.projectId,
      userId: req.user?._id
    })
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
