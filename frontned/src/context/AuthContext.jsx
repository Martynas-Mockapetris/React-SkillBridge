import { createContext, useState, useEffect, useContext } from 'react'
import { getCurrentUser, login as loginService, logout as logoutService, register as registerService } from '../services/authService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if user is logged in on initial load
    const user = getCurrentUser()
    setCurrentUser(user)
    setLoading(false)
  }, [])

  const login = async (email, password) => {
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
  }

  const register = async (userData) => {
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
  }

  const logout = () => {
    logoutService()
    setCurrentUser(null)
    toast.success('Logged out successfully')
    navigate('/login')
  }

  const value = {
    currentUser,
    login,
    register,
    logout,
    isAuthenticated: !!currentUser,
    loading
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
