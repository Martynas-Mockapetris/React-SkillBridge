import { useState } from 'react'
import { motion } from 'framer-motion'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import molecularPattern from '../../assets/molecular-pattern.svg'
import { getSectionBackgroundClass, getSectionSpacingClass } from './homeSectionLayout'

const ContactSection = ({ content = {}, contactValues = {}, layout = {} }) => {
  const { t } = useTranslation('main')
  const contactTitleLead = t('contact.titleLead')
  const contactTitleAccent = t('contact.titleAccent')
  const contactSubtitle = t('contact.subtitle')

  const supportEmail = contactValues.supportEmail || ''
  const businessEmail = contactValues.businessEmail || ''
  const phone = contactValues.phone || ''
  const address = contactValues.address || ''
  const workingHours = contactValues.workingHours || ''
  const sectionSpacingClass = getSectionSpacingClass(layout.spacing || {})
  const sectionBackgroundClass = getSectionBackgroundClass(layout.background || 'default')

  const infoItems = [
    supportEmail ? { label: t('contact.supportLabel'), value: supportEmail } : null,
    businessEmail ? { label: t('contact.businessLabel'), value: businessEmail } : null,
    phone ? { label: t('contact.phoneLabel'), value: phone } : null,
    workingHours ? { label: t('contact.hoursLabel'), value: workingHours } : null,
    address ? { label: t('contact.addressLabel'), value: address } : null
  ].filter(Boolean)

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
      newErrors.name = t('contact.nameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('contact.emailRequired')
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('contact.emailInvalid')
    }

    if (!formData.subject.trim()) {
      newErrors.subject = t('contact.subjectRequired')
    }

    if (!formData.message.trim()) {
      newErrors.message = t('contact.messageRequired')
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
      // API call will be added in next commit with toast notifications
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
    <section className={`w-full ${sectionSpacingClass} ${sectionBackgroundClass} relative z-[1]`}>
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
            <span className='theme-text'>{contactTitleLead}</span>
            <span className='text-accent'> {contactTitleAccent}</span>
          </h2>
          <p className='theme-text-secondary max-w-2xl mx-auto mb-12'>{contactSubtitle}</p>
        </motion.div>

        {infoItems.length > 0 && (
          <div className='max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6'>
            {infoItems.map((item) => (
              <div key={item.label} className='rounded-lg border theme-border bg-light/5 dark:bg-light/5 px-4 py-3'>
                <p className='text-xs uppercase tracking-wide theme-text-secondary'>{item.label}</p>
                <p className='theme-text text-sm break-words'>{item.value}</p>
              </div>
            ))}
          </div>
        )}

        <motion.div className='max-w-3xl mx-auto' initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
          <form onSubmit={handleSubmit} className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent p-8 rounded-lg backdrop-blur-sm'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mb-6'>
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <label className='block theme-text text-sm font-medium mb-2'>{t('contact.formNameLabel')}</label>
                <input type='text' name='name' value={formData.name} onChange={handleChange} className={inputClasses('name')} placeholder={t('contact.formNamePlaceholder')} />
                {errors.name && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.name}
                  </motion.p>
                )}
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
                <label className='block theme-text text-sm font-medium mb-2'>{t('contact.formEmailLabel')}</label>
                <input type='email' name='email' value={formData.email} onChange={handleChange} className={inputClasses('email')} placeholder={t('contact.formEmailPlaceholder')} />
                {errors.email && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>
            </div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
              <label className='block theme-text text-sm font-medium mb-2'>{t('contact.formSubjectLabel')}</label>
              <input type='text' name='subject' value={formData.subject} onChange={handleChange} className={inputClasses('subject')} placeholder={t('contact.formSubjectPlaceholder')} />
              {errors.subject && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                  {errors.subject}
                </motion.p>
              )}
            </motion.div>

            <motion.div className='mb-6' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
              <label className='block theme-text text-sm font-medium mb-2'>{t('contact.formMessageLabel')}</label>
              <textarea name='message' value={formData.message} onChange={handleChange} className={`${inputClasses('message')} min-h-[250px] resize-none`} placeholder={t('contact.formMessagePlaceholder')}></textarea>
              {errors.message && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                  {errors.message}
                </motion.p>
              )}
            </motion.div>

            <motion.button
              type='submit'
              className='w-full bg-accent text-primary font-medium py-3 px-6 rounded-lg
              hover:bg-accent/90 hover:shadow-lg transition-all duration-300
              focus:outline-none focus:ring-2 focus:ring-accent/50'
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              {t('contact.formSubmitButton')}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </section>
  )
}

ContactSection.propTypes = {
  content: PropTypes.shape({
    contactTitleLead: PropTypes.string,
    contactTitleAccent: PropTypes.string,
    contactSubtitle: PropTypes.string
  }),
  contactValues: PropTypes.shape({
    supportEmail: PropTypes.string,
    businessEmail: PropTypes.string,
    phone: PropTypes.string,
    address: PropTypes.string,
    workingHours: PropTypes.string
  }),
  layout: PropTypes.shape({
    spacing: PropTypes.object,
    background: PropTypes.string
  })
}

export default ContactSection
