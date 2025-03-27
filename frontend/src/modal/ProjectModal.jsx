import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaUpload, FaDollarSign, FaCalendarAlt, FaTag, FaFile } from 'react-icons/fa'

const ProjectModal = ({ isOpen, onClose }) => {
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skills: [],
    budget: '',
    deadline: '',
    type: 'created', // Default to 'created' since user is creating a project
    status: 'draft', // Default status is draft
    attachments: []
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 4

  // Skill input state
  const [skillInput, setSkillInput] = useState('')

  // Categories for dropdown
  const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Blockchain', 'Content Writing', 'Digital Marketing', 'Other']

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Add validation for current step
  const validateCurrentStep = () => {
    if (currentStep === 1) {
      // Validate basic information
      if (!formData.title.trim()) {
        alert('Please enter a project title')
        return false
      }
      if (!formData.description.trim()) {
        alert('Please enter a project description')
        return false
      }
      if (!formData.category) {
        alert('Please select a category')
        return false
      }
    } else if (currentStep === 2) {
      // Validate skills
      if (formData.skills.length === 0) {
        alert('Please add at least one skill')
        return false
      }
    } else if (currentStep === 3) {
      // Validate budget and timeline
      if (!formData.budget) {
        alert('Please enter a budget')
        return false
      }
      if (!formData.deadline) {
        alert('Please select a deadline')
        return false
      }
    }
    return true
  }

  // Add validation for all steps
  const validateAllSteps = () => {
    // Check basic information
    if (!formData.title.trim()) {
      setCurrentStep(1)
      alert('Please enter a project title')
      return false
    }
    if (!formData.description.trim()) {
      setCurrentStep(1)
      alert('Please enter a project description')
      return false
    }
    if (!formData.category) {
      setCurrentStep(1)
      alert('Please select a category')
      return false
    }

    // Check skills
    if (formData.skills.length === 0) {
      setCurrentStep(2)
      alert('Please add at least one skill')
      return false
    }

    // Check budget and timeline
    if (!formData.budget) {
      setCurrentStep(3)
      alert('Please enter a budget')
      return false
    }
    if (!formData.deadline) {
      setCurrentStep(3)
      alert('Please select a deadline')
      return false
    }

    return true
  }

  // Navigation functions - updated with validation
  const nextStep = () => {
    if (validateCurrentStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1))

  // Handle skill addition
  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput('')
    }
  }

  // Handle skill removal
  const handleRemoveSkill = (skillToRemove) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills.filter((skill) => skill !== skillToRemove)
    }))
  }

  // Handle skill input keypress (add on Enter)
  const handleSkillKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  // Handle file selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }))
  }

  // Remove attachment
  const handleRemoveAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }))
  }

  // Form submission handlers - updated with validation
  const handleSaveDraft = () => {
    // For drafts, we can be more lenient, but at minimum require a title
    if (!formData.title.trim()) {
      setCurrentStep(1)
      alert('Please enter a project title')
      return
    }

    console.log('Saving draft:', formData)
    // Here you would save the draft to the database
    onClose()
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!validateAllSteps()) {
      return
    }

    console.log('Submitting project:', { ...formData, status: 'active' })
    // Here you would submit the project to the database
    onClose()
  }

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }

    // Cleanup function
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  // Handle escape key press to close modal
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscKey)
    return () => window.removeEventListener('keydown', handleEscKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div className='fixed inset-0 bg-black/50 z-40 backdrop-blur-sm' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />

          {/* Modal */}
          <motion.div className='fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={(e) => e.stopPropagation()}>
            <motion.div
              className='bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto'
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className='flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700'>
                <h2 className='text-2xl font-bold theme-text'>Create New Project</h2>
                <button onClick={onClose} className='text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors'>
                  <FaTimes size={24} />
                </button>
              </div>

              {/* Modal Body - Form Container */}
              <div className='p-6'>
                <form onSubmit={handleSubmit}>
                  {/* Step indicator */}
                  <div className='mb-6'>
                    <div className='flex items-center justify-between'>
                      {[...Array(totalSteps)].map((_, i) => (
                        <React.Fragment key={i}>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              i + 1 === currentStep ? 'bg-accent text-white' : i + 1 < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                            }`}>
                            {i + 1 < currentStep ? '✓' : i + 1}
                          </div>
                          {i < totalSteps - 1 && <div className={`flex-1 h-1 ${i + 1 < currentStep ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className='flex justify-between mt-2 text-sm theme-text-secondary'>
                      <span>Basics</span>
                      <span>Skills</span>
                      <span>Budget</span>
                      <span>Files</span>
                    </div>
                  </div>

                  {/* Step content */}
                  <div className='min-h-[300px]'>
                    {currentStep === 1 && (
                      <div className='space-y-4'>
                        {/* Basic Information fields */}
                        <h3 className='text-lg font-medium theme-text mb-4'>Basic Information</h3>
                        {/* Project Title */}
                        <div>
                          <label htmlFor='title' className='block text-sm font-medium theme-text mb-1'>
                            Project Title*
                          </label>
                          <input
                            type='text'
                            id='title'
                            name='title'
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                            placeholder='E.g., E-commerce Website Development'
                          />
                        </div>

                        {/* Project Description */}
                        <div>
                          <label htmlFor='description' className='block text-sm font-medium theme-text mb-1'>
                            Project Description*
                          </label>
                          <textarea
                            id='description'
                            name='description'
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                            placeholder='Describe your project in detail...'
                          />
                        </div>

                        {/* Project Category */}
                        <div>
                          <label htmlFor='category' className='block text-sm font-medium theme-text mb-1'>
                            Category*
                          </label>
                          <select
                            id='category'
                            name='category'
                            value={formData.category}
                            onChange={handleChange}
                            required
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
                            <option value='' disabled>
                              Select a category
                            </option>
                            {categories.map((category, index) => (
                              <option key={index} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className='space-y-4'>
                        {/* Skills Section */}
                        <h3 className='text-lg font-medium theme-text mb-4'>Required Skills</h3>
                        {/* Skills Input */}
                        <div className='flex gap-2'>
                          <div className='flex-1'>
                            <input
                              type='text'
                              id='skillInput'
                              value={skillInput}
                              onChange={(e) => setSkillInput(e.target.value)}
                              onKeyPress={handleSkillKeyPress}
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              placeholder='E.g., React, Node.js, UI Design'
                            />
                          </div>
                          <motion.button type='button' onClick={handleAddSkill} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Add
                          </motion.button>
                        </div>

                        {/* Skills Tags */}
                        <div className='flex flex-wrap gap-2 min-h-[100px]'>
                          {formData.skills.map((skill, index) => (
                            <div key={index} className='flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full'>
                              <FaTag className='text-xs' />
                              <span>{skill}</span>
                              <button type='button' onClick={() => handleRemoveSkill(skill)} className='text-accent hover:text-accent/80'>
                                <FaTimes size={12} />
                              </button>
                            </div>
                          ))}
                          {formData.skills.length === 0 && <p className='text-sm theme-text-secondary italic'>No skills added yet</p>}
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className='space-y-4'>
                        {/* Budget and Timeline Section */}
                        <h3 className='text-lg font-medium theme-text mb-4'>Budget & Timeline</h3>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          {/* Budget */}
                          <div>
                            <label htmlFor='budget' className='block text-sm font-medium theme-text mb-1'>
                              Budget (EUR)*
                            </label>
                            <div className='relative'>
                              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaDollarSign className='text-gray-400' />
                              </div>
                              <input
                                type='number'
                                id='budget'
                                name='budget'
                                value={formData.budget}
                                onChange={handleChange}
                                required
                                min='0'
                                className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                                placeholder='1000'
                              />
                            </div>
                          </div>

                          {/* Deadline */}
                          <div>
                            <label htmlFor='deadline' className='block text-sm font-medium theme-text mb-1'>
                              Deadline*
                            </label>
                            <div className='relative'>
                              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaCalendarAlt className='text-gray-400' />
                              </div>
                              <input
                                type='date'
                                id='deadline'
                                name='deadline'
                                value={formData.deadline}
                                onChange={handleChange}
                                required
                                className='w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className='space-y-4'>
                        {/* Attachments Section */}
                        <h3 className='text-lg font-medium theme-text mb-4'>Attachments</h3>

                        {/* File Upload */}
                        <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center'>
                          <input type='file' id='attachments' multiple onChange={handleFileChange} className='hidden' />
                          <label htmlFor='attachments' className='cursor-pointer flex flex-col items-center justify-center py-4'>
                            <FaUpload className='text-gray-400 text-3xl mb-2' />
                            <p className='theme-text font-medium'>Click to upload files</p>
                            <p className='text-sm theme-text-secondary mt-1'>or drag and drop files here</p>
                          </label>
                        </div>

                        {/* Attachments List */}
                        {formData.attachments.length > 0 && (
                          <div className='mt-4 space-y-2'>
                            <h4 className='text-sm font-medium theme-text'>Uploaded Files:</h4>
                            <ul className='space-y-2 max-h-[150px] overflow-y-auto'>
                              {formData.attachments.map((file, index) => (
                                <li key={index} className='flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-lg'>
                                  <div className='flex items-center'>
                                    <FaFile className='text-accent mr-2' />
                                    <span className='text-sm theme-text'>{file.name}</span>
                                  </div>
                                  <button type='button' onClick={() => handleRemoveAttachment(index)} className='text-red-500 hover:text-red-700'>
                                    <FaTimes />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Navigation buttons */}
                  <div className='mt-8 flex justify-between'>
                    <div>
                      {currentStep > 1 && (
                        <motion.button
                          type='button'
                          onClick={prevStep}
                          className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg theme-text hover:bg-gray-50 dark:hover:bg-gray-700'
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}>
                          Back
                        </motion.button>
                      )}
                    </div>
                    <div className='flex space-x-3'>
                      <motion.button
                        type='button'
                        onClick={onClose}
                        className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg theme-text hover:bg-gray-50 dark:hover:bg-gray-700'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        Cancel
                      </motion.button>

                      {currentStep < totalSteps ? (
                        <motion.button type='button' onClick={nextStep} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          Next
                        </motion.button>
                      ) : (
                        <>
                          <motion.button
                            type='button'
                            onClick={handleSaveDraft}
                            className='px-4 py-2 border border-accent bg-accent/10 text-accent rounded-lg hover:bg-accent/20'
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}>
                            Save as Draft
                          </motion.button>
                          <motion.button type='submit' className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            Post Project
                          </motion.button>
                        </>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default ProjectModal
