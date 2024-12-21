import { FaCheck } from 'react-icons/fa'

const PricingSection = () => {
  const pricingData = [
    {
      title: 'Basic',
      price: 'Free',
      description: 'Perfect for exploring the platform',
      features: ['Browse projects/freelancers', 'Basic profile creation', 'Limited project posts', 'Community access']
    },
    {
      title: 'Creator Premium',
      price: '€19.99',
      description: 'Perfect for businesses and startups',
      features: ['Unlimited project posts', 'Priority project listing', 'Advanced search filters', 'Direct messaging', 'Verified badge']
    },
    {
      title: 'Freelancer Premium',
      price: '€19.99',
      description: 'Perfect for professional freelancers',
      features: ['Featured profile listing', 'Proposal prioritization', 'Skills verification badge', 'Analytics dashboard', 'Client reviews system']
    },
    {
      title: 'Full Package',
      price: '€29.99',
      description: 'Perfect for agencies and growing freelancers',
      features: ['All Creator Premium features', 'All Freelancer Premium features', 'Team management tools', 'Multiple project handling', 'Collaboration tools']
    }
  ]

  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
      <div className='container mx-auto px-4 relative z-10'>
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>Flexible</span>
            <span className='text-accent'> Pricing</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Choose the perfect plan that suits your needs and budget</p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          {pricingData.map((plan, index) => (
            <div
              key={index}
              className='bg-light/5 p-8 rounded-lg flex flex-col
                          transition-all duration-300 hover:bg-light/10'>
              <div className='mb-8'>
                <h3 className='text-light text-2xl font-bold mb-4'>{plan.title}</h3>
                <div className='text-accent text-3xl font-bold mb-2'>{plan.price}</div>
                <p className='text-light/60'>{plan.description}</p>
              </div>

              <ul className='text-light/80 space-y-4 mb-8 flex-grow'>
                {plan.features.map((feature, idx) => (
                  <li key={idx} className='flex items-center gap-3'>
                    <FaCheck className='text-accent flex-shrink-0' />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className='w-full py-3 px-6 rounded-lg border-2 border-accent
                               text-accent font-medium transition-all duration-300
                               hover:bg-accent hover:text-primary'>
                Get Started
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default PricingSection
