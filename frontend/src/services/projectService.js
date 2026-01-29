import axios from 'axios'

// Reuse the same authentication setup from userServices
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
    const response = await axios.get(`/api/projects/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch project:', error.response?.data || error.message)
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
