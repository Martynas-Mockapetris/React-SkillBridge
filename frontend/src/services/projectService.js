import axios from 'axios'
import { authAxios } from '../utils/axiosConfig'

// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await authAxios.post('/api/projects', projectData)
    return response.data
  } catch (error) {
    console.error('Failed to create project:', error.response?.data || error.message)
    throw error
  }
}

// Save a project as draft
export const saveProjectDraft = async (projectData) => {
  try {
    // Set status to draft
    const draftData = { ...projectData, status: 'draft' }
    const response = await authAxios.post('/api/projects', draftData)
    return response.data
  } catch (error) {
    console.error('Failed to save draft:', error.response?.data || error.message)
    throw error
  }
}

// Get all projects for the current user
export const getUserProjects = async () => {
  try {
    const response = await authAxios.get('/api/projects')
    return response.data
  } catch (error) {
    console.error('Failed to fetch user projects:', error.response?.data || error.message)
    throw error
  }
}

// Get all active projects (for listings page)
export const getAllProjects = async () => {
  try {
    const response = await axios.get('/api/projects/all')
    return response.data
  } catch (error) {
    console.error('Failed to fetch all projects:', error.response?.data || error.message)
    throw error
  }
}

// Get a specific project by ID
export const getProjectById = async (projectId) => {
  try {
    const response = await authAxios.get(`/api/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch project:', error.response?.data || error.message)
    throw error
  }
}

// Get project by ID for owner (includes drafts)
export const getProjectByIdOwner = async (projectId) => {
  try {
    const response = await authAxios.get(`/api/projects/${projectId}/owner`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch owner project:', error.response?.data || error.message)
    throw error
  }
}

// Get all projects for admin dashboard (all statuses)
export const getAdminAllProjects = async () => {
  try {
    const response = await authAxios.get('/api/projects/admin/all')
    return response.data
  } catch (error) {
    console.error('Failed to fetch admin projects:', error.response?.data || error.message)
    throw error
  }
}

// Update an existing project
export const updateProject = async (projectId, projectData) => {
  try {
    const response = await authAxios.put(`/api/projects/${projectId}`, projectData)
    return response.data
  } catch (error) {
    console.error('Failed to update project:', error.response?.data || error.message)
    throw error
  }
}

// Delete a project
export const deleteProject = async (projectId) => {
  try {
    const response = await authAxios.delete(`/api/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to delete project:', error.response?.data || error.message)
    throw error
  }
}

// Get all projects current user is interested in
export const getInterestedProjects = async () => {
  try {
    const response = await authAxios.get('/api/projects/interested')
    return response.data
  } catch (error) {
    console.error('Failed to fetch interested projects:', error.response?.data || error.message)
    throw error
  }
}

// Remove current user from project's interestedUsers
export const removeFromInterested = async (projectId) => {
  try {
    const response = await authAxios.delete(`/api/projects/${projectId}/interested`)
    return response.data
  } catch (error) {
    console.error('Failed to remove from interested:', error.response?.data || error.message)
    throw error
  }
}

// Assign a user to a project
export const assignUserToProject = async (projectId, userId) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/assign`, { userId })
    return response.data
  } catch (error) {
    console.error('Failed to assign user to project:', error.response?.data || error.message)
    throw error
  }
}

// Remove assignee from project
export const removeAssignee = async (projectId) => {
  try {
    const response = await authAxios.delete(`/api/projects/${projectId}/assignee`)
    return response.data
  } catch (error) {
    console.error('Failed to remove assignee:', error.response?.data || error.message)
    throw error
  }
}

// Publish a draft project
export const publishProject = async (projectId) => {
  try {
    const response = await authAxios.put(`/api/projects/${projectId}/publish`)
    return response.data
  } catch (error) {
    console.error('Failed to publish project:', error.response?.data || error.message)
    throw error
  }
}

// Submit project work (assignee)
export const submitProject = async (projectId, formData) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/submit`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  } catch (error) {
    console.error('Failed to submit project:', error.response?.data || error.message)
    throw error
  }
}

// Review submitted project (owner)
export const reviewProject = async (projectId, reviewData) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/review`, reviewData)
    return response.data
  } catch (error) {
    console.error('Failed to review project:', error.response?.data || error.message)
    throw error
  }
}

// Propose a rate (owner only)
export const proposeRate = async (projectId, rateData) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/rate/propose`, rateData)
    return response.data
  } catch (error) {
    console.error('Failed to propose rate:', error.response?.data || error.message)
    throw error
  }
}

// Counter a rate (assignee only)
export const counterRate = async (projectId, rateData) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/rate/counter`, rateData)
    return response.data
  } catch (error) {
    console.error('Failed to counter rate:', error.response?.data || error.message)
    throw error
  }
}

// Accept current rate (owner or assignee)
export const acceptRate = async (projectId) => {
  try {
    const response = await authAxios.post(`/api/projects/${projectId}/rate/accept`)
    return response.data
  } catch (error) {
    console.error('Failed to accept rate:', error.response?.data || error.message)
    throw error
  }
}

// Archive a completed project
export const archiveProject = async (projectId) => {
  try {
    const response = await authAxios.patch(`/api/projects/${projectId}/archive`)
    return response.data
  } catch (error) {
    console.error('Error archiving project:', error)
    throw error
  }
}
