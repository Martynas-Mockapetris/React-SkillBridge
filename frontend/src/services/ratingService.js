import axios from 'axios'

// Get authentication token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.token
}

// Create authenticated axios instance
const createAuthAxios = () => {
  const instance = axios.create()

  // Add request interceptor to automatically set auth header
  instance.interceptors.request.use((config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return instance
}

const authAxios = createAuthAxios()

// Submit a rating for a user (freelancer or client)
export const submitRating = async (receiverId, projectId, score, feedback = '') => {
  try {
    const response = await authAxios.post('/api/ratings', {
      receiverId,
      projectId,
      score,
      feedback
    })
    return response.data
  } catch (error) {
    console.error('Error submitting rating:', error)
    throw error
  }
}

// Get all ratings for a freelancer (public)
export const getFreelancerRatings = async (freelancerId) => {
  try {
    const response = await axios.get(`/api/ratings/freelancer/${freelancerId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching ratings:', error)
    throw error
  }
}

// Get rating statistics for a freelancer (public)
export const getRatingStats = async (freelancerId) => {
  try {
    const response = await axios.get(`/api/ratings/stats/${freelancerId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching rating stats:', error)
    throw error
  }
}
