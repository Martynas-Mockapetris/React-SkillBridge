import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-primary p-8'>
      <div className='container mx-auto'>
        {/* Mobile Layout */}
        <div className='lg:hidden'>
          <div className='grid grid-cols-2 gap-8 mb-8 text-center'>
            {/* Menu Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className='text-light font-heading font-semibold'>Menu</h3>
              <Link to='/listings' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Listings
              </Link>
              <Link to='/profile' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Profile
              </Link>
              <Link to='/admin' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Admin
              </Link>
            </div>
            {/* Quick Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className='text-light font-heading font-semibold'>Quick Links</h3>
              <Link to='/login' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Login
              </Link>
              <Link to='/register' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Register
              </Link>
              <Link to='/contact' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Contact
              </Link>
            </div>
          </div>

          {/* Brand and Social - Mobile */}
          <div className='border-t border-light/10 pt-8'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-xl font-heading font-bold'>
                  <span className='text-light'>Skill</span>
                  <span className='text-accent'>Bridge</span>
                </span>
                <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
              </div>
              <p className='text-light/80 text-center'>Connecting talented professionals with amazing opportunities.</p>
              <div className='flex space-x-4'>
                <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                  <FaTwitter size={20} />
                </a>
                <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                  <FaLinkedin size={20} />
                </a>
                <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                  <FaGithub size={20} />
                </a>
              </div>
              <p className='text-light/60 text-sm'>© {currentYear} SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden lg:grid grid-cols-4 gap-8'>
          {/* Copyright ir Brandingas */}
          <div className='col-span-2 flex flex-col space-y-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-xl font-heading font-bold'>
                <span className='text-light'>Skill</span>
                <span className='text-accent'>Bridge</span>
              </span>
              <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
            </div>
            <p className='text-light/80'>Connecting talented professionals with amazing opportunities.</p>
            <div className='flex space-x-4 pt-2'>
              <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                <FaTwitter size={20} />
              </a>
              <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                <FaLinkedin size={20} />
              </a>
              <a href='#' className='text-light/80 hover:text-accent transition-colors duration-300'>
                <FaGithub size={20} />
              </a>
            </div>
            <p className='text-light/60 text-sm pt-4'>© {currentYear} SkillBridge. All rights reserved.</p>
          </div>

          {/* Meniu stulpelis */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className='text-light font-heading font-semibold'>Menu</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/listings' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Listings
              </Link>
              <Link to='/profile' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Profile
              </Link>
              <Link to='/admin' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Admin
              </Link>
              <Link to='/login' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Login
              </Link>
              <Link to='/register' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Register
              </Link>
            </div>
          </div>

          {/* Kitos nuorodos */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className='text-light font-heading font-semibold'>Quick Links</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/about' className='text-light/80 hover:text-accent transition-colors duration-300'>
                About Us
              </Link>
              <Link to='/contact' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Contact
              </Link>
              <Link to='/privacy' className='text-light/80 hover:text-accent transition-colors duration-300'>
                Privacy Policy
              </Link>
              <Link to='/terms' className='text-light/80 hover:text-accent transition-colors duration-300'>
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
