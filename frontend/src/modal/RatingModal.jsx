import React, { useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaStar } from 'react-icons/fa'
import { submitRating } from '../services/ratingService'
import { AuthContext } from '../context/AuthContext'

const RatingModal = ({ isOpen, onClose, freelancer, projectId, onRatingSubmitted, ratedUserType = 'freelancer' }) => {
  const { logout } = useContext(AuthContext)
  // Support both freelancer prop (legacy) and generic ratedUser
  const ratedUser = freelancer
  const userTypeLabel = ratedUserType === 'client' ? 'Client' : 'Freelancer'
  // Form state
  const [score, setScore] = useState(0)
  const [hoverScore, setHoverScore] = useState(0)
  const [feedback, setFeedback] = useState('')

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Handle star click
  const handleStarClick = (value) => {
    setScore(value)
    if (error) setError('')
  }

  // Validate form
  const validateForm = () => {
    if (score === 0) {
      setError('Please select a rating')
      return false
    }
    return true
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')

      // Submit rating to backend
      await submitRating(ratedUser._id, projectId, score, feedback.trim())

      // Show success message
      setSuccess(true)

      // Reset form after 1.5 seconds
      setTimeout(() => {
        setScore(0)
        setFeedback('')
        setSuccess(false)

        // Call callback to refresh data
        if (onRatingSubmitted) {
          onRatingSubmitted()
        }

        // Close modal
        onClose()
      }, 1500)
    } catch (err) {
      console.log('[RATING SUBMIT] Error:', err.response?.status, err.response?.data?.message)

      // Handle authentication errors (token expired or user logged out)
      if (err.response?.status === 401) {
        console.log('[RATING SUBMIT] 401 - Logging out user')
        logout()
        setError('Your session has expired. Please log in again to submit a rating.')
        return
      }

      setError(err.response?.data?.message || 'Failed to submit rating')
      setLoading(false)
    }
  }

  // Handle close button
  const handleClose = () => {
    if (!loading) {
      setScore(0)
      setFeedback('')
      setError('')
      setSuccess(false)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className='fixed inset-0 bg-black/50 backdrop-blur-sm z-40' />

          {/* Modal */}
          <motion.div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <motion.div
              className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto'
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Header */}
              <div className='flex items-center justify-between p-6 border-b dark:border-gray-700 border-gray-200 sticky top-0 bg-inherit rounded-t-lg'>
                <h2 className='text-2xl font-bold theme-text'>Rate {userTypeLabel}</h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleClose}
                  disabled={loading}
                  className='text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50'>
                  <FaTimes size={24} />
                </motion.button>
              </div>

              {/* Content */}
              <form onSubmit={handleSubmit} className='p-6 space-y-4'>
                {/* Success Message */}
                {success && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 p-4 rounded-lg'>
                    <FaStar />
                    <span>Rating submitted successfully!</span>
                  </motion.div>
                )}

                {/* Error Message */}
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg'>
                    {error}
                  </motion.div>
                )}

                {/* User Info */}
                <div className='flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg'>
                  <img src={ratedUser.profilePicture || `https://i.pravatar.cc/150?u=${ratedUser._id}`} alt={ratedUser.firstName} className='w-12 h-12 rounded-full object-cover' />
                  <div>
                    <p className='font-semibold theme-text'>
                      {ratedUser.firstName} {ratedUser.lastName}
                    </p>
                    <p className='text-sm theme-text-secondary'>{ratedUserType === 'client' ? 'Client' : ratedUser.skills || 'Freelancer'}</p>
                  </div>
                </div>

                {/* Star Rating */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-3'>How would you rate this freelancer?</label>
                  <div className='flex justify-center gap-3'>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <motion.button
                        key={star}
                        type='button'
                        onClick={() => handleStarClick(star)}
                        onMouseEnter={() => setHoverScore(star)}
                        onMouseLeave={() => setHoverScore(0)}
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}
                        className='p-2 rounded-lg transition-colors'
                        disabled={loading}>
                        <FaStar size={32} className={`transition-colors ${star <= (hoverScore || score) ? 'text-accent' : 'text-gray-300 dark:text-gray-600'}`} />
                      </motion.button>
                    ))}
                  </div>
                  {score > 0 && (
                    <p className='text-center text-sm theme-text-secondary mt-2'>
                      {score === 5 && 'Excellent!'}
                      {score === 4 && 'Very Good'}
                      {score === 3 && 'Good'}
                      {score === 2 && 'Fair'}
                      {score === 1 && 'Poor'}
                    </p>
                  )}
                </div>

                {/* Feedback Field */}
                <div>
                  <label className='block text-sm font-semibold theme-text mb-2'>Feedback (Optional)</label>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder='Share your experience working with this freelancer...'
                    disabled={loading}
                    rows='4'
                    className='w-full px-4 py-2 rounded-lg theme-input theme-text border dark:border-gray-600 border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all resize-none disabled:opacity-50'
                  />
                  <p className='text-xs theme-text-secondary mt-1'>{feedback.length} / 500 characters</p>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-4'>
                  <motion.button
                    type='button'
                    onClick={handleClose}
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 theme-text hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50'>
                    Cancel
                  </motion.button>

                  <motion.button
                    type='submit'
                    disabled={loading || score === 0}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className='flex-1 px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2'>
                    {loading ? (
                      <>
                        <div className='animate-spin rounded-full h-4 w-4 border-t-2 border-white'></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <FaStar />
                        Submit Rating
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default RatingModal
