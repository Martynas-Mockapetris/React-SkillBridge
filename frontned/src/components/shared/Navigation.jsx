import { Link } from 'react-router-dom'

const Navigation = () => {
  return (
    <nav className='bg-primary p-4'>
      <div className='container mx-auto flex justify-between items-center'>
        <Link to='/' className='flex items-center space-x-2'>
          <span className='text-xl font-heading font-bold'>
            <span className='text-light'>Skill</span>
            <span className='text-accent'>Bridge</span>
          </span>
          <img src='/logo.svg' alt='SkillBridge' className='w-8 h-8' />
        </Link>
        <div className='space-x-6'>
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
      </div>
    </nav>
  )
}

export default Navigation
