import { useState } from 'react'

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })

  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required'
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Form submitted:', formData)
      // Will add API call here later
    }
  }

  return (
    <section className='w-full py-20 bg-primary relative z-[1]'>
      <div className='container mx-auto px-4 relative z-10'>
        {/* Sekcijos antraste */}
        <div className='max-w-3xl mx-auto'>
          {/* Formas */}
          <form onSubmit={handleSubmit} className='bg-light/5 p-8 rounded-lg'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <div>
                <label className='block text-light mb-2'>Name</label>
                <input
                  type='text'
                  name='name'
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    ${errors.name ? 'border-2 border-red-500' : ''}`}
                  placeholder='Enter your name'
                />
                {errors.name && <p className='text-red-500 text-sm mt-1'>{errors.name}</p>}
              </div>
              <div>
                <label className='block text-light mb-2'>Email</label>
                <input
                  type='email'
                  name='email'
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                    ${errors.email ? 'border-2 border-red-500' : ''}`}
                  placeholder='Enter your email'
                />
                {errors.email && <p className='text-red-500 text-sm mt-1'>{errors.email}</p>}
              </div>
            </div>
            <div className='mb-6'>
              <label className='block text-light mb-2'>Subject</label>
              <input
                type='text'
                name='subject'
                value={formData.subject}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light
                  ${errors.subject ? 'border-2 border-red-500' : ''}`}
                placeholder='Enter subject'
              />
              {errors.subject && <p className='text-red-500 text-sm mt-1'>{errors.subject}</p>}
            </div>
            <div className='mb-6'>
              <label className='block text-light mb-2'>Message</label>
              <textarea
                name='message'
                value={formData.message}
                onChange={handleChange}
                className={`w-full bg-light/10 rounded-lg px-4 py-3 text-light min-h-[150px]
                  ${errors.message ? 'border-2 border-red-500' : ''}`}
                placeholder='Enter your message'></textarea>
              {errors.message && <p className='text-red-500 text-sm mt-1'>{errors.message}</p>}
            </div>
            <button
              type='submit'
              className='w-full bg-accent text-primary font-medium py-3 px-6 rounded-lg
                       hover:bg-accent/90 transition-colors duration-300'>
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default ContactSection
