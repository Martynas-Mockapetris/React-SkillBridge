import axios from 'axios'
import { authAxios } from '../utils/axiosConfig'

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

// Fetch admin dashboard statistics (global)
export const getAdminDashboardStats = async () => {
  try {
    const response = await authAxios.get('/api/users/admin/stats')
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin dashboard stats:', error.response?.data || error.message)
    throw error
  }
}

export const getAdminAuditLogs = async (params = {}) => {
  try {
    const { page = 1, limit = 20, action = '', targetType = '', search = '' } = params

    const queryParams = new URLSearchParams({
      page,
      limit,
      action,
      targetType,
      search
    })

    const response = await authAxios.get(`/api/users/admin/audit-logs?${queryParams}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin audit logs:', error.response?.data || error.message)
    throw error
  }
}

// Get admin-safe user detail
export const getAdminUserDetail = async (userId) => {
  try {
    const response = await authAxios.get(`/api/users/admin/users/${userId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin user detail:', error.response?.data || error.message)
    throw error
  }
}

// Get admin view of user's projects
export const getAdminUserProjects = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'all',
      scope: params.scope || 'all',
      sort: params.sort || 'createdAt:desc'
    })

    const response = await authAxios.get(`/api/users/admin/users/${userId}/projects?${queryParams}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin user projects:', error.response?.data || error.message)
    throw error
  }
}

// Get admin view of user's announcements
export const getAdminUserAnnouncements = async (userId, params = {}) => {
  try {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      limit: params.limit || 10,
      status: params.status || 'all',
      sort: params.sort || 'createdAt:desc'
    })

    const response = await authAxios.get(`/api/users/admin/users/${userId}/announcements?${queryParams}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin user announcements:', error.response?.data || error.message)
    throw error
  }
}

// Fetch all users for admin panel
export const getAdminUsers = async (params = {}) => {
  try {
    const { search = '', role = '', status = '', page = 1, limit = 10, sort = 'createdAt:desc' } = params

    const queryParams = new URLSearchParams({
      search,
      role,
      status,
      page,
      limit,
      sort
    })

    const response = await authAxios.get(`/api/users/admin/users?${queryParams}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin users:', error.response?.data || error.message)
    throw error
  }
}

// Toggle user lock status (admin)
export const toggleUserLock = async (userId, payload = {}) => {
  try {
    const response = await authAxios.patch(`/api/users/admin/${userId}/lock`, payload)
    return response.data
  } catch (error) {
    console.error('Failed to toggle user lock:', error.response?.data || error.message)
    throw error
  }
}

// Update user (admin)
export const updateAdminUser = async (userId, payload) => {
  try {
    const response = await authAxios.put(`/api/users/admin/${userId}`, payload)
    return response.data
  } catch (error) {
    console.error('Failed to update admin user:', error.response?.data || error.message)
    throw error
  }
}

// Delete user (admin)
export const deleteAdminUser = async (userId) => {
  try {
    const response = await authAxios.delete(`/api/users/admin/${userId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete user:', error.response?.data || error.message)
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

// Add freelancer to favorites
export const addFreelancerToFavorites = async (freelancerId) => {
  try {
    const response = await authAxios.post(`/api/users/favorites/freelancer/${freelancerId}`)
    return response.data
  } catch (error) {
    console.error('Failed to add freelancer to favorites:', error.response?.data || error.message)
    throw error
  }
}

// Remove freelancer from favorites
export const removeFreelancerFromFavorites = async (freelancerId) => {
  try {
    const response = await authAxios.delete(`/api/users/favorites/freelancer/${freelancerId}`)
    return response.data
  } catch (error) {
    console.error('Failed to remove freelancer from favorites:', error.response?.data || error.message)
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
