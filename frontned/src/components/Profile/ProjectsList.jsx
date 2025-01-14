import React from 'react'
import { FaClock, FaCheck, FaPause, FaTrash } from 'react-icons/fa'

const ProjectsList = () => {
  const projects = [
    {
      id: 1,
      title: 'E-commerce Website Development',
      status: 'active',
      budget: '$5,000',
      deadline: '2024-03-15',
      progress: 75
    },
    {
      id: 2,
      title: 'Mobile App UI Design',
      status: 'completed',
      budget: '$3,000',
      deadline: '2024-02-28',
      progress: 100
    },
    {
      id: 3,
      title: 'Backend API Development',
      status: 'paused',
      budget: '$4,500',
      deadline: '2024-04-01',
      progress: 30
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

  return (
    <div className='space-y-8'>
      <h2 className='text-2xl font-bold theme-text'>My Projects</h2>

      <div className='grid gap-6'>
        {projects.map((project) => (
          <div key={project.id} className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300'>
            <div className='flex justify-between items-start'>
              <div>
                <h3 className='text-xl font-semibold theme-text mb-2'>{project.title}</h3>
                <div className='flex items-center gap-2 theme-text-secondary'>
                  {getStatusIcon(project.status)}
                  <span className='capitalize'>{project.status}</span>
                </div>
              </div>
              <div className='text-right'>
                <div className='theme-text font-bold'>{project.budget}</div>
                <div className='theme-text-secondary text-sm'>Due: {project.deadline}</div>
              </div>
            </div>

            <div className='mt-4'>
              <div className='flex justify-between mb-2'>
                <span className='theme-text-secondary text-sm'>Progress</span>
                <span className='theme-text-secondary text-sm'>{project.progress}%</span>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                <div className='bg-accent h-2.5 rounded-full transition-all duration-300' style={{ width: `${project.progress}%` }}></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ProjectsList
