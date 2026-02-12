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

// Get all active announcements (public, no auth needed)
// Used when browsing freelancers
export const getAllAnnouncements = async () => {
  try {
    const response = await axios.get('/api/announcements')
    return response.data
  } catch (error) {
    console.error('Error fetching announcements:', error)
    throw error
  }
}

// Get current user's announcements (protected)
// Used in FreelanceTab to display user's own announcements
export const getUserAnnouncements = async () => {
  try {
    const response = await authAxios.get('/api/announcements/my-announcements')
    return response.data
  } catch (error) {
    console.error('Error fetching user announcements:', error)
    throw error
  }
}

// Create new announcement (protected)
// Takes announcement data and returns the created announcement
// Parameters:
//   - hourlyRate: number (e.g., 50 for €50/hr)
//   - skills: array of strings (e.g., ["React", "JavaScript"])
//   - background: string (experience description)
//   - title: string (announcement headline)
export const createAnnouncement = async (announcementData) => {
  try {
    const response = await authAxios.post('/api/announcements', announcementData)
    return response.data
  } catch (error) {
    console.error('Error creating announcement:', error)
    throw error
  }
}

// Update announcement (protected)
// Only the owner can update
// Parameters:
//   - id: announcement ID
//   - updates: object with fields to update (hourlyRate, skills, background, title)
export const updateAnnouncement = async (id, updates) => {
  try {
    const response = await authAxios.put(`/api/announcements/${id}`, updates)
    return response.data
  } catch (error) {
    console.error('Error updating announcement:', error)
    throw error
  }
}

// Delete announcement (protected)
// Only the owner can delete
// Parameters:
//   - id: announcement ID to delete
export const deleteAnnouncement = async (id) => {
  try {
    const response = await authAxios.delete(`/api/announcements/${id}`)
    return response.data
  } catch (error) {
    console.error('Error deleting announcement:', error)
    throw error
  }
}

// Toggle announcement status (pause/unpause) (protected)
// Used in Task 10 to pause/unpause announcements
// Parameters:
//   - id: announcement ID
export const toggleAnnouncementStatus = async (id) => {
  try {
    const response = await authAxios.patch(`/api/announcements/${id}/toggle`)
    return response.data
  } catch (error) {
    console.error('Error toggling announcement status:', error)
    throw error
  }
}
