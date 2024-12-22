import { useState } from 'react'
import { motion } from 'framer-motion'

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
      newErrors.name = 'Vardas privalomas'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El. paštas privalomas'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neteisingas el. pašto formatas'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Tema privaloma'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Žinutė privaloma'
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
          <form onSubmit={handleSubmit} className='bg-light/5 p-8 rounded-lg'>
            {/* Vardo ir el. pašto laukai */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <label className='block text-light mb-2'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    transition-all duration-300 focus:bg-light/20
                    ${errors.name ? 'border-2 border-red-500' : ''}`}
                  placeholder='Enter your name'
                />
                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <label className='block text-light mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    transition-all duration-300 focus:bg-light/20
                    ${errors.email ? 'border-2 border-red-500' : ''}`}
                  placeholder='Enter your email'
                />
                {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
              </motion.div>
            </div>

            {/* Temos laukas */}
            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <label className='block text-light mb-2'>Subject</label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                  transition-all duration-300 focus:bg-light/20
                  ${errors.subject ? 'border-2 border-red-500' : ''}`}
                placeholder='Enter subject'
              />
              {errors.subject && <p className='text-red-500 text-sm mt-1'>{errors.subject}</p>}
            </motion.div>

            {/* Zinutes laukas */}
            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <label className='block text-light mb-2'>Message</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light min-h-[150px]
                  transition-all duration-300 focus:bg-light/20
                  ${errors.message ? 'border-2 border-red-500' : ''}`}
                placeholder='Enter your message'></textarea>
              {errors.message && <p className='text-red-500 text-sm mt-1'>{errors.message}</p>}
            </motion.div>

            {/* Siuntimo mygtukas */}
            <motion.button
              type='submit'
              className='w-full bg-accent text-primary font-medium py-3 px-6 rounded-lg
                       hover:bg-accent/90 transition-colors duration-300'
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
