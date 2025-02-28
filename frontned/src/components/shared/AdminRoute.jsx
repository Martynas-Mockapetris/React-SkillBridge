import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { currentUser, isLoading } = useAuth()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className='flex items-center justify-center min-h-screen'>
        <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
      </div>
    )
  }

  // Redirect to home if not authenticated or not admin
  if (!currentUser || currentUser.userType !== 'admin') {
    return <Navigate to='/' />
  }

  // Render children if authenticated and admin
  return children
}

export default AdminRoute
