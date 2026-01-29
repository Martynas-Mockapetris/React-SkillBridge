import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaClock, FaCheck, FaPause, FaEye, FaBriefcase, FaLightbulb, FaHeart, FaSpinner, FaSearch, FaTimes, FaArchive } from 'react-icons/fa'
import ProjectModal from '../../modal/ProjectModal'
import { useAuth } from '../../context/AuthContext' // Import useAuth hook
import { getUserProjects, getInterestedProjects, removeFromInterested, removeAssignee } from '../../services/projectService'
import { formatStatus } from '../../utils/formatters'

const ProjectsList = () => {
  const navigate = useNavigate()
  const { currentUser } = useAuth() // Get the current user
  const [projectType, setProjectType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [projects, setProjects] = useState([]) // State for projects
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState(null) // Error state
  const [selectedProject, setSelectedProject] = useState(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects()
  }, [])

  // Function to fetch projects
  const fetchProjects = async () => {
    try {
      setLoading(true)

      // Fetch both created projects and interested projects
      const [createdProjects, interestedProjects] = await Promise.all([getUserProjects(), getInterestedProjects()])

      // Combine and remove duplicates (in case user created a project they're also interested in)
      const allProjects = [...createdProjects]

      interestedProjects.forEach((interestedProject) => {
        if (!allProjects.some((p) => p._id === interestedProject._id)) {
          allProjects.push(interestedProject)
        }
      })

      setProjects(allProjects)
      setError(null)
    } catch (err) {
      console.error('Error fetching projects:', err)
      setError('Failed to load projects. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <FaClock className='text-blue-500' />
      case 'in_progress':
        return <FaSpinner className='text-purple-500' />
      case 'under_review':
        return <FaSearch className='text-orange-500' />
      case 'completed':
        return <FaCheck className='text-green-500' />
      case 'paused':
        return <FaPause className='text-yellow-500' />
      case 'cancelled':
        return <FaTimes className='text-red-500' />
      case 'archived':
        return <FaArchive className='text-gray-500' />
      case 'draft':
        return <FaPause className='text-yellow-500' />
      default:
        return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-500/10 text-blue-500'
      case 'in_progress':
        return 'bg-purple-500/10 text-purple-500'
      case 'under_review':
        return 'bg-orange-500/10 text-orange-500'
      case 'completed':
        return 'bg-green-500/10 text-green-500'
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-500'
      case 'cancelled':
        return 'bg-red-500/10 text-red-500'
      case 'archived':
        return 'bg-gray-500/10 text-gray-500'
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const isCreator = (project) => project.user._id === currentUser._id || project.user === currentUser._id

  const isInterested = (project) =>
    project.interestedUsers?.some((u) => {
      const userId = u.userId._id ? u.userId._id : u.userId
      return userId === currentUser._id
    })

  const isAssignee = (project) => (project.assignee?._id ? project.assignee._id === currentUser._id : project.assignee === currentUser._id)

  // Determine project type based on relationship to current user
  const getProjectType = (project) => {
    if (isCreator(project)) return 'created'
    if (isAssignee(project)) return 'freelance' // assigned work
    if (isInterested(project)) return 'interested' // contacted but not assigned
    return 'other'
  }

  const filteredProjects = projectType === 'all' ? projects : projects.filter((project) => getProjectType(project) === projectType)

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div className='flex justify-between items-center' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className='text-2xl font-bold theme-text'>My Projects</h2>
        <motion.button onClick={openModal} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          New Project
        </motion.button>
      </motion.div>

      {/* Project Modal - Pass fetchProjects function to refresh after creation */}
      <ProjectModal isOpen={isModalOpen} onClose={closeModal} onProjectCreated={fetchProjects} />

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
        <motion.button
          onClick={() => setProjectType('interested')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
            ${projectType === 'interested' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaHeart />
          Interested
        </motion.button>
      </motion.div>

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center py-10'>
          <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent'></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative' role='alert'>
          <strong className='font-bold'>Error!</strong>
          <span className='block sm:inline'> {error}</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredProjects.length === 0 && (
        <div className='text-center py-10'>
          <FaLightbulb className='mx-auto text-4xl text-gray-400 mb-4' />
          <h3 className='text-xl font-medium theme-text mb-2'>No projects found</h3>
          <p className='theme-text-secondary'>
            {projectType === 'all'
              ? "You don't have any projects yet. Create a new project to get started!"
              : projectType === 'created'
                ? "You haven't created any projects yet. Click 'New Project' to create one!"
                : projectType === 'interested'
                  ? "You haven't shown interest in any projects yet. Browse projects to get started!"
                  : "You aren't working on any freelance projects yet."}
          </p>
        </div>
      )}

      {/* Project List */}
      {!loading && !error && filteredProjects.length > 0 && (
        <motion.div className='grid gap-6' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}>
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project._id}
              className='p-6 rounded-lg bg-gradient-to-br dark:from-light/10 dark:to-light/5 from-primary/10 to-primary/5 hover:shadow-lg transition-all duration-300 group backdrop-blur-sm'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}>
              {/* Project content */}
              <div className='flex justify-between items-start'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3, delay: index * 0.1 + 0.2 }}>
                      {getProjectType(project) === 'freelance' ? <FaBriefcase className='text-accent text-xl' /> : <FaLightbulb className='text-accent text-xl' />}
                    </motion.div>
                    <h3 className='text-xl font-semibold theme-text'>{project.title}</h3>
                  </div>
                  <p className='theme-text-secondary text-sm mb-3'>{project.description}</p>
                  <div className='flex items-center gap-4'>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusIcon(project.status)}
                      <span className='text-sm'>{formatStatus(project.status)}</span>
                    </div>

                    {isCreator(project) && project.assignee && (
                      <div className='text-sm text-accent mt-1'>
                        Assigned: {project.assignee.firstName} {project.assignee.lastName}
                      </div>
                    )}
                    <div className='theme-text-secondary text-sm'>Due: {new Date(project.deadline).toLocaleDateString()}</div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='theme-text font-bold'>€{project.budget}</div>
                  <motion.button
                    onClick={() => navigate(`/project/${project._id}`)}
                    className='mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all duration-300'
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}>
                    <FaEye />
                    <span>View</span>
                  </motion.button>
                  {(() => {
                    // Check if user is interested in this project (but not the creator)
                    const isCreator = project.user._id === currentUser._id || project.user === currentUser._id
                    const isInterested = project.interestedUsers?.some((u) => {
                      const userId = u.userId._id ? u.userId._id : u.userId
                      return userId === currentUser._id
                    })

                    return !isCreator && isInterested
                  })() && (
                    <motion.button
                      onClick={async () => {
                        try {
                          await removeFromInterested(project._id)
                          await fetchProjects()
                        } catch (err) {
                          console.error('Error removing from interested:', err)
                        }
                      }}
                      className='mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <FaHeart />
                      <span>Remove</span>
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Progress Bar */}
              <div className='mt-6'>
                <div className='flex justify-between mb-2'>
                  <span className='theme-text-secondary text-sm'>Progress</span>
                  <span className='theme-text-secondary text-sm'>{project.progress || 0}%</span>
                </div>
                <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700'>
                  <motion.div className='bg-accent h-2.5 rounded-full' initial={{ width: 0 }} animate={{ width: `${project.progress || 0}%` }} transition={{ duration: 0.5, delay: index * 0.1 + 0.4 }} />
                </div>
              </div>

              {/* Assign/Remove Actions (Creator only) */}
              {isCreator(project) && project.interestedUsers && project.interestedUsers.length > 0 && (
                <div className='mt-4 pt-4 border-t dark:border-light/10 border-primary/10'>
                  {!project.assignee ? (
                    <motion.button
                      onClick={() => {
                        setSelectedProject(project)
                        setIsAssignModalOpen(true)
                      }}
                      className='w-full py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded transition-all'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      Assign Project
                    </motion.button>
                  ) : (
                    <motion.button
                      onClick={async () => {
                        try {
                          await removeAssignee(project._id)
                          await fetchProjects()
                        } catch (err) {
                          console.error('Error removing assignee:', err)
                        }
                      }}
                      className='w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      Remove Assignment
                    </motion.button>
                  )}
                </div>
              )}

              {/* Interested Users Badge */}
              {project.interestedUsers && project.interestedUsers.length > 0 && (
                <div className='mt-4 pt-4 border-t dark:border-light/10 border-primary/10'>
                  <p className='text-sm theme-text-secondary mb-2'>
                    {(() => {
                      const count = project.interestedUsers.length
                      const names = project.interestedUsers
                        .slice(0, 2)
                        .map((u) => u.userId?.firstName || 'User')
                        .join(', ')
                      const others = count - 2

                      if (count === 1) {
                        return `Interested: ${names}`
                      } else if (count <= 2) {
                        return `Interested: ${names}`
                      } else {
                        return `Interested: ${names} and ${others} ${others === 1 ? 'other' : 'others'}`
                      }
                    })()}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>
      )}
    </motion.div>
  )
}

export default ProjectsList
