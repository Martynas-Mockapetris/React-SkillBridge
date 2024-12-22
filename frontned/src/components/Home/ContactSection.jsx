import { useState } from 'react'
import { motion } from 'framer-motion'
import molecularPattern from '../../assets/molecular-pattern.svg'

const ContactSection = () => {
  // Formos duomenys
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  // Error
  const [errors, setErrors] = useState({})

  // Formos validacija
  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name field is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email field is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Wrong email format'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject field is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message field is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Data fields
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Formos pateikimo valdymas
  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Forma pateikta:', formData)
      // API
    }
  }

  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
      {/* Molecular patternas */}
      <div className='absolute inset-0 overflow-hidden'>
        {/* Vidutiniai patternai */}
        <div className='absolute left-60 bottom-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[450px] h-[450px] rotate-[75deg]' />
        </div>
        <div className='absolute -right-10 bottom-60 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-10deg]' />
        </div>

        {/* Mazi patternai */}
        <div className='absolute left-2/4 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[15deg]' />
        </div>
        <div className='absolute right-1/8 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/4 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        {/* Antrastes animacija */}
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='text-light'>Get In</span>
            <span className='text-accent'> Touch</span>
          </h2>
          <p className='text-light/80 max-w-2xl mx-auto mb-12'>Have a question or want to collaborate? Drop us a message, and we'll get back to you soon.</p>
        </motion.div>

        {/* Formos animacija */}
        <motion.div className='max-w-3xl mx-auto' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <form onSubmit={handleSubmit} className='bg-gradient-to-br from-light/5 via-light/[0.02] to-transparent p-8 rounded-lg backdrop-blur-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <label className='block text-light/90 text-sm font-medium mb-2'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    transition-all duration-300
                    focus:bg-light/20
                    focus:outline-none focus:ring-2 focus:ring-accent/50
                    placeholder:text-light/40
                    focus:placeholder:text-light/60
                    hover:scale-[1.02] hover:shadow-lg
                    ${errors.name ? 'border-2 border-red-500' : 'border border-light/10'}`}
                  placeholder='Enter your name'
                />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <label className='block text-light/90 text-sm font-medium mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    transition-all duration-300
                    focus:bg-light/20
                    focus:outline-none focus:ring-2 focus:ring-accent/50
                    placeholder:text-light/40
                    focus:placeholder:text-light/60
                    hover:scale-[1.02] hover:shadow-lg
                    ${errors.email ? 'border-2 border-red-500' : 'border border-light/10'}`}
                  placeholder='Enter your email'
                />
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <label className='block text-light/90 text-sm font-medium mb-2'>Subject</label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                  transition-all duration-300
                  focus:bg-light/20
                  focus:outline-none focus:ring-2 focus:ring-accent/50
                  placeholder:text-light/40
                  focus:placeholder:text-light/60
                  hover:scale-[1.02] hover:shadow-lg
                  ${errors.subject ? 'border-2 border-red-500' : 'border border-light/10'}`}
                placeholder='Enter subject'
              />
              {errors.subject && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <label className='block text-light/90 text-sm font-medium mb-2'>Message</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                  transition-all duration-300 min-h-[250px]
                  focus:bg-light/20
                  focus:outline-none focus:ring-2 focus:ring-accent/50
                  placeholder:text-light/40
                  focus:placeholder:text-light/60
                  hover:scale-[1.02] hover:shadow-lg resize-none
                  ${errors.message ? 'border-2 border-red-500' : 'border border-light/10'}`}
                placeholder='Enter your message'></textarea>
              {errors.message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                  {errors.message}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              type='submit'
              className='w-full bg-accent text-primary font-medium py-3 px-6 rounded-lg
                 hover:bg-accent/90 transition-colors duration-300
                 focus:outline-none focus:ring-2 focus:ring-accent/50'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              Send Message
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

export default ContactSection
