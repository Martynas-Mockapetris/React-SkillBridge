import { motion } from 'framer-motion'
import { FaCheck } from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'

const PricingSection = () => {
  const pricingData = [
    {
      title: 'Basic',
      price: 'Free',
      description: 'Perfect for exploring the platform',
      features: ['Browse projects/freelancers', 'Basic profile creation', 'Limited project posts', 'Community access'],
      users: '8.4k'
    },
    {
      title: 'Creator Premium',
      price: '€19.99',
      description: 'Perfect for businesses and startups',
      features: ['Unlimited project posts', 'Priority project listing', 'Advanced search filters', 'Direct messaging', 'Verified badge'],
      users: '1.2k'
    },
    {
      title: 'Freelancer Premium',
      price: '€19.99',
      description: 'Perfect for professional freelancers',
      features: ['Featured profile listing', 'Proposal prioritization', 'Skills verification badge', 'Analytics dashboard', 'Client reviews system'],
      users: '0.8k'
    },
    {
      title: 'Full Package',
      price: '€29.99',
      description: 'Perfect for agencies and growing freelancers',
      features: ['All Creator Premium features', 'All Freelancer Premium features', 'Team management tools', 'Multiple project handling', 'Collaboration tools'],
      users: '0.5k'
    }
  ]

  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Vidutiniai patternai */}
        <div className='absolute -left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute -right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>

        {/* Mazi */}
        <div className='absolute left-1/4 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/3 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      {/* Sekcijos antraste */}
      <div className='container mx-auto px-4 relative z-10'>
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>Flexible</span>
            <span className='text-accent'> Pricing</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Choose the perfect plan that suits your needs and budget</p>
        </motion.div>

        {/* Planai */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4 max-w-8xl mx-auto'>
          {pricingData.map((plan, index) => (
            <motion.div
              key={index}
              className={`bg-gradient-to-br from-light/10 via-light/5 to-transparent
                 p-10 rounded-lg flex flex-col
                 relative isolate overflow-hidden shadow-lg 
                 ${plan.title === 'Full Package' ? 'shadow-lg hover:shadow-accent/10' : ''}`}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{
                opacity: 1,
                y: 0,
                transition: {
                  type: 'spring',
                  duration: 0.8,
                  delay: index * 0.1,
                  bounce: 0.3
                }
              }}
              whileHover={{
                scale: 1.02,
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                transition: {
                  type: 'tween',
                  duration: 0.2,
                  ease: 'easeOut'
                }
              }}
              viewport={{ once: true, margin: '-50px' }}>
              {/* Rekomenduojamas planas */}
              {plan.title === 'Full Package' && (
                <motion.div className='absolute top-5 right-5' initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5, type: 'spring', stiffness: 100 }}>
                  <motion.span
                    className='bg-accent/20 text-accent text-sm py-1 px-3 rounded-full inline-block'
                    animate={{
                      scale: [1, 1.05, 1],
                      opacity: [1, 0.8, 1]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}>
                    Recommended
                  </motion.span>
                </motion.div>
              )}

              <div className='mb-10'>
                <h3 className='text-light text-2xl font-bold mb-6'>{plan.title}</h3>
                <div className='flex items-baseline gap-2 mb-4'>
                  <div className='text-accent text-4xl font-bold'>{plan.price}</div>
                  {plan.price !== 'Free' && <div className='text-light/40 text-lg'>/ month</div>}
                </div>
                <div className='flex items-center gap-2 mb-4'>
                  <motion.div className='text-light/40 text-sm' initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.6 + index * 0.1 }}>
                    <span className='text-accent font-medium'>{plan.users}</span> active users
                  </motion.div>
                </div>
                <p className='text-light/60'>{plan.description}</p>
              </div>

              <ul className='text-light/80 space-y-5 mb-10 flex-grow'>
                {plan.features.map((feature, idx) => (
                  <motion.li key={idx} className='flex items-center gap-3' initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: index * 0.1 + idx * 0.1 }}>
                    <motion.div
                      whileHover={{
                        scale: 1.2,
                        color: 'rgb(var(--accent))',
                        transition: { duration: 0.2 }
                      }}>
                      <FaCheck className='text-accent flex-shrink-0' />
                    </motion.div>
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Pirkimo mygtukas */}
              <motion.button
                className='w-full py-4 px-6 rounded-lg border-2 border-accent
                   text-accent font-medium 
                   transition-all duration-300
                   hover:bg-accent hover:text-primary'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                Get Started
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
