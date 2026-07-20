import { useContext } from 'react'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes, FaUpload, FaEuroSign, FaCalendarAlt, FaTag, FaFile } from 'react-icons/fa'
import AuthContext from '../context/AuthContext'
import { createProject, saveProjectDraft, updateProject } from '../services/projectService'
import { toast } from 'react-toastify' // Import toast for notifications

const ProjectModal = ({ isOpen, onClose, onProjectCreated, mode = 'create', initialData = null, onProjectUpdated }) => {
  // Form state
  const initialFormState = {
    title: '',
    description: '',
    category: '',
    priority: 'low',
    skills: [],
    budget: '',
    deadline: '',
    type: 'created',
    status: 'draft',
    attachments: [],
    projectBrief: {
      objective: '',
      deliverables: [],
      scopeNotes: '',
      experienceLevel: 'not_specified',
      duration: 'not_specified',
      workload: 'not_specified',
      startPreference: 'not_specified',
      budgetType: 'not_specified',
      applicationInstructions: ''
    }
  }

  const isEditMode = mode === 'edit'
  const isDraftEdit = isEditMode && initialData?.status === 'draft'
  const isDeadlineOnly = isEditMode && initialData?.status !== 'draft'

  // Replace the current formData state initialization
  const [formData, setFormData] = useState(initialFormState)
  const { currentUser, loading } = useContext(AuthContext)
  const [submitting, setSubmitting] = useState(false) // Add submitting state

  const resetForm = () => {
    setFormData(initialFormState)
    setCurrentStep(1)
    setSkillInput('')
    setDeliverableInput('')
  }

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  // Skill input state
  const [skillInput, setSkillInput] = useState('')
  const [deliverableInput, setDeliverableInput] = useState('')

  // Categories for dropdown
  const categories = ['Web Development', 'Mobile Development', 'UI/UX Design', 'Data Science', 'Machine Learning', 'DevOps', 'Blockchain', 'Content Writing', 'Digital Marketing', 'Other']

  // Priority options
  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBriefChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      projectBrief: {
        ...prev.projectBrief,
        [name]: value
      }
    }))
  }

  // Add validation for current step
  const validateCurrentStep = () => {
    if (isDeadlineOnly) {
      if (currentStep === 4 && !formData.deadline) {
        toast.error('Please select a deadline')
        return false
      }
      return true
    }

    // Step-specific validation
    if (currentStep === 1) {
      if (!formData.title.trim()) {
        toast.error('Please enter a project title')
        return false
      }
      if (!formData.description.trim()) {
        toast.error('Please enter a project description')
        return false
      }
      if (!formData.category) {
        toast.error('Please select a category')
        return false
      }
    } else if (currentStep === 2) {
      if (!formData.projectBrief.objective.trim()) {
        toast.error('Please describe the project objective')
        return false
      }
      if (formData.projectBrief.deliverables.length === 0) {
        toast.error('Please add at least one deliverable')
        return false
      }
    } else if (currentStep === 3) {
      if (formData.skills.length === 0) {
        toast.error('Please add at least one skill')
        return false
      }
    } else if (currentStep === 4) {
      if (!formData.budget) {
        toast.error('Please enter a budget')
        return false
      }
      if (!formData.deadline) {
        toast.error('Please select a deadline')
        return false
      }
    }

    return true
  }

  // Add validation for all steps
  const validateAllSteps = () => {
    if (isDeadlineOnly) {
      if (!formData.deadline) {
        setCurrentStep(4)
        toast.error('Please select a deadline')
        return false
      }
      return true
    }

    if (!formData.title.trim()) {
      setCurrentStep(1)
      toast.error('Please enter a project title')
      return false
    }

    if (!formData.description.trim()) {
      setCurrentStep(1)
      toast.error('Please enter a project description')
      return false
    }

    if (!formData.category) {
      setCurrentStep(1)
      toast.error('Please select a category')
      return false
    }

    if (!formData.projectBrief.objective.trim()) {
      setCurrentStep(2)
      toast.error('Please describe the project objective')
      return false
    }

    if (formData.projectBrief.deliverables.length === 0) {
      setCurrentStep(2)
      toast.error('Please add at least one deliverable')
      return false
    }

    if (formData.skills.length === 0) {
      setCurrentStep(3)
      toast.error('Please add at least one skill')
      return false
    }

    if (!formData.budget) {
      setCurrentStep(4)
      toast.error('Please enter a budget')
      return false
    }

    if (!formData.deadline) {
      setCurrentStep(4)
      toast.error('Please select a deadline')
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

  const handleAddDeliverable = () => {
    if (deliverableInput.trim() && !formData.projectBrief.deliverables.includes(deliverableInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        projectBrief: {
          ...prev.projectBrief,
          deliverables: [...prev.projectBrief.deliverables, deliverableInput.trim()]
        }
      }))
      setDeliverableInput('')
    }
  }

  const handleRemoveDeliverable = (deliverableToRemove) => {
    setFormData((prev) => ({
      ...prev,
      projectBrief: {
        ...prev.projectBrief,
        deliverables: prev.projectBrief.deliverables.filter((deliverable) => deliverable !== deliverableToRemove)
      }
    }))
  }

  const handleDeliverableKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddDeliverable()
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

  // Form submission handlers
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateAllSteps()) {
      return
    }

    try {
      setSubmitting(true)

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        priority: formData.priority,
        skills: formData.skills,
        budget: parseFloat(formData.budget),
        deadline: formData.deadline,
        status: 'active',
        attachments: formData.attachments,
        projectBrief: formData.projectBrief
      }

      console.log('Sending project data:', projectData)

      if (isEditMode && initialData) {
        const updatePayload = isDeadlineOnly
          ? { deadline: formData.deadline }
          : {
              title: formData.title.trim(),
              description: formData.description.trim(),
              category: formData.category,
              skills: formData.skills,
              budget: parseFloat(formData.budget),
              priority: formData.priority,
              deadline: formData.deadline,
              attachments: formData.attachments,
              projectBrief: formData.projectBrief
            }

        await updateProject(initialData._id, updatePayload)

        onClose()
        if (onProjectUpdated) onProjectUpdated()
        toast.success('Project updated successfully!')
        return
      }

      const createdProject = await createProject(projectData)
      console.log('Project created:', createdProject)

      resetForm()
      onClose()

      if (onProjectCreated) {
        onProjectCreated()
      }

      toast.success('Project published successfully!')
    } catch (error) {
      console.error('Error creating project:', error)
      toast.error('Failed to create project. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSaveDraft = async () => {
    if (!formData.title.trim()) {
      setCurrentStep(1)
      toast.error('Please enter a project title')
      return
    }

    try {
      setSubmitting(true)

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || '',
        category: formData.category || '',
        skills: formData.skills,
        priority: formData.priority,
        budget: formData.budget ? parseFloat(formData.budget) : 0,
        deadline: formData.deadline || new Date().toISOString().split('T')[0],
        status: 'draft',
        attachments: formData.attachments,
        projectBrief: formData.projectBrief
      }

      console.log('Saving draft:', projectData)

      const savedDraft = await saveProjectDraft(projectData)
      console.log('Draft saved:', savedDraft)

      resetForm()
      onClose()

      if (onProjectCreated) {
        onProjectCreated()
      }

      toast.success('Draft saved successfully!')
    } catch (err) {
      console.error('Error saving draft:', err)
      toast.error('Failed to save draft. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (!isOpen) return

    if (isEditMode && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        skills: Array.isArray(initialData.skills) ? initialData.skills : [],
        priority: initialData.priority || 'low',
        budget: initialData.budget ? String(initialData.budget) : '',
        deadline: initialData.deadline ? initialData.deadline.split('T')[0] : '',
        type: initialData.type || 'created',
        status: initialData.status || 'draft',
        attachments: [],
        projectBrief: {
          objective: initialData.projectBrief?.objective || '',
          deliverables: Array.isArray(initialData.projectBrief?.deliverables) ? initialData.projectBrief.deliverables : [],
          scopeNotes: initialData.projectBrief?.scopeNotes || '',
          experienceLevel: initialData.projectBrief?.experienceLevel || 'not_specified',
          duration: initialData.projectBrief?.duration || 'not_specified',
          workload: initialData.projectBrief?.workload || 'not_specified',
          startPreference: initialData.projectBrief?.startPreference || 'not_specified',
          budgetType: initialData.projectBrief?.budgetType || 'not_specified',
          applicationInstructions: initialData.projectBrief?.applicationInstructions || ''
        }
      })
      setCurrentStep(isDeadlineOnly ? 4 : 1)
      setSkillInput('')
      setDeliverableInput('')
    } else {
      resetForm()
    }
  }, [isOpen, isEditMode, initialData, isDeadlineOnly])

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
                <h2 className='text-2xl font-bold theme-text'>{isEditMode ? 'Edit Project' : 'Create New Project'}</h2>
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
                      <span>Scope</span>
                      <span>Requirements</span>
                      <span>Timeline</span>
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
                            disabled={isDeadlineOnly}
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
                            disabled={isDeadlineOnly}
                          />
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                          {/* Project Category */}
                          <div className='md:col-span-2'>
                            <label htmlFor='category' className='block text-sm font-medium theme-text mb-1'>
                              Category*
                            </label>
                            <select
                              id='category'
                              name='category'
                              value={formData.category}
                              onChange={handleChange}
                              required
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
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

                          {/* Project Priority */}
                          <div className='md:col-span-1'>
                            <label htmlFor='priority' className='block text-sm font-medium theme-text mb-1'>
                              Priority*
                            </label>
                            <select
                              id='priority'
                              name='priority'
                              value={formData.priority}
                              onChange={handleChange}
                              required
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              {priorityOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className='space-y-5'>
                        <h3 className='text-lg font-medium theme-text mb-4'>Project Scope</h3>

                        <div>
                          <label htmlFor='objective' className='block text-sm font-medium theme-text mb-1'>
                            Project Objective*
                          </label>
                          <textarea
                            id='objective'
                            name='objective'
                            value={formData.projectBrief.objective}
                            onChange={handleBriefChange}
                            rows={3}
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                            placeholder='What should this project achieve for the client or users?'
                            disabled={isDeadlineOnly}
                          />
                        </div>

                        <div>
                          <label htmlFor='deliverableInput' className='block text-sm font-medium theme-text mb-1'>
                            Deliverables*
                          </label>
                          <div className='flex gap-2'>
                            <div className='flex-1'>
                              <input
                                type='text'
                                id='deliverableInput'
                                value={deliverableInput}
                                onChange={(e) => setDeliverableInput(e.target.value)}
                                onKeyDown={handleDeliverableKeyPress}
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                                placeholder='E.g., responsive landing page, admin dashboard, payment integration'
                                disabled={isDeadlineOnly}
                              />
                            </div>
                            <motion.button type='button' onClick={handleAddDeliverable} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              Add
                            </motion.button>
                          </div>

                          <div className='flex flex-wrap gap-2 min-h-[80px] mt-3'>
                            {formData.projectBrief.deliverables.map((deliverable, index) => (
                              <div key={index} className='flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full'>
                                <span>{deliverable}</span>
                                {!isDeadlineOnly && (
                                  <button type='button' onClick={() => handleRemoveDeliverable(deliverable)} className='text-accent hover:text-accent/80'>
                                    <FaTimes size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {formData.projectBrief.deliverables.length === 0 && <p className='text-sm theme-text-secondary italic'>No deliverables added yet</p>}
                          </div>
                        </div>

                        <div>
                          <label htmlFor='scopeNotes' className='block text-sm font-medium theme-text mb-1'>
                            Scope Notes
                          </label>
                          <textarea
                            id='scopeNotes'
                            name='scopeNotes'
                            value={formData.projectBrief.scopeNotes}
                            onChange={handleBriefChange}
                            rows={4}
                            className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                            placeholder='Clarify constraints, exclusions, priorities, or reference expectations'
                            disabled={isDeadlineOnly}
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className='space-y-5'>
                        <h3 className='text-lg font-medium theme-text mb-4'>Requirements</h3>

                        <div>
                          <label htmlFor='skillInput' className='block text-sm font-medium theme-text mb-1'>
                            Required Skills*
                          </label>
                          <div className='flex gap-2'>
                            <div className='flex-1'>
                              <input
                                type='text'
                                id='skillInput'
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={handleSkillKeyPress}
                                className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                                placeholder='E.g., React, Node.js, UI Design'
                                disabled={isDeadlineOnly}
                              />
                            </div>
                            <motion.button type='button' onClick={handleAddSkill} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              Add
                            </motion.button>
                          </div>

                          <div className='flex flex-wrap gap-2 min-h-[80px] mt-3'>
                            {formData.skills.map((skill, index) => (
                              <div key={index} className='flex items-center gap-2 px-3 py-1 bg-accent/10 text-accent rounded-full'>
                                <FaTag className='text-xs' />
                                <span>{skill}</span>
                                {!isDeadlineOnly && (
                                  <button type='button' onClick={() => handleRemoveSkill(skill)} className='text-accent hover:text-accent/80'>
                                    <FaTimes size={12} />
                                  </button>
                                )}
                              </div>
                            ))}
                            {formData.skills.length === 0 && <p className='text-sm theme-text-secondary italic'>No skills added yet</p>}
                          </div>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label htmlFor='experienceLevel' className='block text-sm font-medium theme-text mb-1'>
                              Experience Level
                            </label>
                            <select
                              id='experienceLevel'
                              name='experienceLevel'
                              value={formData.projectBrief.experienceLevel}
                              onChange={handleBriefChange}
                              className='theme-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              <option value='not_specified'>Not specified</option>
                              <option value='junior'>Junior</option>
                              <option value='mid'>Mid</option>
                              <option value='senior'>Senior</option>
                              <option value='expert'>Expert</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor='applicationInstructions' className='block text-sm font-medium theme-text mb-1'>
                              Application Instructions
                            </label>
                            <textarea
                              id='applicationInstructions'
                              name='applicationInstructions'
                              value={formData.projectBrief.applicationInstructions}
                              onChange={handleBriefChange}
                              rows={3}
                              className='w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              placeholder='Ask for portfolio links, relevant examples, or a short intro'
                              disabled={isDeadlineOnly}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className='space-y-5'>
                        <h3 className='text-lg font-medium theme-text mb-4'>Timeline & Budget</h3>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                          <div>
                            <label htmlFor='budget' className='block text-sm font-medium theme-text mb-1'>
                              Budget (EUR)*
                            </label>
                            <div className='relative'>
                              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                                <FaEuroSign className='text-gray-400' />
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
                                disabled={isDeadlineOnly}
                              />
                            </div>
                          </div>

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

                          <div>
                            <label htmlFor='budgetType' className='block text-sm font-medium theme-text mb-1'>
                              Budget Type
                            </label>
                            <select
                              id='budgetType'
                              name='budgetType'
                              value={formData.projectBrief.budgetType}
                              onChange={handleBriefChange}
                              className='theme-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              <option value='not_specified'>Not specified</option>
                              <option value='fixed'>Fixed</option>
                              <option value='hourly'>Hourly</option>
                              <option value='negotiable'>Negotiable</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor='startPreference' className='block text-sm font-medium theme-text mb-1'>
                              Start Preference
                            </label>
                            <select
                              id='startPreference'
                              name='startPreference'
                              value={formData.projectBrief.startPreference}
                              onChange={handleBriefChange}
                              className='theme-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              <option value='not_specified'>Not specified</option>
                              <option value='immediately'>Immediately</option>
                              <option value='this_week'>This week</option>
                              <option value='within_2_weeks'>Within 2 weeks</option>
                              <option value='flexible'>Flexible</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor='duration' className='block text-sm font-medium theme-text mb-1'>
                              Estimated Duration
                            </label>
                            <select
                              id='duration'
                              name='duration'
                              value={formData.projectBrief.duration}
                              onChange={handleBriefChange}
                              className='theme-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              <option value='not_specified'>Not specified</option>
                              <option value='less_than_1_week'>Less than 1 week</option>
                              <option value='1_to_2_weeks'>1 to 2 weeks</option>
                              <option value='2_to_4_weeks'>2 to 4 weeks</option>
                              <option value='1_to_3_months'>1 to 3 months</option>
                              <option value='3_plus_months'>3+ months</option>
                              <option value='ongoing'>Ongoing</option>
                            </select>
                          </div>

                          <div>
                            <label htmlFor='workload' className='block text-sm font-medium theme-text mb-1'>
                              Workload
                            </label>
                            <select
                              id='workload'
                              name='workload'
                              value={formData.projectBrief.workload}
                              onChange={handleBriefChange}
                              className='theme-select w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
                              disabled={isDeadlineOnly}>
                              <option value='not_specified'>Not specified</option>
                              <option value='under_10_hours'>Under 10 hrs/week</option>
                              <option value='10_to_20_hours'>10 to 20 hrs/week</option>
                              <option value='20_to_30_hours'>20 to 30 hrs/week</option>
                              <option value='30_plus_hours'>30+ hrs/week</option>
                              <option value='full_time'>Full time</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className='space-y-4'>
                        <h3 className='text-lg font-medium theme-text mb-4'>Attachments</h3>

                        {!isDeadlineOnly && (
                          <div className='border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center'>
                            <input type='file' id='attachments' multiple onChange={handleFileChange} className='hidden' />
                            <label htmlFor='attachments' className='cursor-pointer flex flex-col items-center justify-center py-4'>
                              <FaUpload className='text-gray-400 text-3xl mb-2' />
                              <p className='theme-text font-medium'>Click to upload files</p>
                              <p className='text-sm theme-text-secondary mt-1'>or drag and drop files here</p>
                            </label>
                          </div>
                        )}

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
                          {!isEditMode && (
                            <motion.button
                              type='button'
                              onClick={handleSaveDraft}
                              className='px-4 py-2 border border-accent bg-accent/10 text-accent rounded-lg hover:bg-accent/20'
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}>
                              Save as Draft
                            </motion.button>
                          )}
                          <motion.button type='submit' className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} disabled={submitting}>
                            {submitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Publish Project'}
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
