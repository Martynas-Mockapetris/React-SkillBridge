import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaStar, FaArrowLeft, FaHeart, FaRegHeart, FaPhone, FaEnvelope } from 'react-icons/fa'
import { useAuth } from '../context/AuthContext'
import { getFreelancerRatings, getRatingStats } from '../services/ratingService'
import { getUserById, addFreelancerToFavorites, removeFreelancerFromFavorites, getUserProfile } from '../services/userService'
import { getAllAnnouncements } from '../services/announcementService'
import RatingsSection from '../components/Profile/RatingsSection'
import molecularPattern from '../assets/molecular-pattern.svg'

const UserDetail = () => {
  const { freelancerId } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  // State
  const [freelancer, setFreelancer] = useState(null)
  const [announcements, setAnnouncements] = useState([])
  const [ratings, setRatings] = useState(null)
  const [ratingStats, setRatingStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  // Fetch freelancer data, announcements, and ratings
  useEffect(() => {
    const fetchData = async () => {
      try {
        const freelancerData = await getUserById(freelancerId)
        setFreelancer(freelancerData)

        // Check if current user has this freelancer favorited by fetching fresh profile data
        if (currentUser) {
          try {
            const userProfile = await getUserProfile()
            setIsFavorited(userProfile.favoriteFreelancers?.includes(freelancerId) || false)
          } catch (error) {
            console.error('Error checking favorite status:', error)
            setIsFavorited(false)
          }
        }

        // Fetch announcements
        const allAnnouncements = await getAllAnnouncements()
        const freelancerAnnouncements = allAnnouncements.filter((ann) => (typeof ann.userId === 'string' ? ann.userId === freelancerId : ann.userId._id === freelancerId || ann.userId === freelancerId))
        setAnnouncements(freelancerAnnouncements)

        // Fetch ratings
        const ratingsData = await getFreelancerRatings(freelancerId)
        const statsData = await getRatingStats(freelancerId)
        setRatings(ratingsData)
        setRatingStats(statsData)

        setLoading(false)
      } catch (error) {
        console.error('Error fetching freelancer data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [freelancerId, currentUser])

  if (loading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
      </div>
    )
  }

  if (!freelancer) {
    return (
      <div className='flex flex-col items-center justify-center min-h-screen'>
        <h1 className='text-2xl font-bold theme-text mb-4'>Freelancer not found</h1>
        <button onClick={() => navigate('/listings')} className='btn-primary'>
          Back to Listings
        </button>
      </div>
    )
  }

  const handleToggleFavorite = async () => {
    if (!currentUser) {
      alert('Please login to add favorites')
      return
    }

    try {
      if (isFavorited) {
        await removeFreelancerFromFavorites(freelancerId)
        setIsFavorited(false)
      } else {
        await addFreelancerToFavorites(freelancerId)
        setIsFavorited(true)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      alert('Failed to update favorites')
    }
  }

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      {/* Molecular patterns */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-20 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[500px] h-[500px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-50deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 py-12 relative z-10'>
        {/* Back Button */}
        <motion.button onClick={() => navigate(-1)} className='flex items-center gap-2 text-accent hover:text-accent/80 mb-8 transition-colors' whileHover={{ x: -5 }}>
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>

        {/* Freelancer Header */}
        <motion.div className='flex items-start gap-6 mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className='w-32 h-32 rounded-full overflow-hidden border-4 border-accent' whileHover={{ scale: 1.05 }}>
            <img src={freelancer.profilePicture || `https://i.pravatar.cc/150?u=${freelancer._id}`} alt='Profile' className='w-full h-full object-cover' />
          </motion.div>
          <div className='flex-1'>
            <h1 className='text-4xl font-bold theme-text mb-2'>
              {freelancer.firstName} {freelancer.lastName}
            </h1>
            <p className='theme-text-secondary mb-2'>Freelancer</p>
            {ratingStats && (
              <div className='flex items-center gap-3 mb-4'>
                <span className='text-2xl font-bold text-accent'>{ratingStats.averageRating.toFixed(1)}</span>
                <div className='flex'>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <FaStar key={star} size={18} className={star <= Math.round(ratingStats.averageRating) ? 'text-accent' : 'text-gray-300 dark:text-gray-600'} />
                  ))}
                </div>
                <span className='text-sm theme-text-secondary'>({ratingStats.totalRatings} ratings)</span>
              </div>
            )}
            {/* Action Buttons */}
            <div className='flex gap-3'>
              <motion.button className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all' whileHover={{ scale: 1.05 }}>
                Contact Freelancer
              </motion.button>
              <motion.button className='px-6 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all' whileHover={{ scale: 1.05 }}>
                Hire
              </motion.button>
              <motion.button onClick={handleToggleFavorite} className='px-6 py-2 bg-accent/10 text-accent rounded-lg hover:bg-accent hover:text-white transition-all' whileHover={{ scale: 1.05 }}>
                {isFavorited ? <FaHeart /> : <FaRegHeart />}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Announcements Section */}
        {announcements.length > 0 && (
          <motion.div className='mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className='text-2xl font-bold theme-text mb-6'>Active Announcements</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {announcements.map((announcement) => (
                <motion.div key={announcement._id} className='theme-card p-6 rounded-lg'>
                  <h3 className='text-xl font-bold theme-text mb-2'>{announcement.title}</h3>
                  <p className='theme-text-secondary mb-4'>{announcement.background}</p>
                  <div className='flex justify-between items-center'>
                    <span className='font-bold theme-text'>€{announcement.hourlyRate}/hr</span>
                    <div className='flex gap-2 flex-wrap'>
                      {announcement.skills?.map((skill) => (
                        <span key={skill} className='text-xs bg-accent/20 text-accent px-2 py-1 rounded'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Ratings Section */}
        {ratings && ratingStats && (
          <motion.div className='mb-12' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}>
            <h2 className='text-2xl font-bold theme-text mb-6'>Reviews & Ratings</h2>
            <RatingsSection ratings={ratings} stats={ratingStats} loading={false} />
          </motion.div>
        )}
      </div>
    </section>
  )
}

export default UserDetail
