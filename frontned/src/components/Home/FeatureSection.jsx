const FeaturesSection = () => {
  return (
    <section className='py-20 bg-primary'>
      <div className='container mx-auto px-4'>
        {/* Section Header */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>Why Choose</span>
            <span className='text-accent'> SkillBridge</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto'>Discover the advantages that make SkillBridge the preferred platform for connecting talent with opportunities</p>
        </div>

        {/* Features Grid */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>{/* Feature cards will go here */}</div>
      </div>
    </section>
  )
}

export default FeaturesSection
