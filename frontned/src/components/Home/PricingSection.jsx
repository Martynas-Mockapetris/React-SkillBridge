const PricingSection = () => {
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

        {/* Pricing Cards Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <div className='bg-light/5 p-8 rounded-lg'>
            <h3 className='text-light text-2xl font-bold'>Basic</h3>
          </div>
          <div className='bg-light/5 p-8 rounded-lg'>
            <h3 className='text-light text-2xl font-bold'>Creator Premium</h3>
          </div>
          <div className='bg-light/5 p-8 rounded-lg'>
            <h3 className='text-light text-2xl font-bold'>Freelancer Premium</h3>
          </div>
          <div className='bg-light/5 p-8 rounded-lg'>
            <h3 className='text-light text-2xl font-bold'>Full Package</h3>
          </div>
        </div>
      </div>
    </section>
  )
}

export default PricingSection
