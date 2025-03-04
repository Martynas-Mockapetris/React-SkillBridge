import { createContext, useState, useEffect, useContext, useCallback } from 'react'
import { getCurrentUser, login as loginService, logout as logoutService, register as registerService } from '../services/authService'
import { getUserProfile as getUserProfileService, updateUserProfile as updateUserProfileService } from '../services/userService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

/**
 * Authentication Context
 * Provides authentication state and functions throughout the application
 */
const AuthContext = createContext(null)

/**
 * Helper function to merge profile data with auth data while preserving token
 * @param {Object} profileData - Profile data from API
 * @returns {Object} - Complete user object with preserved token
 */
const mergeWithAuthData = (profileData) => {
  // Get auth data with token from localStorage
  const authData = JSON.parse(localStorage.getItem('user')) || {}

  // Create complete user object, preserving the token
  return {
    ...profileData,
    token: authData.token
  }
}

/**
 * AuthProvider Component
 * Manages authentication state and provides auth-related functions
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  // Initialize user data from localStorage on app load
  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    setLoading(false)
  }, [])

  /**
   * Logs in a user with email and password
   * @param {string} email - User's email
   * @param {string} password - User's password
   * @returns {Object} User data including token
   */
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true)
      const userData = await loginService(email, password)
      setCurrentUser(userData)
      toast.success('Login successful!')
      return userData
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Registers a new user
   * @param {Object} userData - User registration data
   * @returns {Object} Created user data including token
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true)
      const user = await registerService(userData)
      setCurrentUser(user)
      toast.success('Registration successful!')
      return user
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Logs out the current user
   * Clears local storage and redirects to login
   */
  const logout = useCallback(() => {
    logoutService()
    setCurrentUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }, [navigate])

  /**
   * Fetches the user's complete profile data and merges it with auth data
   * Ensures the auth token is preserved when updating user state
   * @returns {Object} Complete user profile with token
   */
  const getUserProfile = useCallback(async () => {
    try {
      setLoading(true)
      const fullProfileData = await getUserProfileService()

      // Merge profile data with authentication data (preserving token)
      const completeUser = mergeWithAuthData(fullProfileData)

      // Update state and localStorage
      setCurrentUser(completeUser)
      localStorage.setItem('user', JSON.stringify(completeUser))

      return completeUser
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch profile'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Updates the user's profile and preserves auth token
   * @param {Object} profileData - Updated profile data
   * @returns {Object} Updated user profile with token
   */
  const updateUserProfile = useCallback(async (profileData) => {
    try {
      setLoading(true)
      const updatedProfileData = await updateUserProfileService(profileData)

      // Merge updated profile with authentication data (preserving token)
      const completeUser = mergeWithAuthData(updatedProfileData)

      // Update state and localStorage
      setCurrentUser(completeUser)
      localStorage.setItem('user', JSON.stringify(completeUser))

      toast.success('Profile updated successfully!')
      return completeUser
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to update profile'
      toast.error(message)
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  // Prepare context value with all auth-related state and functions
  const value = {
    currentUser,
    login,
    register,
    logout,
    getUserProfile,
    updateUserProfile,
    isAuthenticated: !!currentUser,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Custom hook to use the auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
