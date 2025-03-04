import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import InputMask from 'react-input-mask'
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaTools, FaBook, FaGlobe, FaGithub, FaLinkedin, FaTwitter, FaStar, FaLanguage, FaCertificate, FaList, FaBriefcase, FaCheck, FaTimes } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

// Initial form state with empty values
const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  skills: '',
  bio: '',
  website: '',
  github: '',
  linkedin: '',
  twitter: '',
  hourlyRate: '',
  experienceLevel: 'entry',
  languages: '',
  certifications: '',
  serviceCategories: '',
  upworkProfile: '',
  fiverrProfile: ''
}

const ProfileSettings = () => {
  const { currentUser, updateUserProfile, getUserProfile } = useAuth()
  const userRole = currentUser?.userType || 'freelancer'
  // Show freelancer fields for freelancer, both roles, and admin
  const showFreelancerSection = userRole === 'freelancer' || userRole === 'both' || userRole === 'admin'

  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notification, setNotification] = useState({ type: '', message: '' })
  const [isLoading, setIsLoading] = useState(true)
  const apiCallInProgressRef = useRef(false)

  // Helper function to populate form with user data
  const populateFormWithUserData = (user) => {
    if (!user) return

    setFormData({
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      skills: user.skills || '',
      bio: user.bio || '',
      website: user.website || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || '',
      hourlyRate: user.hourlyRate || '',
      experienceLevel: user.experienceLevel || 'entry',
      languages: user.languages || '',
      certifications: user.certifications || '',
      serviceCategories: user.serviceCategories || '',
      upworkProfile: user.upworkProfile || '',
      fiverrProfile: user.fiverrProfile || ''
    })

    setIsLoading(false)
  }

  // Fetch complete profile data when component mounts
  useEffect(() => {
    const fetchFullProfile = async () => {
      if (apiCallInProgressRef.current) return

      apiCallInProgressRef.current = true
      setIsLoading(true)

      try {
        await getUserProfile() // This updates currentUser in context
      } catch (error) {
        console.error('Error fetching profile data:', error)
      } finally {
        apiCallInProgressRef.current = false
        setIsLoading(false)
      }
    }

    fetchFullProfile()
  }, []) // Empty dependency array - only runs once on mount

  // Update form data when currentUser changes
  useEffect(() => {
    if (currentUser) {
      populateFormWithUserData(currentUser)
    }
  }, [currentUser])

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Validate all form fields and return if valid
  const validateForm = () => {
    const newErrors = {}

    // Basic validation - required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Phone validation (optional)
    if (formData.phone && !/^\+[0-9 ]{8,20}$/.test(formData.phone.replace(/_/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    // URL validations for web profiles
    const urlFields = ['website', 'github', 'linkedin', 'twitter', 'upworkProfile', 'fiverrProfile']
    urlFields.forEach((field) => {
      if (formData[field] && !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/.test(formData[field])) {
        newErrors[field] = 'Please enter a valid URL'
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit form data to API
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        // Split fullName into firstName and lastName
        const nameParts = formData.fullName.split(' ')
        const firstName = nameParts[0] || ''
        const lastName = nameParts.slice(1).join(' ') || ''

        // Prepare the data for the API
        const profileData = {
          firstName,
          lastName,
          phone: formData.phone,
          location: formData.location,
          skills: formData.skills,
          bio: formData.bio,
          website: formData.website,
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          hourlyRate: formData.hourlyRate ? Number(formData.hourlyRate) : undefined,
          experienceLevel: formData.experienceLevel,
          languages: formData.languages,
          certifications: formData.certifications,
          serviceCategories: formData.serviceCategories,
          upworkProfile: formData.upworkProfile,
          fiverrProfile: formData.fiverrProfile
        }

        // Send profile update to API
        await updateUserProfile(profileData)
        setNotification({ type: 'success', message: 'Changes saved successfully!' })
      } catch (error) {
        console.error('Error updating profile:', error)
        setNotification({ type: 'error', message: 'Failed to save changes. Please try again.' })
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Reset form to current user data or initial state
  const handleReset = () => {
    if (currentUser) {
      populateFormWithUserData(currentUser)
    } else {
      setFormData(initialFormState)
    }
    setErrors({})
    setNotification({ type: 'info', message: 'Form has been reset' })
  }

  // Utility function for input field CSS classes
  const inputClasses = (errorField) => `
    w-full pl-10 p-3 rounded-lg
    bg-light/10
    transition-all duration-300
    dark:placeholder:text-light/40 placeholder:text-primary/40
    dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
    focus:bg-light/20
    focus:outline-none focus:ring-2 focus:ring-accent/50
    hover:scale-[1.02] hover:shadow-lg
    ${errors[errorField] ? 'border-2 border-red-500' : 'border theme-border'}
  `
  return (
    <motion.div className='space-y-8 p-6' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
        </div>
      ) : (
        <>
          <AnimatePresence>
            {notification.message && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-blue-500'} text-white`}>
                <div className='flex items-center gap-2'>
                  {notification.type === 'success' ? <FaCheck /> : <FaTimes />}
                  {notification.message}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <motion.h2 className='text-2xl font-bold theme-text' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            Profile Settings
          </motion.h2>

          <form onSubmit={handleSubmit}>
            <motion.div className='grid lg:grid-cols-2 gap-6 mb-8' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Basic Information */}
              <motion.div className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5'>
                <h3 className='text-xl font-semibold theme-text mb-4'>Basic Information</h3>
                <div className='space-y-4'>
                  {[
                    { name: 'fullName', label: 'Full Name', icon: <FaUser />, type: 'text', placeholder: 'Enter your full name' },
                    { name: 'email', label: 'Email', icon: <FaEnvelope />, type: 'email', placeholder: 'Enter your email address' },
                    { name: 'location', label: 'Location', icon: <FaMapMarkerAlt />, type: 'text', placeholder: 'Enter your location' }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className='block mb-2 theme-text-secondary text-sm'>{field.label}</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>{field.icon}</span>
                        <input type={field.type} name={field.name} value={formData[field.name]} onChange={handleChange} className={inputClasses(field.name)} placeholder={field.placeholder} />
                        {errors[field.name] && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                            {errors[field.name]}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className='block mb-2 theme-text-secondary text-sm'>Phone Number</label>
                    <div className='relative'>
                      <span className='absolute left-3 top-4 text-accent text-[16px]'>
                        <FaPhone />
                      </span>
                      <InputMask mask='+999 99 999 9999' name='phone' value={formData.phone} onChange={handleChange} className={inputClasses('phone')} placeholder='Enter your phone number' />
                      {errors.phone && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 theme-text-secondary text-sm'>Skills</label>
                    <div className='relative'>
                      <span className='absolute left-3 top-4 text-accent text-[16px]'>
                        <FaTools />
                      </span>
                      <textarea name='skills' value={formData.skills} onChange={handleChange} className={inputClasses('skills')} rows='3' placeholder='Separate skills with commas' />
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 theme-text-secondary text-sm'>Bio</label>
                    <div className='relative'>
                      <span className='absolute left-3 top-4 text-accent text-[16px]'>
                        <FaBook />
                      </span>
                      <textarea name='bio' value={formData.bio} onChange={handleChange} className={inputClasses('bio')} rows='4' placeholder='Describe yourself' />
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Social Links */}
              <motion.div className='p-6 h-fit rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5'>
                <h3 className='text-xl font-semibold theme-text mb-4'>Social Links</h3>
                <div className='space-y-4'>
                  {[
                    { name: 'website', label: 'Website', icon: <FaGlobe />, placeholder: 'Enter your website URL' },
                    { name: 'github', label: 'GitHub', icon: <FaGithub />, placeholder: 'Enter your GitHub profile' },
                    { name: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin />, placeholder: 'Enter your LinkedIn profile' },
                    { name: 'twitter', label: 'Twitter', icon: <FaTwitter />, placeholder: 'Enter your Twitter handle' }
                  ].map((social) => (
                    <div key={social.name}>
                      <label className='block mb-2 theme-text-secondary text-sm'>{social.label}</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>{social.icon}</span>
                        <input type='url' name={social.name} value={formData[social.name]} onChange={handleChange} className={inputClasses(social.name)} placeholder={social.placeholder} />
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {showFreelancerSection && (
              <motion.div
                className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 mb-8'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}>
                <h3 className='text-xl font-semibold theme-text mb-4'>Freelancer Details</h3>
                <div className='grid gap-6'>
                  <div className='grid md:grid-cols-2 gap-4'>
                    <div>
                      <label className='block mb-2 theme-text-secondary text-sm'>Hourly Rate</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-3 text-accent'>€</span>
                        <input type='number' name='hourlyRate' value={formData.hourlyRate} onChange={handleChange} className={inputClasses('hourlyRate')} placeholder='€ per hour' />
                      </div>
                    </div>

                    <div>
                      <label className='block mb-2 theme-text-secondary text-sm'>Experience Level</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>
                          <FaStar />
                        </span>
                        <select name='experienceLevel' value={formData.experienceLevel} onChange={handleChange} className={inputClasses('experienceLevel')}>
                          <option value='entry'>Entry Level</option>
                          <option value='intermediate'>Intermediate</option>
                          <option value='expert'>Expert</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {[
                    { name: 'languages', label: 'Languages', icon: <FaLanguage />, placeholder: 'English (Native), Spanish (Fluent), etc.' },
                    { name: 'certifications', label: 'Certifications', icon: <FaCertificate />, placeholder: 'List your relevant certifications' },
                    { name: 'serviceCategories', label: 'Service Categories', icon: <FaList />, placeholder: 'Web Development, Mobile Apps, UI/UX Design, etc.' }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className='block mb-2 theme-text-secondary text-sm'>{field.label}</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>{field.icon}</span>
                        <textarea name={field.name} value={formData[field.name]} onChange={handleChange} className={inputClasses(field.name)} rows='2' placeholder={field.placeholder} />
                      </div>
                    </div>
                  ))}

                  <div>
                    <label className='block mb-2 theme-text-secondary text-sm'>Platform Links</label>
                    <div className='grid md:grid-cols-2 gap-4'>
                      {[
                        { name: 'upworkProfile', placeholder: 'Upwork Profile URL' },
                        { name: 'fiverrProfile', placeholder: 'Fiverr Profile URL' }
                      ].map((platform) => (
                        <div key={platform.name} className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaBriefcase />
                          </span>
                          <input type='url' name={platform.name} value={formData[platform.name]} onChange={handleChange} className={inputClasses(platform.name)} placeholder={platform.placeholder} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className='flex gap-4'>
              <motion.button
                type='button'
                onClick={handleReset}
                className='flex-1 bg-gray-500 text-white font-medium py-3 px-6 rounded-lg
              hover:bg-gray-600 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-gray-500/50'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}>
                Reset Form
              </motion.button>

              <motion.button
                type='submit'
                className='flex-1 bg-accent text-white font-medium py-3 px-6 rounded-lg
              hover:bg-accent/90 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-accent/50
              disabled:opacity-50 disabled:cursor-not-allowed'
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </motion.button>
            </div>
          </form>
        </>
      )}
    </motion.div>
  )
}

export default ProfileSettings
