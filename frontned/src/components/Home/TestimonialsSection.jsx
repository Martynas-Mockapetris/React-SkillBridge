const TestimonialsSection = () => {
  return (
    <section className='w-full py-20 bg-primary overflow-hidden'>
      <div className='container mx-auto px-4 relative z-10'>
        {/* Sekcijos antraste */}
        <div className='text-center mb-16'>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>What Our</span>
            <span className='text-accent'> Clients Say</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Discover how our platform has transformed businesses and careers through real success stories</p>
        </div>

        {/* Atsiliepimu gridas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {/* Laikinos korteles */}
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className='bg-light/5 p-6 rounded-lg min-h-[200px] flex items-center justify-center'>
              <span className='text-light/50'>Testimonial Card {item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
