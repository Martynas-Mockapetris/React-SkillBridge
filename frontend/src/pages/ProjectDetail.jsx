import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaClock, FaDollarSign, FaUser, FaTags } from 'react-icons/fa'
import molecularPattern from '../assets/molecular-pattern.svg'

const ProjectDetail = () => {
  const { id } = useParams() // Capture project ID from URL parameter
  const navigate = useNavigate()

  const [project, setProject] = useState(null) // Project data state
  const [loading, setLoading] = useState(true) // Loading indicator
  const [error, setError] = useState(null) // Error handling

  useEffect(() => {
    // Placeholder: simulate loading
    setLoading(true)

    // Mock data for now - will replace with API call
    setTimeout(() => {
      setProject({
        id: id,
        title: 'Sample Project',
        description: 'This is a placeholder. Real data will be fetched in the next commit.',
        category: 'Web Development',
        budget: 5000,
        deadline: new Date(),
        skills: ['React', 'Node.js'],
        status: 'active'
      })
      setLoading(false)
    }, 500)
  }, [id]) // Re-fetch if ID changes

  // Handle back navigation
  const handleBack = () => {
    navigate(-1) // Go back to previous page
  }

  // Loading state
  if (loading) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
          </div>
        </div>
      </section>
    )
  }

  // Error state
  if (error) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex flex-col items-center justify-center min-h-[400px]'>
            <p className='text-red-500 text-xl mb-4'>{error}</p>
            <button onClick={handleBack} className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
              Go Back
            </button>
          </div>
        </div>
      </section>
    )
  }

  // No project found
  if (!project) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex flex-col items-center justify-center min-h-[400px]'>
            <p className='theme-text text-xl mb-4'>Project not found</p>
            <button onClick={handleBack} className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
              Go Back
            </button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className='w-full theme-bg relative z-[1] pt-[80px]'>
      {/* Molecular patterns for background consistency */}
      <div className='absolute inset-0 overflow-hidden backdrop-blur-[100px]'>
        <div className='absolute -left-20 top-10 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[500px] h-[500px] rotate-[40deg]' />
        </div>
        <div className='absolute right-0 bottom-20 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-50deg]' />
        </div>
      </div>

      <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
        {/* Back Button */}
        <motion.button
          onClick={handleBack}
          className='flex items-center gap-2 mb-6 theme-text-secondary hover:text-accent transition-all'
          whileHover={{ x: -5 }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}>
          <FaArrowLeft />
          <span>Back</span>
        </motion.button>

        {/* Project Header */}
        <motion.div className='mb-8' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className='text-4xl font-bold theme-text mb-2'>{project.title}</h1>
          <p className='theme-text-secondary flex items-center gap-2'>
            <FaTags />
            {project.category}
          </p>
        </motion.div>

        {/* Project Content */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Main Content */}
          <motion.div className='lg:col-span-2 space-y-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            {/* Description Section */}
            <div className='theme-card p-6 rounded-lg'>
              <h2 className='text-2xl font-semibold theme-text mb-4'>Description</h2>
              <p className='theme-text-secondary leading-relaxed'>{project.description}</p>
            </div>

            {/* Skills Required */}
            <div className='theme-card p-6 rounded-lg'>
              <h2 className='text-2xl font-semibold theme-text mb-4'>Skills Required</h2>
              <div className='flex flex-wrap gap-2'>
                {project.skills &&
                  project.skills.map((skill, index) => (
                    <span key={index} className='px-3 py-1 bg-accent/10 text-accent rounded-full text-sm'>
                      {skill}
                    </span>
                  ))}
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div className='space-y-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            {/* Project Details Card */}
            <div className='theme-card p-6 rounded-lg space-y-4'>
              <h3 className='text-xl font-semibold theme-text mb-4'>Project Details</h3>

              {/* Budget */}
              <div className='flex items-center gap-3 theme-text-secondary'>
                <FaDollarSign className='text-accent' />
                <div>
                  <p className='text-sm'>Budget</p>
                  <p className='text-lg font-semibold theme-text'>${project.budget}</p>
                </div>
              </div>

              {/* Deadline */}
              <div className='flex items-center gap-3 theme-text-secondary'>
                <FaClock className='text-accent' />
                <div>
                  <p className='text-sm'>Deadline</p>
                  <p className='text-lg font-semibold theme-text'>{new Date(project.deadline).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Status */}
              <div className='flex items-center gap-3 theme-text-secondary'>
                <FaUser className='text-accent' />
                <div>
                  <p className='text-sm'>Status</p>
                  <p className='text-lg font-semibold capitalize theme-text'>{project.status}</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='theme-card p-6 rounded-lg space-y-3'>
              <button className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>Contact Creator</button>
              <button className='w-full py-3 border-2 border-accent text-accent rounded-lg hover:bg-accent/10 transition-all'>Save Project</button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ProjectDetail
