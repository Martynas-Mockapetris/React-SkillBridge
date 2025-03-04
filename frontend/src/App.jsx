import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Bendriniai
import Navigation from './components/shared/Navigation'
import Footer from './components/shared/Footer'
import { ThemeProvider } from './context/ThemeContext.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/shared/ProtectedRoute'
import AdminRoute from './components/shared/AdminRoute'

// Puslapiai
import Home from './pages/Home'
import Listings from './pages/Listings'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <ToastContainer theme='colored' />
        <Navigation />
        <Routes>
          {/* Public routes - accessible to everyone */}
          <Route path='/' element={<Home />} />
          <Route path='/listings' element={<Listings />} />
          <Route path='/login' element={<Login />} />
          <Route path='/register' element={<Register />} />

          {/* Protected routes - require authentication */}
          <Route
            path='/profile'
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - require admin role */}
          <Route
            path='/admin'
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            }
          />
        </Routes>
        <Footer />
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App
