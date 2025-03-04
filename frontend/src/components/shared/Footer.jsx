import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const linkStyles = 'theme-text-secondary hover:text-accent transition-colors duration-300'
  const headingStyles = 'font-heading font-semibold theme-text'

  return (
    <footer className='p-8 theme-bg transition-colors duration-300'>
      <div className='container mx-auto'>
        {/* Mobile Layout */}
        <div className='lg:hidden'>
          <div className='grid grid-cols-2 gap-8 mb-8 text-center'>
            {/* Menu Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className={headingStyles}>Menu</h3>
              <Link to='/listings' className={linkStyles}>
                Listings
              </Link>
              <Link to='/profile' className={linkStyles}>
                Profile
              </Link>
              <Link to='/admin' className={linkStyles}>
                Admin
              </Link>
            </div>

            {/* Quick Links */}
            <div className='flex flex-col items-center space-y-4'>
              <h3 className={headingStyles}>Quick Links</h3>
              <Link to='/login' className={linkStyles}>
                Login
              </Link>
              <Link to='/register' className={linkStyles}>
                Register
              </Link>
              <Link to='/contact' className={linkStyles}>
                Contact
              </Link>
            </div>
          </div>

          {/* Brand and Social - Mobile */}
          <div className='theme-border-top pt-8'>
            <div className='flex flex-col items-center space-y-4'>
              <div className='flex items-center space-x-2'>
                <span className='text-xl font-heading font-bold'>
                  <span className='theme-text'>Skill</span>
                  <span className='text-accent'>Bridge</span>
                </span>
                <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
              </div>
              <p className='theme-text-secondary text-center'>Connecting talented professionals with amazing opportunities.</p>
              <div className='flex space-x-4'>
                <a href='#' className={linkStyles}>
                  <FaTwitter size={20} />
                </a>
                <a href='#' className={linkStyles}>
                  <FaLinkedin size={20} />
                </a>
                <a href='#' className={linkStyles}>
                  <FaGithub size={20} />
                </a>
              </div>
              <p className='theme-text-muted text-sm'>© {currentYear} SkillBridge. All rights reserved.</p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className='hidden lg:grid grid-cols-4 gap-8'>
          {/* Brand and Copyright */}
          <div className='col-span-2 flex flex-col space-y-4'>
            <div className='flex items-center space-x-2'>
              <span className='text-xl font-heading font-bold'>
                <span className='theme-text'>Skill</span>
                <span className='text-accent'>Bridge</span>
              </span>
              <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
            </div>
            <p className='theme-text-secondary'>Connecting talented professionals with amazing opportunities.</p>
            <div className='flex space-x-4 pt-2'>
              <a href='#' className={linkStyles}>
                <FaTwitter size={20} />
              </a>
              <a href='#' className={linkStyles}>
                <FaLinkedin size={20} />
              </a>
              <a href='#' className={linkStyles}>
                <FaGithub size={20} />
              </a>
            </div>
            <p className='theme-text-muted text-sm pt-4'>© {currentYear} SkillBridge. All rights reserved.</p>
          </div>

          {/* Menu Column */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className={headingStyles}>Menu</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/listings' className={linkStyles}>
                Listings
              </Link>
              <Link to='/profile' className={linkStyles}>
                Profile
              </Link>
              <Link to='/admin' className={linkStyles}>
                Admin
              </Link>
              <Link to='/login' className={linkStyles}>
                Login
              </Link>
              <Link to='/register' className={linkStyles}>
                Register
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div className='flex flex-col items-center space-y-4'>
            <h3 className={headingStyles}>Quick Links</h3>
            <div className='flex flex-col items-center space-y-2'>
              <Link to='/about' className={linkStyles}>
                About Us
              </Link>
              <Link to='/contact' className={linkStyles}>
                Contact
              </Link>
              <Link to='/privacy' className={linkStyles}>
                Privacy Policy
              </Link>
              <Link to='/terms' className={linkStyles}>
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
