import { motion } from 'framer-motion'
import molecularPattern from '../assets/molecular-pattern.svg'

const Register = () => {
  return (
    <section className='w-full py-20 theme-bg relative z-[1]'>
      {/* Background patterns */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        {/* Large pattern */}
        <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[550px] h-[550px] rotate-[25deg]' />
        </div>
        {/* Medium patterns */}
        <div className='absolute -left-20 top-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute right-0 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        {/* Small patterns */}
        <div className='absolute left-1/4 top-0 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/4 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Section header */}
        <div className='text-center mb-10'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>Create Your</span>
            <span className='text-accent'> Account</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto'>Join SkillBridge and unlock your full potential</p>
        </div>

        {/* Form Container */}
        <div className='max-w-md md:max-w-6xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-lg p-8'>
            <form className='space-y-6'>
              {/* First and Last Name in one row on desktop */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div>
                  <label className='block mb-2 theme-text font-medium'>First Name</label>
                  <input type='text' name='firstName' className='w-full p-3 border dark:border-light/10 border-primary/10 rounded-lg bg-transparent theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>

                <div>
                  <label className='block mb-2 theme-text font-medium'>Last Name</label>
                  <input type='text' name='lastName' className='w-full p-3 border dark:border-light/10 border-primary/10 rounded-lg bg-transparent theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>
              </div>

              {/* Email field - full width */}
              <div>
                <label className='block mb-2 theme-text font-medium'>Email Address</label>
                <input type='email' name='email' className='w-full p-3 border dark:border-light/10 border-primary/10 rounded-lg bg-transparent theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
              </div>

              {/* Password and Confirm Password in one row on desktop */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
                <div>
                  <label className='block mb-2 theme-text font-medium'>Password</label>
                  <input type='password' name='password' className='w-full p-3 border dark:border-light/10 border-primary/10 rounded-lg bg-transparent theme-text focus:outline-none focus:ring-2 focus:ring-accent' />
                </div>

                <div>
                  <label className='block mb-2 theme-text font-medium'>Confirm Password</label>
                  <input
                    type='password'
                    name='confirmPassword'
                    className='w-full p-3 border dark:border-light/10 border-primary/10 rounded-lg bg-transparent theme-text focus:outline-none focus:ring-2 focus:ring-accent'
                  />
                </div>
              </div>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type='submit' className='w-full p-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all font-medium'>
                Register
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default Register
