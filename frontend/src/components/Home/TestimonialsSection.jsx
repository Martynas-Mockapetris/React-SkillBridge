import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaQuoteLeft, FaStarHalfAlt, FaStar, FaRegStar } from 'react-icons/fa'
import molecularPattern from '../../assets/molecular-pattern.svg'
import { DEFAULT_TESTIMONIALS, DEFAULT_TESTIMONIALS_LAYOUT } from '../../constants/homePageData'
import { getSectionBackgroundClass, getSectionSpacingClass } from './homeSectionLayout'

const TestimonialsSection = ({ content = {}, layout = {} }) => {
  const [expandedId, setExpandedId] = useState(null)

  const testimonialsTitleLead = content.testimonialsTitleLead || 'What Our'
  const testimonialsTitleAccent = content.testimonialsTitleAccent || 'Clients Say'
  const testimonialsSubtitle = content.testimonialsSubtitle || 'Discover how our platform has transformed businesses and careers through real success stories'
  const sectionSpacingClass = getSectionSpacingClass(layout.spacing || {})
  const sectionBackgroundClass = getSectionBackgroundClass(layout.background || 'default')
  const testimonialsLayout = { ...DEFAULT_TESTIMONIALS_LAYOUT, ...layout }
  const visibleCount = Math.max(1, Number(testimonialsLayout.visibleCount) || DEFAULT_TESTIMONIALS_LAYOUT.visibleCount)

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const testimonialData = useMemo(() => {
    const configured = Array.isArray(content.testimonials) ? content.testimonials : []
    const source = configured.length ? [...configured, ...DEFAULT_TESTIMONIALS.slice(configured.length)] : DEFAULT_TESTIMONIALS

    return source.map((item, index) => ({
      id: index + 1,
      name: item.name || 'Anonymous',
      rating: typeof item.rating === 'number' ? Math.min(5, Math.max(1, item.rating)) : 5,
      role: item.role || '',
      content: item.content || '',
      image: `https://i.pravatar.cc/150?u=${encodeURIComponent(item.avatarSeed || item.name || `testimonial-${index + 1}`)}`
    }))
  }, [content.testimonials])

  const visibleTestimonials = testimonialData.slice(0, visibleCount)

  const gridClass =
    visibleCount <= 3
      ? 'grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto relative'
      : visibleCount <= 6
        ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 relative'
        : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative'

  const cardClass =
    testimonialsLayout.cardStyle === 'panel'
      ? 'theme-bg p-6 rounded-xl border border-accent/15 cursor-pointer shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl'
      : testimonialsLayout.cardStyle === 'minimal'
        ? 'bg-transparent p-6 rounded-lg border border-primary/10 dark:border-light/10 cursor-pointer transition-all duration-300 hover:border-accent/30 hover:-translate-y-1'
        : 'bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent p-6 rounded-lg cursor-pointer backdrop-blur-sm transition-all duration-300 dark:hover:bg-light/10 hover:bg-primary/10 hover:shadow-lg hover:-translate-y-1'

  const expandedCardClass =
    testimonialsLayout.cardStyle === 'panel'
      ? 'absolute top-0 left-0 right-0 theme-bg p-8 rounded-xl border border-accent/20 shadow-xl backdrop-blur-sm z-50 transform-origin-center cursor-pointer'
      : testimonialsLayout.cardStyle === 'minimal'
        ? 'absolute top-0 left-0 right-0 bg-white/95 dark:bg-primary/95 p-8 rounded-xl border border-accent/20 shadow-xl backdrop-blur-sm z-50 transform-origin-center cursor-pointer'
        : 'absolute top-0 left-0 right-0 theme-bg/55 p-8 rounded-lg shadow-xl backdrop-blur-sm z-50 transform-origin-center cursor-pointer'

  const headingWrapClass =
    testimonialsLayout.sectionEmphasis === 'editorial' ? 'text-center mb-20 max-w-4xl mx-auto' : testimonialsLayout.sectionEmphasis === 'featured' ? 'text-center mb-18 max-w-3xl mx-auto' : 'text-center mb-16'

  const quoteIconClass = testimonialsLayout.sectionEmphasis === 'featured' ? 'text-accent/30 text-5xl absolute top-4 right-4' : 'text-accent/20 text-4xl absolute top-4 right-4'

  {/* Rating component */}
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
    <section className={`w-full ${sectionSpacingClass} ${sectionBackgroundClass} relative`}>
      {/* Molecular Patterns Background */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-60deg]' />
        </div>

        {/* Mazi */}
        <div className='absolute left-2/4 top-20 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/3 top-2/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

    
      <div className='container mx-auto px-4 relative z-10'>
        <div className={headingWrapClass}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>{testimonialsTitleLead}</span>
            <span className='text-accent'> {testimonialsTitleAccent}</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto mb-12'>{testimonialsSubtitle}</p>
        </div>

        <div className={gridClass}>
          {expandedId && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className='fixed inset-0 z-40' onClick={() => toggleExpand(null)} />}

          {visibleTestimonials.map((testimonial) => (
            <div key={testimonial.id} className='relative'>
              <motion.div className={cardClass} onClick={() => toggleExpand(testimonial.id)}>
                <FaQuoteLeft className={quoteIconClass} />
                <div className='flex items-center gap-4 mb-4'>
                  <img src={testimonial.image} alt={testimonial.name} className='w-12 h-12 rounded-full object-cover' />
                  <div>
                    <h3 className='theme-text font-medium'>{testimonial.name}</h3>
                    <Rating rating={testimonial.rating} className='text-sm my-1' />
                    <p className='text-accent text-sm'>{testimonial.role}</p>
                  </div>
                </div>
                <p className='theme-text-secondary line-clamp-2'>{testimonial.content}</p>
              </motion.div>

              <AnimatePresence>
                {expandedId === testimonial.id && (
                  <motion.div
                    initial={{ opacity: 0, scale: 1, y: 0 }}
                    animate={{ opacity: 1, scale: 1.2, y: -20 }}
                    exit={{ opacity: 0, scale: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => toggleExpand(null)}
                    className={expandedCardClass}>
                    <FaQuoteLeft className='text-accent/30 text-5xl absolute top-6 right-6' />
                    <div className='flex items-center gap-4 mb-6'>
                      <img src={testimonial.image} alt={testimonial.name} className='w-16 h-16 rounded-full object-cover' />
                      <div>
                        <h3 className='theme-text font-medium text-lg'>{testimonial.name}</h3>
                        <Rating rating={testimonial.rating} className='text-base my-2' />
                        <p className='text-accent text-sm'>{testimonial.role}</p>
                      </div>
                    </div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className='mb-2'>
                      <p className='theme-text'>{testimonial.content}</p>
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
