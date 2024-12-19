import { FaTwitter, FaLinkedin, FaGithub } from 'react-icons/fa'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-primary p-8'>
      <div className='container mx-auto grid grid-cols-4 gap-8'>
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
        <div className='flex flex-col space-y-4'>
          <h3 className='text-light font-heading font-semibold'>Menu</h3>
          <div className='flex flex-col space-y-2'>
            <a href='/listings' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Listings
            </a>
            <a href='/profile' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Profile
            </a>
            <a href='/admin' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Admin
            </a>
            <a href='/login' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Login
            </a>
            <a href='/register' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Register
            </a>
          </div>
        </div>

        {/* Kitos nuorodos */}
        <div className='flex flex-col space-y-4'>
          <h3 className='text-light font-heading font-semibold'>Quick Links</h3>
          <div className='flex flex-col space-y-2'>
            <a href='/about' className='text-light/80 hover:text-accent transition-colors duration-300'>
              About Us
            </a>
            <a href='/contact' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Contact
            </a>
            <a href='/privacy' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Privacy Policy
            </a>
            <a href='/terms' className='text-light/80 hover:text-accent transition-colors duration-300'>
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
