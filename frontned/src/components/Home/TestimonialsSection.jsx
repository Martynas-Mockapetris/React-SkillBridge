import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaQuoteLeft, FaStarHalfAlt, FaStar, FaRegStar } from 'react-icons/fa'

const TestimonialsSection = () => {
  const [expandedId, setExpandedId] = useState(null)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // Atsiliepimu duomenys
  const testimonialData = [
    {
      id: 1,
      name: 'Emma Wilson',
      rating: 5,
      role: 'Project Owner',
      projectType: 'E-commerce Website',
      content: 'Found the perfect developer for my online store project. The platform made it easy to review portfolios and connect with qualified freelancers.',
      image: 'https://i.pravatar.cc/150?img=1'
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 4,
      role: 'Freelance Developer',
      expertise: 'Full-Stack Development',
      content: 'As a freelancer, I love how easy it is to find interesting projects that match my skills. The platform helps me connect with serious clients.',
      image: 'https://i.pravatar.cc/150?img=8'
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      rating: 5,
      role: 'Project Owner',
      projectType: 'Mobile App Development',
      content: 'Posted my app project and received proposals from skilled developers within days. The collaboration tools made the whole process smooth.',
      image: 'https://i.pravatar.cc/150?img=5'
    },
    {
      id: 4,
      name: 'David Rodriguez',
      rating: 4.5,
      role: 'Freelance Designer',
      expertise: 'UI/UX Design',
      content: 'The platform connects me with clients who value quality design. The project matching system is spot on with my expertise.',
      image: 'https://i.pravatar.cc/150?img=12'
    },
    {
      id: 5,
      name: 'Lisa Chang',
      rating: 5,
      role: 'Project Owner',
      projectType: 'Brand Identity Design',
      content: 'Within a week, I found an amazing designer who perfectly understood my brand vision. The collaboration features made communication effortless.',
      image: 'https://i.pravatar.cc/150?img=9'
    }
  ]

  // Reitingas
  const Rating = ({ rating, className }) => {
    return (
      <div className={`flex gap-1 ${className}`}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1
          return (
          <span key={index}>
            {rating >= starValue ? <FaStar className='text-accent' /> : rating >= starValue - 0.5 ? <FaStarHalfAlt className='text-accent' /> : <FaRegStar className='text-accent/50' />}
          </span> )
        })}
      </div>
    )
  }

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

        {/* Gridas */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 [&>*:nth-last-child(-n+2)]:lg:translate-x-1/2 relative'>
          {/* Uzdarom korta bet kur spaudziant */}
          {expandedId && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className='fixed inset-0 z-40' onClick={() => toggleExpand(null)} />}

          {testimonialData.map((testimonial) => (
            <div key={testimonial.id} className='relative'>
              {/* Testimonial korta */}
              <motion.div className='bg-light/5 p-6 rounded-lg cursor-pointer' onClick={() => toggleExpand(testimonial.id)}>
                <FaQuoteLeft className='text-accent/20 text-4xl absolute top-4 right-4' />
                <div className='flex items-center gap-4 mb-4'>
                  <img src={testimonial.image} alt={testimonial.name} className='w-12 h-12 rounded-full object-cover' />
                  <div>
                    <h3 className='text-light font-medium'>{testimonial.name}</h3>
                    <Rating rating={testimonial.rating} className='text-sm my-1' />
                    <p className='text-accent text-sm'>{testimonial.role}</p>
                    <p className='text-light/60 text-sm'>{testimonial.projectType || testimonial.expertise}</p>
                  </div>
                </div>
                <p className='text-light/80 line-clamp-2'>{testimonial.content}</p>
              </motion.div>

              {/* Aktyvi korta */}
              <AnimatePresence>
                {expandedId === testimonial.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1, y: 0 }}
                    animate={{ opacity: 1, scale: 1.2, y: -20 }}
                    exit={{ opacity: 0, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleExpand(null)}
                    className='absolute top-0 left-0 right-0 bg-primary/55 p-8 rounded-lg
                    shadow-xl backdrop-blur-sm z-50 transform-origin-center cursor-pointer'>
                    <FaQuoteLeft className='text-accent/30 text-5xl absolute top-6 right-6' />
                    <div className='flex items-center gap-4 mb-6'>
                      <img src={testimonial.image} alt={testimonial.name} className='w-16 h-16 rounded-full object-cover' />
                      <div>
                        <h3 className='text-light font-medium text-lg'>{testimonial.name}</h3>
                        <Rating rating={testimonial.rating} className='text-base my-2' />
                        <p className='text-accent text-sm'>{testimonial.role}</p>
                        <p className='text-light/60 text-sm'>{testimonial.projectType || testimonial.expertise}</p>
                      </div>
                    </div>
                    <p className='text-light/90'>{testimonial.content}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
