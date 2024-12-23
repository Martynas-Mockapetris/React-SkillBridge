import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import MolecularPatterns from '../shared/MolecularPatterns'
import ThemeToggle from './ThemeToggle'
import { useTheme } from '../../context/ThemeContext'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { isDarkMode } = useTheme()

  return (
    <nav className={`fixed w-full p-4 z-50 transition-all duration-300 ${isDarkMode ? 'bg-primary' : 'bg-light'}`}>
      <div className='container mx-auto flex justify-between items-center'>
        {/* Logo ir pavadinimas */}
        <Link to='/' className='flex items-center space-x-2'>
          <span className='text-xl font-heading font-bold'>
            <span className={isDarkMode ? 'text-light' : 'text-primary'}>Skill</span>
            <span className='text-accent'>Bridge</span>
          </span>
          <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
        </Link>

        {/* Hamburger mygtukas */}
        <button className={`lg:hidden text-2xl z-50 ${isDarkMode ? 'text-light' : 'text-primary'}`} onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Desktopo menu */}
        <div className='hidden lg:flex items-center space-x-6'>
          <Link
            to='/listings'
            className={`relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
              isDarkMode ? 'text-light' : 'text-primary'
            }`}>
            Listings
          </Link>
          <Link
            to='/profile'
            className={`relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
              isDarkMode ? 'text-light' : 'text-primary'
            }`}>
            Profile
          </Link>
          <Link
            to='/admin'
            className={`relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
              isDarkMode ? 'text-light' : 'text-primary'
            }`}>
            Admin
          </Link>
          <Link
            to='/login'
            className={`relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
              isDarkMode ? 'text-light' : 'text-primary'
            }`}>
            Login
          </Link>
          <Link to='/register' className='text-accent font-semibold transition-colors duration-300 hover:opacity-80'>
            Register
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobilaus menu overlay */}
        <div
          className={`lg:hidden fixed inset-0 transition-all duration-500 ease-in-out ${isDarkMode ? 'bg-primary' : 'bg-light'} ${isOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-full'}`}>
          <MolecularPatterns />

          <div className='flex flex-col items-center justify-center h-screen space-y-8 relative z-20'>
            <Link to='/listings' className={`text-2xl hover:text-accent transition-colors ${isDarkMode ? 'text-light' : 'text-primary'}`}>
              Listings
            </Link>
            <Link to='/profile' className={`text-2xl hover:text-accent transition-colors ${isDarkMode ? 'text-light' : 'text-primary'}`}>
              Profile
            </Link>
            <Link to='/admin' className={`text-2xl hover:text-accent transition-colors ${isDarkMode ? 'text-light' : 'text-primary'}`}>
              Admin
            </Link>
            <Link to='/login' className={`text-2xl hover:text-accent transition-colors ${isDarkMode ? 'text-light' : 'text-primary'}`}>
              Login
            </Link>
            <Link to='/register' className='text-2xl text-accent font-semibold hover:opacity-80'>
              Register
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
