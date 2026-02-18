import axios from 'axios'

// Gets the authentication token from localStorage
const getToken = () => {
  // Parse user data from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.token
}

// Configures axios with auth token for API requests
const setAuthHeader = () => {
  const token = getToken()
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    // Remove auth header if no token exists
    delete axios.defaults.headers.common['Authorization']
  }
}

// Creates a pre-configured axios instance with auth headers
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

// Create authenticated axios instance
const authAxios = createAuthAxios()

// Fetches the current user's profile from the API
export const getUserProfile = async () => {
  try {
    // Using the pre-configured axios instance with auth
    const response = await authAxios.get('/api/users/profile')
    return response.data
  } catch (error) {
    console.error('Failed to fetch user profile:', error.response?.data || error.message)
    throw error
  }
}

// Fetches user dashboard statistics with 30-day trends
export const getUserStats = async () => {
  try {
    // Call backend endpoint that calculates all stats
    const response = await authAxios.get('/api/users/stats')
    return response.data
  } catch (error) {
    console.error('Failed to fetch user stats:', error.response?.data || error.message)
    throw error
  }
}

// Get user's favorite projects
export const getFavoriteProjects = async () => {
  try {
    const response = await authAxios.get('/api/users/favorites')
    return response.data
  } catch (error) {
    console.error('Failed to get favorite projects:', error.response?.data || error.message)
    throw error
  }
}

// Add project to favorites
export const addToFavorites = async (projectId) => {
  try {
    const response = await authAxios.post(`/api/users/favorites/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to add to favorites:', error.response?.data || error.message)
    throw error
  }
}

// Remove project from favorites
export const removeFromFavorites = async (projectId) => {
  try {
    const response = await authAxios.delete(`/api/users/favorites/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to remove from favorites:', error.response?.data || error.message)
    throw error
  }
}

// Updates the user's profile with new data
export const updateUserProfile = async (profileData) => {
  try {
    const response = await authAxios.put('/api/users/profile', profileData)
    return response.data
  } catch (error) {
    console.error('Failed to update profile:', error.response?.data || error.message)
    throw error
  }
}

// Get all freelancers (freelancer + both)
export const getFreelancers = async () => {
  try {
    const response = await axios.get('/api/users/freelancers')
    return response.data
  } catch (error) {
    console.error('Failed to get freelancers:', error.response?.data || error.message)
    throw error
  }
}

// Get user by ID
export const getUserById = async (userId) => {
  try {
    const response = await axios.get(`/api/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
