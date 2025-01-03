import { Routes, Route } from 'react-router-dom'
// Bendriniai
import Navigation from './components/shared/Navigation'
import Footer from './components/shared/Footer'
import { ThemeProvider } from './context/ThemeContext.jsx'

// Puslapiai
import Home from './pages/Home'
import Listings from './pages/Listings'
import Profile from './pages/Profile'
import Admin from './pages/Admin'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <ThemeProvider>
      <Navigation />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/listings' element={<Listings />} />
        <Route path='/profile' element={<Profile />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
      </Routes>
      <Footer />
    </ThemeProvider>
  )
}

export default App
