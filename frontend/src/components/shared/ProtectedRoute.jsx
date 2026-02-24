import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const ProtectedRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Redirect to login if not authenticated
  if (!currentUser) {
    return <Navigate to='/login' />
  }

  // Render children if authenticated
  return children
}

export default ProtectedRoute
