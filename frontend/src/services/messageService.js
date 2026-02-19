import axios from 'axios'

// Get authentication token from localStorage
const getToken = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  return user.token
}

// Create authenticated axios instance
const createAuthAxios = () => {
  const instance = axios.create()
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

// Send a message about a project or direct message to another user
export const sendMessage = async (receiverId, content, subject = null, projectId = null) => {
  try {
    const messageData = {
      receiverId,
      content
    }
    if (subject) messageData.subject = subject
    if (projectId) messageData.projectId = projectId

    const response = await authAxios.post('/api/messages', messageData)
    return response.data
  } catch (error) {
    console.error('Failed to send message:', error.response?.data || error.message)
    throw error
  }
}

// Get all messages for a specific project
export const getProjectMessages = async (projectId) => {
  try {
    const response = await authAxios.get(`/api/messages/project/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch project messages:', error.response?.data || error.message)
    throw error
  }
}

// Get all messages for the current user
export const getUserMessages = async () => {
  try {
    const response = await authAxios.get('/api/messages/my-messages')
    return response.data
  } catch (error) {
    console.error('Failed to fetch user messages:', error.response?.data || error.message)
    throw error
  }
}

// Get conversation thread with a specific user
export const getConversation = async (userId) => {
  try {
    const response = await authAxios.get(`/api/messages/conversation/${userId}`)
    return response.data
  } catch (error) {
    console.error('Failed to fetch conversation:', error.response?.data || error.message)
    throw error
  }
}

// Mark message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await authAxios.put(`/api/messages/${messageId}/read`)
    return response.data
  } catch (error) {
    console.error('Failed to mark message as read:', error.response?.data || error.message)
    throw error
  }
}
