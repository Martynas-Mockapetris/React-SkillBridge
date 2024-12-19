import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HiMenu, HiX } from 'react-icons/hi'
import MolecularPatterns from '../shared/MolecularPatterns'

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className='fixed w-full bg-primary p-4 z-50'>
      <div className='container mx-auto flex justify-between items-center'>
        {/* Logo ir pavadinimas */}
        <Link to='/' className='flex items-center space-x-2'>
          <span className='text-xl font-heading font-bold'>
            <span className='text-light'>Skill</span>
            <span className='text-accent'>Bridge</span>
          </span>
          <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
        </Link>

        {/* Hamburger mygtukas */}
        <button className='lg:hidden text-light text-2xl z-50' onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <HiX /> : <HiMenu />}
        </button>

        {/* Desktopo menu */}
        <div className='hidden lg:flex space-x-6'>
          <Link to='/listings' className='text-light relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full'>
            Listings
          </Link>
          <Link to='/profile' className='text-light relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full'>
            Profile
          </Link>
          <Link to='/admin' className='text-light relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full'>
            Admin
          </Link>
          <Link to='/login' className='text-light relative after:absolute after:bottom-[-4px] after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full'>
            Login
          </Link>
          <Link to='/register' className='text-accent font-semibold transition-colors duration-300 hover:opacity-80'>
            Register
          </Link>
        </div>

        {/* Mobilaus menu overlay */}
        <div className={`lg:hidden fixed inset-0 bg-primary transition-all duration-500 ease-in-out ${isOpen ? 'opacity-100 visible translate-x-0' : 'opacity-0 invisible translate-x-full'}`}>
          <MolecularPatterns />

          <div className='flex flex-col items-center justify-center h-screen space-y-8 relative z-20'>
            <Link to='/listings' className='text-2xl text-light hover:text-accent transition-colors'>
              Listings
            </Link>
            <Link to='/profile' className='text-2xl text-light hover:text-accent transition-colors'>
              Profile
            </Link>
            <Link to='/admin' className='text-2xl text-light hover:text-accent transition-colors'>
              Admin
            </Link>
            <Link to='/login' className='text-2xl text-light hover:text-accent transition-colors'>
              Login
            </Link>
            <Link to='/register' className='text-2xl text-accent font-semibold hover:opacity-80'>
              Register
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation
