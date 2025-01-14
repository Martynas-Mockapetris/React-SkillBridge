import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaClock, FaCheck, FaPause, FaEye, FaBriefcase, FaLightbulb } from 'react-icons/fa'

const ProjectsList = () => {
  const navigate = useNavigate()
  const [projectType, setProjectType] = useState('all')

  const projects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      type: 'freelance',
      status: 'active',
      budget: '$5,000',
      deadline: '2024-03-15',
      progress: 75,
      description: 'Full-stack e-commerce platform with payment integration'
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      type: 'created',
      status: 'completed',
      budget: '$3,000',
      deadline: '2024-02-28',
      progress: 100,
      description: 'UI/UX design for iOS and Android application'
    },
    {
      id: 3,
      title: 'Backend API Development',
      type: 'created',
      status: 'paused',
      budget: '$4,500',
      deadline: '2024-04-01',
      progress: 30,
      description: 'RESTful API development with Node.js and Express'
    }
  ]

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaClock className='text-blue-500' />
      case 'completed':
        return <FaCheck className='text-green-500' />
      case 'paused':
        return <FaPause className='text-yellow-500' />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-500'
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const filteredProjects = projectType === 'all' ? projects : projects.filter((project) => project.type === projectType)

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div className='flex justify-between items-center' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className='text-2xl font-bold theme-text'>My Projects</h2>
        <motion.button
          onClick={() => navigate('/projects/new')}
          className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300'
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}>
          New Project
        </motion.button>
      </motion.div>

      {/* Project Type Filter */}
      <motion.div className='flex gap-4 flex-wrap' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
        <motion.button
          onClick={() => setProjectType('all')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'all' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          All Projects
        </motion.button>
        <motion.button
          onClick={() => setProjectType('freelance')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'freelance' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaBriefcase />
          Freelance Work
        </motion.button>
        <motion.button
          onClick={() => setProjectType('created')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'created' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaLightbulb />
          My Listings
        </motion.button>
      </motion.div>

      <motion.div className='grid gap-6' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            whileHover={{ scale: 1.01 }}>
            <div className='flex justify-between items-start'>
              <div className='flex-1'>
                <div className='flex items-center gap-3 mb-2'>
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}>
                    {project.type === 'freelance' ? <FaBriefcase className='text-accent text-xl' /> : <FaLightbulb className='text-accent text-xl' />}
                  </motion.div>
                  <h3 className='text-xl font-semibold theme-text'>{project.title}</h3>
                </div>
                <p className='theme-text-secondary text-sm mb-3'>{project.description}</p>
                <div className='flex items-center gap-4'>
                  <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                    {getStatusIcon(project.status)}
                    <span className='capitalize text-sm'>{project.status}</span>
                  </div>
                  <div className='theme-text-secondary text-sm'>Due: {project.deadline}</div>
                </div>
              </div>
              <div className='text-right'>
                <div className='theme-text font-bold'>{project.budget}</div>
                <motion.button
                  onClick={() => navigate(`/projects/${project.id}`)}
                  className='mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300'
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}>
                  <FaEye />
                  <span>View</span>
                </motion.button>
              </div>
            </div>

            <div className='mt-6'>
              <div className='flex justify-between mb-2'>
                <span className='theme-text-secondary text-sm'>Progress</span>
                <span className='theme-text-secondary text-sm'>{project.progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                <motion.div className='bg-accent h-2.5 rounded-full' initial={{ width: 0 }} animate={{ width: `${project.progress}%` }} transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

export default ProjectsList
