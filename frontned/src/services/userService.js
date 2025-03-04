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
