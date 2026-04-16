import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'
import { hasAdminPanelAccess } from '../../utils/accessRoles'

const AdminRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner fullScreen />
  }

  // Redirect to home if not authenticated or has no admin panel access
  if (!currentUser || !hasAdminPanelAccess(currentUser)) {
    return <Navigate to='/' />
  }

  // Render children if authenticated and allowed into admin panel
  return children
}

export default AdminRoute