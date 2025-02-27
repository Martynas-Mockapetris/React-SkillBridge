import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import MolecularPatterns from '../shared/MolecularPatterns'
import ThemeToggle from './ThemeToggle'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  const desktopLinkStyles = `relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] 
    after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full theme-text`

  const mobileLinkStyles = 'text-2xl hover:text-accent transition-colors theme-text'

  return (
    <nav className='fixed w-full p-4 z-50 transition-all duration-300 theme-bg'>
      <div className='container mx-auto flex justify-between items-center'>
        {/* Logo and Brand */}
        <Link to='/' className='flex items-center space-x-2'>
          <span className='text-xl font-heading font-bold'>
            <span className='theme-text'>Skill</span>
            <span className='text-accent'>Bridge</span>
          </span>
          <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
        </Link>

        {/* Hamburger Button */}
        <button className='lg:hidden text-2xl z-50 theme-text' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Desktop Menu */}
        <div className='hidden lg:flex items-center space-x-6'>
          <Link to='/listings' className={desktopLinkStyles}>
            Listings
          </Link>
          <Link to='/profile' className={desktopLinkStyles}>
            Profile
          </Link>
          <Link to='/admin' className={desktopLinkStyles}>
            Admin
          </Link>
          <Link to='/login' className={desktopLinkStyles}>
            Login
          </Link>
          <Link to='/register' className='text-accent font-semibold transition-colors duration-300 hover:opacity-80'>
            Register
          </Link>
          <ThemeToggle />
        </div>

        {/* Mobile Menu Overlay */}
        <div
          className={`lg:hidden fixed inset-0 transition-all duration-500 ease-in-out theme-bg
            ${isOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-full'}`}>
          <MolecularPatterns />

          <div className='flex flex-col items-center justify-center h-screen space-y-8 relative z-20'>
            <Link to='/listings' className={mobileLinkStyles}>
              Listings
            </Link>
            <Link to='/profile' className={mobileLinkStyles}>
              Profile
            </Link>
            <Link to='/admin' className={mobileLinkStyles}>
              Admin
            </Link>
            <Link to='/login' className={mobileLinkStyles}>
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
