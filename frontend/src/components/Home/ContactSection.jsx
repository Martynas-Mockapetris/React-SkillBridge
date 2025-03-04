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

  const inputClasses = (errorField) => `
  w-full bg-light/10 rounded-lg px-4 py-3 theme-text
  transition-all duration-300
  dark:placeholder:text-light/40 placeholder:text-primary/40
  dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
  focus:bg-light/20
  focus:outline-none focus:ring-2 focus:ring-accent/50
  hover:scale-[1.02] hover:shadow-lg
  ${errors[errorField] ? 'border-2 border-red-500' : 'border theme-border'}
`

  return (
    <section className='w-full py-20 theme-bg relative z-[1]'>
      {/* Molecular patterns */}
      <div className='absolute inset-0 overflow-hidden'>
        <div className='absolute left-60 bottom-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[450px] h-[450px] rotate-[75deg]' />
        </div>
        {/* Other patterns... */}
      </div>

      <div className='container mx-auto px-4 relative z-10'>
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>Get In</span>
            <span className='text-accent'> Touch</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto mb-12'>Have a question or want to collaborate? Drop us a message, and we'll get back to you soon.</p>
        </motion.div>

        <motion.div className='max-w-3xl mx-auto' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <form onSubmit={handleSubmit} className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent p-8 rounded-lg backdrop-blur-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <label className='block theme-text text-sm font-medium mb-2'>Name</label>
                <input type='text' name='name' value={formData.name} onChange={handleChange} className={inputClasses('name')} placeholder='Enter your name' />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <label className='block theme-text text-sm font-medium mb-2'>Email</label>
                <input type='email' name='email' value={formData.email} onChange={handleChange} className={inputClasses('email')} placeholder='Enter your email' />
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <label className='block theme-text text-sm font-medium mb-2'>Subject</label>
              <input type='text' name='subject' value={formData.subject} onChange={handleChange} className={inputClasses('subject')} placeholder='Enter subject' />
              {errors.subject && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <label className='block theme-text text-sm font-medium mb-2'>Message</label>
              <textarea name='message' value={formData.message} onChange={handleChange} className={`${inputClasses('message')} min-h-[250px] resize-none`} placeholder='Enter your message'></textarea>
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
