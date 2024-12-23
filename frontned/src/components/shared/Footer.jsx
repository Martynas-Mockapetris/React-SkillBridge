import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode } = useTheme()

  return (
    <footer className={`p-8 transition-colors duration-300 ${isDarkMode ? 'bg-primary' : 'bg-light'}`}>
      <div className='container mx-auto'>
        {/* Mobile Layout */}
        <div className='lg:hidden'>
          <div className='grid grid-cols-2 gap-8 mb-8 text-center'>
            {/* Menu Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className={`font-heading font-semibold ${isDarkMode ? 'text-light' : 'text-primary'}`}>Menu</h3>
              <Link to='/listings' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Listings
              </Link>
              <Link to='/profile' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Profile
              </Link>
              <Link to='/admin' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Admin
              </Link>
            </div>

            {/* Quick Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className={`font-heading font-semibold ${isDarkMode ? 'text-light' : 'text-primary'}`}>Quick Links</h3>
              <Link to='/login' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Login
              </Link>
              <Link to='/register' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Register
              </Link>
              <Link to='/contact' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Contact
              </Link>
            </div>
          </div>

          {/* Brand and Social - Mobile */}
          <div className={`border-t ${isDarkMode ? 'border-light/10' : 'border-primary/10'} pt-8`}>
            <div className='flex flex-col items-center space-y-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-xl font-heading font-bold'>
                  <span className={isDarkMode ? 'text-light' : 'text-primary'}>Skill</span>
                  <span className='text-accent'>Bridge</span>
                </span>
                <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
              </div>
              <p className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} text-center`}>Connecting talented professionals with amazing opportunities.</p>
              <div className='flex space-x-4'>
                <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                  <FaTwitter size={20} />
                </a>
                <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                  <FaLinkedin size={20} />
                </a>
                <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                  <FaGithub size={20} />
                </a>
              </div>
              <p className={`${isDarkMode ? 'text-light/60' : 'text-primary/60'} text-sm`}>© {currentYear} SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden lg:grid grid-cols-4 gap-8'>
          {/* Copyright ir Brandingas */}
          <div className='col-span-2 flex flex-col space-y-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-xl font-heading font-bold'>
                <span className={isDarkMode ? 'text-light' : 'text-primary'}>Skill</span>
                <span className='text-accent'>Bridge</span>
              </span>
              <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
            </div>
            <p className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'}`}>Connecting talented professionals with amazing opportunities.</p>
            <div className='flex space-x-4 pt-2'>
              <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                <FaTwitter size={20} />
              </a>
              <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                <FaLinkedin size={20} />
              </a>
              <a href='#' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                <FaGithub size={20} />
              </a>
            </div>
            <p className={`${isDarkMode ? 'text-light/60' : 'text-primary/60'} text-sm pt-4`}>© {currentYear} SkillBridge. All rights reserved.</p>
          </div>

          {/* Meniu stulpelis */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className={`font-heading font-semibold ${isDarkMode ? 'text-light' : 'text-primary'}`}>Menu</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/listings' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Listings
              </Link>
              <Link to='/profile' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Profile
              </Link>
              <Link to='/admin' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Admin
              </Link>
              <Link to='/login' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Login
              </Link>
              <Link to='/register' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Register
              </Link>
            </div>
          </div>

          {/* Kitos nuorodos */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className={`font-heading font-semibold ${isDarkMode ? 'text-light' : 'text-primary'}`}>Quick Links</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/about' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                About Us
              </Link>
              <Link to='/contact' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Contact
              </Link>
              <Link to='/privacy' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Privacy Policy
              </Link>
              <Link to='/terms' className={`${isDarkMode ? 'text-light/80' : 'text-primary/80'} hover:text-accent transition-colors duration-300`}>
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
