import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaTools,
  FaBook,
  FaGlobe,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaStar,
  FaLanguage,
  FaCertificate,
  FaList,
  FaBriefcase,
  FaSyncAlt,
  FaChevronDown,
  FaClock,
  FaEye
} from 'react-icons/fa'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import LoadingSpinner from '../shared/LoadingSpinner'
import { calculateProfileCompleteness } from '../../utils/profileCompleteness'

// Initial form state with empty values
const initialFormState = {
  fullName: '',
  email: '',
  phone: '',
  location: '',
  skills: '',
  bio: '',
  headline: '',
  availabilityStatus: 'available',
  profileVisibility: 'public',
  responseTime: 'within_24_hours',
  servicesOffered: '',
  tools: '',
  workPreference: 'flexible',
  yearsOfExperience: '',
  minimumProjectBudget: '',
  preferredProjectSize: 'flexible',
  preferredEngagements: '',
  timezone: '',
  availabilityDetails: '',
  industries: '',
  showLocationPublic: true,
  showHourlyRate: true,
  allowDirectMessages: true,
  allowProjectInvites: true,
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
  fiverrProfile: '',
  profilePicture: ''
}

const ProfileSettings = () => {
  const { currentUser, updateUserProfile } = useAuth()
  const profileCompleteness = calculateProfileCompleteness(currentUser)
  const missingRequired = profileCompleteness?.missingRequired ?? []
  const missingOptional = profileCompleteness?.missingOptional ?? []
  const userRole = currentUser?.userType || 'freelancer'
  // Show freelancer fields for freelancer, both roles, and admin
  const showFreelancerSection = userRole === 'freelancer' || userRole === 'both' || userRole === 'admin'

  const [formData, setFormData] = useState(initialFormState)
  const [savedFormData, setSavedFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(!currentUser)

  // Helper function to populate form with user data
  const populateFormWithUserData = (user) => {
    if (!user) return

    const nextFormData = {
      fullName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email || '',
      phone: user.phone || '',
      location: user.location || '',
      skills: user.skills || '',
      bio: user.bio || '',
      headline: user.headline || '',
      availabilityStatus: user.availabilityStatus || 'available',
      profileVisibility: user.profileVisibility || 'public',
      responseTime: user.responseTime || 'within_24_hours',
      servicesOffered: user.servicesOffered || '',
      tools: user.tools || '',
      workPreference: user.workPreference || 'flexible',
      yearsOfExperience: user.yearsOfExperience ?? '',
      minimumProjectBudget: user.minimumProjectBudget ?? '',
      preferredProjectSize: user.preferredProjectSize || 'flexible',
      preferredEngagements: Array.isArray(user.preferredEngagements) ? user.preferredEngagements.join(', ') : '',
      timezone: user.timezone || '',
      availabilityDetails: user.availabilityDetails || '',
      industries: user.industries || '',
      showLocationPublic: user.showLocationPublic ?? true,
      showHourlyRate: user.showHourlyRate ?? true,
      allowDirectMessages: user.allowDirectMessages ?? true,
      allowProjectInvites: user.allowProjectInvites ?? true,
      website: user.website || '',
      github: user.github || '',
      linkedin: user.linkedin || '',
      twitter: user.twitter || '',
      profilePicture: user.profilePicture || '',
      hourlyRate: user.hourlyRate ?? '',
      experienceLevel: user.experienceLevel || 'entry',
      languages: user.languages || '',
      certifications: user.certifications || '',
      serviceCategories: user.serviceCategories || '',
      upworkProfile: user.upworkProfile || '',
      fiverrProfile: user.fiverrProfile || ''
    }

    setFormData(nextFormData)
    setSavedFormData(nextFormData)
    setIsLoading(false)
  }

  // Update form data when currentUser becomes available
  useEffect(() => {
    if (!currentUser) {
      setIsLoading(true)
      return
    }

    populateFormWithUserData(currentUser)
  }, [currentUser])

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const nextValue = type === 'checkbox' ? checked : value

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue
    }))

    setErrors((prev) => {
      if (!prev[name]) return prev

      const nextErrors = { ...prev }
      delete nextErrors[name]
      return nextErrors
    })
  }

  const hasUnsavedChanges = JSON.stringify(formData) !== JSON.stringify(savedFormData)
  const currentAvatarUrl = formData.profilePicture || `https://i.pravatar.cc/150?u=${currentUser?._id || 'default'}`
  const savedAvatarUrl = savedFormData.profilePicture || `https://i.pravatar.cc/150?u=${currentUser?._id || 'default'}`
  const hasAvatarChanges = currentAvatarUrl !== savedAvatarUrl

  // Validate all form fields and return if valid
  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.headline.trim()) {
      newErrors.headline = 'Professional headline is required'
    }

    if (!formData.skills.trim()) {
      newErrors.skills = 'Skills are required'
    }

    if (!formData.bio.trim()) {
      newErrors.bio = 'Bio is required'
    }

    if (!formData.servicesOffered.trim()) {
      newErrors.servicesOffered = 'Services offered is required'
    }

    if (formData.phone && !/^\+[0-9 ]{8,20}$/.test(formData.phone.replace(/_/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }

    const numericFields = [
      { name: 'hourlyRate', label: 'Hourly rate' },
      { name: 'minimumProjectBudget', label: 'Minimum project budget' },
      { name: 'yearsOfExperience', label: 'Years of experience' }
    ]

    numericFields.forEach(({ name, label }) => {
      if (formData[name] !== '' && (Number.isNaN(Number(formData[name])) || Number(formData[name]) < 0)) {
        newErrors[name] = `${label} must be 0 or greater`
      }
    })

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
          headline: formData.headline,
          availabilityStatus: formData.availabilityStatus,
          profileVisibility: formData.profileVisibility,
          responseTime: formData.responseTime,
          servicesOffered: formData.servicesOffered,
          tools: formData.tools,
          workPreference: formData.workPreference,
          yearsOfExperience: formData.yearsOfExperience === '' ? undefined : Number(formData.yearsOfExperience),
          minimumProjectBudget: formData.minimumProjectBudget === '' ? undefined : Number(formData.minimumProjectBudget),
          preferredProjectSize: formData.preferredProjectSize,
          preferredEngagements: formData.preferredEngagements
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
          timezone: formData.timezone,
          availabilityDetails: formData.availabilityDetails,
          industries: formData.industries,
          showLocationPublic: formData.showLocationPublic,
          showHourlyRate: formData.showHourlyRate,
          allowDirectMessages: formData.allowDirectMessages,
          allowProjectInvites: formData.allowProjectInvites,
          website: formData.website,
          github: formData.github,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
          profilePicture: formData.profilePicture,
          hourlyRate: formData.hourlyRate === '' ? undefined : Number(formData.hourlyRate),
          experienceLevel: formData.experienceLevel,
          languages: formData.languages,
          certifications: formData.certifications,
          serviceCategories: formData.serviceCategories,
          upworkProfile: formData.upworkProfile,
          fiverrProfile: formData.fiverrProfile
        }

        // Send profile update to API
        const response = await updateUserProfile(profileData)

        // Update the form state with the response to refresh the image display
        setFormData((prev) => {
          const nextFormData = {
            ...prev,
            profilePicture: response.profilePicture || prev.profilePicture
          }

          setSavedFormData(nextFormData)
          return nextFormData
        })

        setErrors({})
        toast.success('Changes saved successfully!')
      } catch (error) {
        const message = error.response?.data?.message || 'Failed to save changes. Please try again.'
        const validationErrors = error.response?.data?.errors

        if (validationErrors && typeof validationErrors === 'object') {
          const nextErrors = {}

          Object.entries(validationErrors).forEach(([field, details]) => {
            if (details?.message) {
              nextErrors[field] = details.message
            }
          })

          if (Object.keys(nextErrors).length > 0) {
            setErrors(nextErrors)
          }
        }

        toast.error(message)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Reset form to current user data or initial state
  const handleReset = () => {
    if (!hasUnsavedChanges) return

    if (currentUser) {
      populateFormWithUserData(currentUser)
    } else {
      setFormData(initialFormState)
      setSavedFormData(initialFormState)
      setIsLoading(false)
    }

    setErrors({})
    setIsSubmitting(false)
    toast.info('Form has been reset')
  }

  // Utility function for input field CSS classes
  const inputClasses = (errorField) => `
    w-full pl-10 p-3 rounded-lg
    theme-input theme-text
    transition-all duration-300
    border ${errors[errorField] ? 'border-red-500' : 'dark:border-light/10 border-primary/10'}
    dark:placeholder:text-light/40 placeholder:text-primary/40
    dark:focus:placeholder:text-light/60 focus:placeholder:text-primary/60
    focus:outline-none focus:ring-2 focus:ring-accent/50
  `
  const selectShellClasses = (errorField) => `
    relative rounded-lg
    bg-primary/15 dark:bg-light/12
    transition-all duration-300
    border ${errors[errorField] ? 'border-red-500' : 'border-primary/15 dark:border-light/10'}
    shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]
    hover:border-accent/35 hover:bg-primary/20 dark:hover:bg-light/15
    focus-within:border-accent/45
    focus-within:ring-2 focus-within:ring-accent/50
  `
  const selectFieldClasses = `
    w-full min-h-[50px] bg-transparent theme-text
    pl-10 pr-10 py-3 rounded-lg
    appearance-none theme-select
    focus:outline-none
  `
  const selectIconClasses = 'absolute left-3 top-1/2 -translate-y-1/2 text-accent text-[16px] pointer-events-none'
  const selectChevronClasses = 'absolute right-3 top-1/2 -translate-y-1/2 text-accent text-[14px] pointer-events-none'
  const toggleClasses = 'h-4 w-4 rounded border-primary/20 text-accent focus:ring-accent/50 dark:border-light/20 dark:bg-transparent'

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {isLoading ? (
        <div className='flex justify-center items-center h-64'>
          <LoadingSpinner />
        </div>
      ) : (
        <>
          <motion.div
            className='mb-6 p-4 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border theme-border'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}>
            <div className='flex items-center justify-between gap-4 flex-wrap'>
              <div>
                <p className='text-sm theme-text-secondary'>Profile completion</p>
                <p className='text-xl font-bold theme-text'>{profileCompleteness?.percentage ?? 0}%</p>
              </div>
              <div className='text-sm theme-text-secondary'>
                <p>Missing required: {missingRequired.length}</p>
                <p>Missing optional: {missingOptional.length}</p>
              </div>
            </div>

            <div className='flex items-center justify-between gap-4 flex-wrap'>
              {missingRequired.length > 0 && (
                <div className='mt-3'>
                  <p className='text-xs uppercase tracking-wide text-red-500 mb-1'>Required fields to complete</p>
                  <p className='text-sm theme-text-secondary'>{missingRequired.map((item) => item.label).join(', ')}</p>
                </div>
              )}
              <div className='text-sm theme-text-secondary'>
                <p className={hasUnsavedChanges ? 'text-amber-500' : 'theme-text-secondary'}>{hasUnsavedChanges ? 'Changes not saved yet' : 'Profile is up to date'}</p>
              </div>
            </div>
          </motion.div>

          <form onSubmit={handleSubmit}>
            <motion.div className='grid lg:grid-cols-2 gap-6 mb-8' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              {/* Basic Information */}
              <motion.div className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 h-full'>
                <h3 className='text-xl font-semibold theme-text mb-2'>Basic Information</h3>
                <p className='text-sm theme-text-secondary mb-4'>Add the core details people use to recognize you and understand your background quickly.</p>
                <div className='mb-4'>
                  <p className='text-xs uppercase tracking-wide theme-text-muted'>Identity & Contact</p>
                </div>
                <div className='space-y-4'>
                  {[
                    { name: 'fullName', label: 'Full Name', icon: <FaUser />, type: 'text', placeholder: 'Enter your full name' },
                    {
                      name: 'email',
                      label: 'Email',
                      icon: <FaEnvelope />,
                      type: 'email',
                      placeholder: 'Enter your email address',
                      readOnly: true,
                      helperText: 'Email changes require a separate verification flow and cannot be edited here.'
                    }
                  ].map((field) => (
                    <div key={field.name}>
                      <label className='block mb-2 theme-text-secondary text-sm'>{field.label}</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>{field.icon}</span>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleChange}
                          readOnly={field.readOnly}
                          className={`${inputClasses(field.name)} ${field.readOnly ? 'cursor-not-allowed opacity-80' : ''}`}
                          placeholder={field.placeholder}
                        />
                        {field.helperText && <p className='text-xs theme-text-muted mt-2'>{field.helperText}</p>}
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
                      <input type='tel' name='phone' value={formData.phone} onChange={handleChange} className={inputClasses('phone')} placeholder='Enter your phone number' />
                      {errors.phone && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                          {errors.phone}
                        </motion.p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className='block mb-2 theme-text-secondary text-sm'>Bio</label>
                    <div className='relative'>
                      <span className='absolute left-3 top-4 text-accent text-[16px]'>
                        <FaBook />
                      </span>
                      <textarea name='bio' value={formData.bio} onChange={handleChange} className={inputClasses('bio')} rows='4' placeholder='Describe yourself' />
                      {errors.bio && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                          {errors.bio}
                        </motion.p>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Profile Picture and Social Links */}
              <motion.div className='flex flex-col gap-6 h-full' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <motion.div className='p-4 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border theme-border flex flex-col items-center text-center'>
                  <h3 className='text-lg font-semibold theme-text mb-2'>Profile Picture</h3>
                  <p className='text-sm theme-text-secondary mb-4'>Choose an avatar that helps clients recognize your profile quickly.</p>
                  <img key={currentAvatarUrl} src={currentAvatarUrl} alt='Profile' className='w-24 h-24 rounded-full border-2 theme-border shadow-lg mb-4 object-cover' />

                  <div className='flex flex-wrap items-center justify-center gap-3'>
                    <motion.button
                      type='button'
                      onClick={() => {
                        const randomSeed = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
                        const newAvatarUrl = `https://i.pravatar.cc/150?u=${randomSeed}`
                        setFormData((prev) => ({ ...prev, profilePicture: newAvatarUrl }))
                      }}
                      className='flex items-center gap-2 bg-accent text-white px-4 py-2 rounded-lg hover:bg-accent/90 transition-colors duration-300'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <FaSyncAlt className='text-sm' />
                      <span className='text-sm font-medium'>Generate New Avatar</span>
                    </motion.button>

                    {hasAvatarChanges && (
                      <motion.button
                        type='button'
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            profilePicture: savedFormData.profilePicture
                          }))
                        }
                        className='px-4 py-2 rounded-lg border dark:border-light/10 border-primary/10 theme-text hover:text-accent hover:border-accent/40 transition-colors duration-300'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        Use Current Avatar
                      </motion.button>
                    )}
                  </div>
                </motion.div>

                <motion.div className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 border theme-border flex-1'>
                  <h3 className='text-xl font-semibold theme-text mb-2'>Public Presence</h3>
                  <p className='text-sm theme-text-secondary mb-4'>Shape how people discover you, review your work, and understand your public profile at a glance.</p>
                  <div className='space-y-4'>
                    <div>
                      <label className='block mb-2 theme-text-secondary text-sm'>Professional Headline</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>
                          <FaBriefcase />
                        </span>
                        <input type='text' name='headline' value={formData.headline} onChange={handleChange} className={inputClasses('headline')} placeholder='Frontend developer focused on fast, polished client work' />
                        {errors.headline && (
                          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                            {errors.headline}
                          </motion.p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className='block mb-2 theme-text-secondary text-sm'>Location</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>
                          <FaMapMarkerAlt />
                        </span>
                        <input type='text' name='location' value={formData.location} onChange={handleChange} className={inputClasses('location')} placeholder='Enter your location' />
                      </div>
                    </div>
                    <div>
                      <label className='block mb-2 theme-text-secondary text-sm'>Timezone</label>
                      <div className='relative'>
                        <span className='absolute left-3 top-4 text-accent text-[16px]'>
                          <FaGlobe />
                        </span>
                        <input type='text' name='timezone' value={formData.timezone} onChange={handleChange} className={inputClasses('timezone')} placeholder='Europe/Vilnius' />
                      </div>
                    </div>
                    {[
                      { name: 'website', label: 'Portfolio', icon: <FaGlobe />, placeholder: 'Enter your portfolio URL' },
                      { name: 'github', label: 'GitHub', icon: <FaGithub />, placeholder: 'Enter your GitHub profile' },
                      { name: 'linkedin', label: 'LinkedIn', icon: <FaLinkedin />, placeholder: 'Enter your LinkedIn profile' },
                      { name: 'twitter', label: 'Twitter', icon: <FaTwitter />, placeholder: 'Enter your Twitter handle' }
                    ].map((social) => (
                      <div key={social.name}>
                        <label className='block mb-2 theme-text-secondary text-sm'>{social.label}</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>{social.icon}</span>
                          <input type='url' name={social.name} value={formData[social.name]} onChange={handleChange} className={inputClasses(social.name)} placeholder={social.placeholder} />
                          {errors[social.name] && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors[social.name]}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {showFreelancerSection && (
              <motion.div
                className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 mb-8'
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}>
                <h3 className='text-xl font-semibold theme-text mb-2'>Professional Settings</h3>
                <p className='text-sm theme-text-secondary mb-4'>Organize how you present your services, work preferences, visibility, and external professional presence.</p>
                <div className='grid gap-6'>
                  <div className='p-5 rounded-xl theme-input border theme-border'>
                    <div className='mb-4'>
                      <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Work Preferences</p>
                      <p className='text-sm theme-text-secondary'>Set your pricing, availability, experience, and preferred working style so clients can understand fit quickly.</p>
                    </div>
                    <div className='grid md:grid-cols-2 gap-4'>
                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Hourly Rate</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-3 text-accent'>€</span>
                          <input type='number' name='hourlyRate' value={formData.hourlyRate} onChange={handleChange} className={inputClasses('hourlyRate')} placeholder='€ per hour' />
                          {errors.hourlyRate && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors.hourlyRate}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Minimum Project Budget</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-3 text-accent'>€</span>
                          <input type='number' name='minimumProjectBudget' value={formData.minimumProjectBudget} onChange={handleChange} className={inputClasses('minimumProjectBudget')} placeholder='Minimum budget' />
                          {errors.minimumProjectBudget && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors.minimumProjectBudget}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Experience Level</label>
                        <div className={selectShellClasses('experienceLevel')}>
                          <span className={selectIconClasses}>
                            <FaStar />
                          </span>
                          <select name='experienceLevel' value={formData.experienceLevel} onChange={handleChange} className={selectFieldClasses}>
                            <option value='entry'>Entry Level</option>
                            <option value='intermediate'>Intermediate</option>
                            <option value='expert'>Expert</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Years of Experience</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaStar />
                          </span>
                          <input
                            type='number'
                            min='0'
                            name='yearsOfExperience'
                            value={formData.yearsOfExperience}
                            onChange={handleChange}
                            className={inputClasses('yearsOfExperience')}
                            placeholder='Years of experience'
                          />
                          {errors.yearsOfExperience && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors.yearsOfExperience}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Availability Status</label>
                        <div className={selectShellClasses('availabilityStatus')}>
                          <span className={selectIconClasses}>
                            <FaBriefcase />
                          </span>
                          <select name='availabilityStatus' value={formData.availabilityStatus} onChange={handleChange} className={selectFieldClasses}>
                            <option value='available'>Available</option>
                            <option value='limited'>Limited availability</option>
                            <option value='unavailable'>Unavailable</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Response Time</label>
                        <div className={selectShellClasses('responseTime')}>
                          <span className={selectIconClasses}>
                            <FaClock />
                          </span>
                          <select name='responseTime' value={formData.responseTime} onChange={handleChange} className={selectFieldClasses}>
                            <option value='within_24_hours'>Within 24 hours</option>
                            <option value='within_3_days'>Within 3 days</option>
                            <option value='within_week'>Within a week</option>
                            <option value='flexible'>Flexible</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Work Preference</label>
                        <div className={selectShellClasses('workPreference')}>
                          <span className={selectIconClasses}>
                            <FaMapMarkerAlt />
                          </span>
                          <select name='workPreference' value={formData.workPreference} onChange={handleChange} className={selectFieldClasses}>
                            <option value='remote'>Remote</option>
                            <option value='hybrid'>Hybrid</option>
                            <option value='onsite'>On-site</option>
                            <option value='flexible'>Flexible</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Preferred Project Size</label>
                        <div className={selectShellClasses('preferredProjectSize')}>
                          <span className={selectIconClasses}>
                            <FaList />
                          </span>
                          <select name='preferredProjectSize' value={formData.preferredProjectSize} onChange={handleChange} className={selectFieldClasses}>
                            <option value='small'>Small</option>
                            <option value='medium'>Medium</option>
                            <option value='large'>Large</option>
                            <option value='ongoing'>Ongoing</option>
                            <option value='flexible'>Flexible</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block mb-2 theme-text-secondary text-sm'>Preferred Engagements</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaList />
                          </span>
                          <textarea
                            name='preferredEngagements'
                            value={formData.preferredEngagements}
                            onChange={handleChange}
                            className={inputClasses('preferredEngagements')}
                            rows='2'
                            placeholder='One-off builds, long-term support, product iterations'
                          />
                        </div>
                        <p className='text-xs theme-text-muted mt-2'>Separate engagement types with commas.</p>
                      </div>

                      <div className='md:col-span-2'>
                        <label className='block mb-2 theme-text-secondary text-sm'>Availability Details</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaMapMarkerAlt />
                          </span>
                          <textarea
                            name='availabilityDetails'
                            value={formData.availabilityDetails}
                            onChange={handleChange}
                            className={inputClasses('availabilityDetails')}
                            rows='3'
                            placeholder='Available for new work from June, best for async collaboration, weekday calls preferred'
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-5 rounded-xl theme-input border theme-border'>
                    <div className='mb-4'>
                      <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Services & Expertise</p>
                      <p className='text-sm theme-text-secondary'>Describe what you offer, the tools you use, and the expertise areas you want clients to notice first.</p>
                    </div>

                    <div className='grid gap-4'>
                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Services Offered</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaBriefcase />
                          </span>
                          <textarea
                            name='servicesOffered'
                            value={formData.servicesOffered}
                            onChange={handleChange}
                            className={inputClasses('servicesOffered')}
                            rows='3'
                            placeholder='Landing pages, React dashboards, API integrations, design system work'
                          />
                          {errors.servicesOffered && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors.servicesOffered}
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
                          <textarea name='skills' value={formData.skills} onChange={handleChange} className={inputClasses('skills')} rows='3' placeholder='JavaScript, React, UI implementation, API integration' />
                          {errors.skills && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors.skills}
                            </motion.p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Tools & Stack</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaTools />
                          </span>
                          <textarea name='tools' value={formData.tools} onChange={handleChange} className={inputClasses('tools')} rows='2' placeholder='React, Node.js, MongoDB, Figma, Tailwind CSS' />
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Industries</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaBook />
                          </span>
                          <textarea name='industries' value={formData.industries} onChange={handleChange} className={inputClasses('industries')} rows='2' placeholder='SaaS, e-commerce, education, hospitality' />
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Languages</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaLanguage />
                          </span>
                          <textarea name='languages' value={formData.languages} onChange={handleChange} className={inputClasses('languages')} rows='2' placeholder='English (Native), Spanish (Fluent), etc.' />
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Certifications</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaCertificate />
                          </span>
                          <textarea name='certifications' value={formData.certifications} onChange={handleChange} className={inputClasses('certifications')} rows='2' placeholder='List your relevant certifications' />
                        </div>
                      </div>

                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Service Categories</label>
                        <div className='relative'>
                          <span className='absolute left-3 top-4 text-accent text-[16px]'>
                            <FaList />
                          </span>
                          <textarea
                            name='serviceCategories'
                            value={formData.serviceCategories}
                            onChange={handleChange}
                            className={inputClasses('serviceCategories')}
                            rows='2'
                            placeholder='Web Development, Mobile Apps, UI/UX Design, etc.'
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className='p-5 rounded-xl theme-input border theme-border'>
                    <div className='mb-4'>
                      <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>Visibility & Contact Preferences</p>
                      <p className='text-sm theme-text-secondary'>Control what visitors can see and how clients are allowed to reach you.</p>
                    </div>

                    <div className='space-y-4'>
                      <div>
                        <label className='block mb-2 theme-text-secondary text-sm'>Profile Visibility</label>
                        <div className={selectShellClasses('profileVisibility')}>
                          <span className={selectIconClasses}>
                            <FaEye />
                          </span>
                          <select name='profileVisibility' value={formData.profileVisibility} onChange={handleChange} className={selectFieldClasses}>
                            <option value='public'>Public</option>
                            <option value='members'>Members only</option>
                            <option value='private'>Private</option>
                          </select>
                          <span className={selectChevronClasses}>
                            <FaChevronDown />
                          </span>
                        </div>
                      </div>

                      <div className='grid md:grid-cols-2 gap-4'>
                        <label className='flex items-start gap-3 p-4 rounded-lg border dark:border-light/10 border-primary/10'>
                          <input type='checkbox' name='showLocationPublic' checked={formData.showLocationPublic} onChange={handleChange} className={toggleClasses} />
                          <span>
                            <span className='block text-sm theme-text'>Show location publicly</span>
                            <span className='block text-xs theme-text-muted'>Let visitors see your location on your profile.</span>
                          </span>
                        </label>

                        <label className='flex items-start gap-3 p-4 rounded-lg border dark:border-light/10 border-primary/10'>
                          <input type='checkbox' name='showHourlyRate' checked={formData.showHourlyRate} onChange={handleChange} className={toggleClasses} />
                          <span>
                            <span className='block text-sm theme-text'>Show hourly rate publicly</span>
                            <span className='block text-xs theme-text-muted'>Display your rate as part of your public positioning.</span>
                          </span>
                        </label>

                        <label className='flex items-start gap-3 p-4 rounded-lg border dark:border-light/10 border-primary/10'>
                          <input type='checkbox' name='allowDirectMessages' checked={formData.allowDirectMessages} onChange={handleChange} className={toggleClasses} />
                          <span>
                            <span className='block text-sm theme-text'>Allow direct messages</span>
                            <span className='block text-xs theme-text-muted'>Clients can contact you directly from the platform.</span>
                          </span>
                        </label>

                        <label className='flex items-start gap-3 p-4 rounded-lg border dark:border-light/10 border-primary/10'>
                          <input type='checkbox' name='allowProjectInvites' checked={formData.allowProjectInvites} onChange={handleChange} className={toggleClasses} />
                          <span>
                            <span className='block text-sm theme-text'>Allow project invites</span>
                            <span className='block text-xs theme-text-muted'>Clients can invite you to relevant opportunities.</span>
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className='p-5 rounded-xl theme-input border theme-border'>
                    <div className='mb-4'>
                      <p className='text-xs uppercase tracking-wide theme-text-muted mb-2'>External Profiles</p>
                      <label className='block mb-2 theme-text-secondary text-sm'>Platform Links</label>
                      <p className='text-xs theme-text-muted'>Add marketplace profiles if you want clients to see more work history or reviews.</p>
                    </div>
                    <div className='grid md:grid-cols-2 gap-4'>
                      {[
                        { name: 'upworkProfile', placeholder: 'Upwork Profile URL' },
                        { name: 'fiverrProfile', placeholder: 'Fiverr Profile URL' }
                      ].map((platform) => (
                        <div key={platform.name}>
                          <div className='relative'>
                            <span className='absolute left-3 top-4 text-accent text-[16px]'>
                              <FaBriefcase />
                            </span>
                            <input type='url' name={platform.name} value={formData[platform.name]} onChange={handleChange} className={inputClasses(platform.name)} placeholder={platform.placeholder} />
                          </div>
                          {errors[platform.name] && (
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-red-500 text-sm mt-1'>
                              {errors[platform.name]}
                            </motion.p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className='space-y-3'>
              <p className='text-sm theme-text-secondary'>{hasUnsavedChanges ? 'You have profile edits ready to save or reset.' : 'No pending profile changes.'}</p>

              <div className='flex flex-col sm:flex-row gap-4'>
                <motion.button
                  type='button'
                  onClick={handleReset}
                  className='flex-1 bg-gray-500 text-white font-medium py-3 px-6 rounded-lg
              hover:bg-gray-600 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-gray-500/50
              disabled:opacity-50 disabled:cursor-not-allowed'
                  whileHover={hasUnsavedChanges && !isSubmitting ? { scale: 1.02 } : undefined}
                  whileTap={hasUnsavedChanges && !isSubmitting ? { scale: 0.98 } : undefined}
                  disabled={isSubmitting || !hasUnsavedChanges}>
                  Reset Form
                </motion.button>

                <motion.button
                  type='submit'
                  className='flex-1 bg-accent text-white font-medium py-3 px-6 rounded-lg
              hover:bg-accent/90 transition-colors duration-300
              focus:outline-none focus:ring-2 focus:ring-accent/50
              disabled:opacity-50 disabled:cursor-not-allowed'
                  whileHover={hasUnsavedChanges && !isSubmitting ? { scale: 1.02 } : undefined}
                  whileTap={hasUnsavedChanges && !isSubmitting ? { scale: 0.98 } : undefined}
                  disabled={isSubmitting || !hasUnsavedChanges}>
                  {isSubmitting ? 'Saving Changes...' : hasUnsavedChanges ? 'Save Changes' : 'No Changes to Save'}
                </motion.button>
              </div>
            </div>
          </form>
        </>
      )}
    </motion.div>
  )
}

export default ProfileSettings
