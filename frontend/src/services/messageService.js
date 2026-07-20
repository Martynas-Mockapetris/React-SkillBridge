import axios from 'axios'
import { authAxios } from '../utils/axiosConfig'

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

// Send a message with file attachments
export const sendMessageWithAttachments = async (receiverId, content, files = [], subject = null, projectId = null) => {
  try {
    const formData = new FormData()
    formData.append('receiverId', receiverId)
    formData.append('content', content)

    if (subject) formData.append('subject', subject)
    if (projectId) formData.append('projectId', projectId)

    // Add files to FormData
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('attachments', file)
      })
    }

    const response = await authAxios.post('/api/messages', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    console.error('Failed to send message with attachments:', error.response?.data || error.message)
    throw error
  }
}

// Download attachment
export const downloadMessageAttachment = (attachmentPath) => {
  try {
    const link = document.createElement('a')
    link.href = `/${attachmentPath}`
    link.click()
  } catch (error) {
    console.error('Failed to download attachment:', error)
    throw error
  }
}
