import { motion } from 'framer-motion'

const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Create Profile',
      description: 'Set up your professional profile highlighting your skills and experience'
    },
    {
      number: '02',
      title: 'Browse Opportunities',
      description: 'Explore curated projects that match your expertise and interests'
    },
    {
      number: '03',
      title: 'Start Working',
      description: 'Connect with clients and begin your successful collaboration'
    }
  ]

  return (
    <section className='py-20 bg-primary'>
      <div className='container mx-auto px-4'>
        {/* Sekcijos antraste */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>How</span>
            <span className='text-accent'> It Works</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto'>Get started with SkillBridge in three simple steps</p>
        </div>

        {/* Zingsniai */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          {steps.map((step, index) => (
            <motion.div key={index} className='text-center' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }}>
              <div className='text-4xl font-bold text-accent mb-4'>{step.number}</div>
              <h3 className='text-xl font-semibold text-light mb-2'>{step.title}</h3>
              <p className='text-light/80'>{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
