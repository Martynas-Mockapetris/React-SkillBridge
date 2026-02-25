import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

const AdminRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Redirect to home if not authenticated or not admin
  if (!currentUser || currentUser.userType !== 'admin') {
    return <Navigate to='/' />
  }

  // Render children if authenticated and admin
  return children
}

export default AdminRoute
