import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

// Register user
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData)

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Login user
export const login = async (email, password) => {
  const response = await axios.post(`${API_URL}/login`, { email, password })

  if (response.data) {
    localStorage.setItem('user', JSON.stringify(response.data))
  }

  return response.data
}

// Forgot password
export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_URL}/forgot-password`, { email })
  return response.data
}

// Reset password
export const resetPassword = async ({ token, password }) => {
  const response = await axios.post(`${API_URL}/reset-password`, { token, password })
  return response.data
}

// Logout user
export const logout = () => {
  localStorage.removeItem('user')
  return true
}

// Get current user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'))
}
