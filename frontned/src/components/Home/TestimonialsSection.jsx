import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaQuoteLeft, FaStarHalfAlt, FaStar, FaRegStar } from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'

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
      image: 'https://i.pravatar.cc/150?img=1',
      projectDetails: {
        category: 'Web Development',
        duration: '3 months',
        completedDate: 'June 2023'
      },
      extendedContent: 'The collaboration tools and project management features made the development process smooth and efficient. Communication was seamless, and the final result exceeded my expectations.'
    },
    {
      id: 2,
      name: 'Michael Chen',
      rating: 4,
      role: 'Freelance Developer',
      expertise: 'Full-Stack Development',
      content: 'As a freelancer, I love how easy it is to find interesting projects that match my skills. The platform helps me connect with serious clients.',
      image: 'https://i.pravatar.cc/150?img=8',
      projectDetails: {
        category: 'Mobile Development',
        duration: '5 months',
        completedDate: 'August 2023'
      },
      extendedContent: "The developer's expertise in React Native and attention to detail resulted in a polished, user-friendly app that our customers love."
    },
    {
      id: 3,
      name: 'Sarah Johnson',
      rating: 5,
      role: 'Project Owner',
      projectType: 'Mobile App Development',
      content: 'Posted my app project and received proposals from skilled developers within days. The collaboration tools made the whole process smooth.',
      image: 'https://i.pravatar.cc/150?img=5',
      projectDetails: {
        category: 'Digital Marketing',
        duration: '4 months',
        completedDate: 'July 2023'
      },
      extendedContent: 'The marketing team provided innovative strategies and maintained transparent communication throughout the campaign duration.'
    },
    {
      id: 4,
      name: 'David Rodriguez',
      rating: 4.5,
      role: 'Freelance Designer',
      expertise: 'UI/UX Design',
      content: 'The platform connects me with clients who value quality design. The project matching system is spot on with my expertise.',
      image: 'https://i.pravatar.cc/150?img=12',
      projectDetails: {
        category: 'System Design',
        duration: '6 months',
        completedDate: 'September 2023'
      },
      extendedContent: "The expertise and professionalism of the talent we found through SkillBridge significantly contributed to our project's success."
    },
    {
      id: 5,
      name: 'Lisa Chang',
      rating: 5,
      role: 'Project Owner',
      projectType: 'Brand Identity Design',
      content: 'Within a week, I found an amazing designer who perfectly understood my brand vision. The collaboration features made communication effortless.',
      image: 'https://i.pravatar.cc/150?img=9',
      projectDetails: {
        category: 'Brand Design',
        duration: '2 months',
        completedDate: 'May 2023'
      },
      extendedContent: "The designer's creative approach and understanding of our vision resulted in a brand identity that truly resonates with our audience."
    }
  ]

  // Reitingas
  const Rating = ({ rating, className }) => {
    return (
      <div className={`flex gap-1 ${className}`}>
        {[...Array(5)].map((_, index) => {
          const starValue = index + 1
          return <span key={index}>{rating >= starValue ? <FaStar className='text-accent' /> : rating >= starValue - 0.5 ? <FaStarHalfAlt className='text-accent' /> : <FaRegStar className='text-accent/50' />}</span>
        })}
      </div>
    )
  }

  return (
    <section className='w-full py-20 bg-primary overflow-hidden relative'>
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
              <motion.div
                className='bg-light/5 p-6 rounded-lg cursor-pointer
             transition-all duration-300 hover:bg-light/10 
             hover:shadow-lg hover:-translate-y-1'
                onClick={() => toggleExpand(testimonial.id)}>
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

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='mb-6'>
                      <p className='text-light/90 mb-4'>{testimonial.content}</p>
                      <p className='text-light/80'>{testimonial.extendedContent}</p>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className='grid grid-cols-4 gap-4 pt-4 border-t border-light/10'>
                      <div className='col-span-2'>
                        <p className='text-accent text-sm'>Category</p>
                        <p className='text-light text-sm'>{testimonial.projectDetails.category}</p>
                      </div>
                      <div>
                        <p className='text-accent text-sm'>Duration</p>
                        <p className='text-light text-sm'>{testimonial.projectDetails.duration}</p>
                      </div>
                      <div>
                        <p className='text-accent text-sm'>Completed</p>
                        <p className='text-light text-sm'>{testimonial.projectDetails.completedDate}</p>
                      </div>
                    </motion.div>
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
