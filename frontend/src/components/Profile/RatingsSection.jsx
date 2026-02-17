import React from 'react'
import { motion } from 'framer-motion'
import { FaStar, FaUser } from 'react-icons/fa'

const RatingsSection = ({ ratings, stats, loading }) => {
  if (loading) {
    return (
      <div className='flex justify-center py-8'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
      </div>
    )
  }

  if (!ratings || !stats) {
    return (
      <div className='text-center py-8'>
        <p className='theme-text-secondary'>No ratings yet. Complete projects with clients to receive ratings.</p>
      </div>
    )
  }

  // Render star rating
  const renderStars = (score) => {
    return (
      <div className='flex gap-1'>
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar key={star} size={16} className={star <= score ? 'text-accent' : 'text-gray-300 dark:text-gray-600'} />
        ))}
      </div>
    )
  }

  return (
    <div className='space-y-6'>
      {/* Rating Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='theme-card p-6 rounded-lg'>
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold theme-text'>Your Ratings</h2>
          <div className='text-right'>
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-4xl font-bold text-accent'>{stats.averageRating.toFixed(1)}</span>
              {renderStars(Math.round(stats.averageRating))}
            </div>
            <p className='text-sm theme-text-secondary'>
              Based on {stats.totalRatings} rating{stats.totalRatings !== 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className='space-y-3'>
          {[5, 4, 3, 2, 1].map((stars) => (
            <div key={stars} className='flex items-center gap-4'>
              <div className='flex items-center gap-1 w-20'>
                <span className='text-sm font-medium'>{stars}</span>
                <FaStar size={12} className='text-accent' />
              </div>
              <div className='flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden'>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.distribution[stars] / stats.totalRatings) * 100}%` }}
                  transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                  className='h-full bg-accent'
                />
              </div>
              <span className='text-sm theme-text-secondary w-8'>{stats.distribution[stars]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Individual Ratings */}
      {ratings.ratings && ratings.ratings.length > 0 ? (
        <div className='space-y-4'>
          <h3 className='text-lg font-bold theme-text'>Client Reviews</h3>
          {ratings.ratings.map((rating, index) => (
            <motion.div key={rating._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} className='theme-card p-4 rounded-lg'>
              {/* Reviewer Info */}
              <div className='flex items-center gap-3 mb-3'>
                <div className='w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center'>
                  {rating.ratedBy.profilePicture ? <img src={rating.ratedBy.profilePicture} alt={rating.ratedBy.firstName} className='w-10 h-10 rounded-full object-cover' /> : <FaUser className='text-accent' />}
                </div>
                <div className='flex-1'>
                  <p className='font-semibold theme-text'>
                    {rating.ratedBy.firstName} {rating.ratedBy.lastName}
                  </p>
                  <p className='text-xs theme-text-secondary'>{new Date(rating.createdAt).toLocaleDateString()}</p>
                </div>
                <div>{renderStars(rating.score)}</div>
              </div>

              {/* Review Feedback */}
              {rating.feedback && <p className='text-sm theme-text-secondary'>{rating.feedback}</p>}
            </motion.div>
          ))}
        </div>
      ) : (
        <p className='text-sm theme-text-secondary text-center py-4'>No reviews yet</p>
      )}
    </div>
  )
}

export default RatingsSection
