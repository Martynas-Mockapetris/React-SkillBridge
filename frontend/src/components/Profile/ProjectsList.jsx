import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaClock, FaCheck, FaPause, FaEye, FaBriefcase, FaLightbulb, FaHeart, FaSpinner, FaSearch, FaTimes, FaArchive, FaStar } from 'react-icons/fa'
import ProjectModal from '../../modal/ProjectModal'
import AssignModal from '../../modal/AssignModal'
import RatingModal from '../../modal/RatingModal'
import { useAuth } from '../../context/AuthContext' // Import useAuth hook
import { getUserProjects, getInterestedProjects, removeFromInterested, removeAssignee, publishProject, deleteProject } from '../../services/projectService'
import { getFavoriteProjects, addToFavorites, removeFromFavorites } from '../../services/userService'
import { getFreelancerRatings } from '../../services/ratingService'
import { formatStatus } from '../../utils/formatters'
import LoadingSpinner from '../shared/LoadingSpinner'

const ProjectsList = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { currentUser } = useAuth() // Get the current user
  const [projectType, setProjectType] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState('create')
  const [projects, setProjects] = useState([]) // State for projects
  const [loading, setLoading] = useState(true) // Loading state
  const [error, setError] = useState(null) // Error state
  const [selectedProject, setSelectedProject] = useState(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [favorites, setFavorites] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false)
  const [selectedFreelancerForRating, setSelectedFreelancerForRating] = useState(null)
  const [selectedProjectForRating, setSelectedProjectForRating] = useState(null)
  const [freelancerRatingsCache, setFreelancerRatingsCache] = useState({})
  const [ratingUserType, setRatingUserType] = useState('freelancer')
  const [myRatings, setMyRatings] = useState([])

  const isLockedStatus = (status) => ['under_review', 'completed', 'archived', 'cancelled', 'cancelled_by_admin', 'deleted_by_owner'].includes(status)

  const openModal = () => {
    setModalMode('create')
    setSelectedProject(null)
    setIsModalOpen(true)
  }
  const closeModal = () => {
    setIsModalOpen(false)
    setModalMode('create')
    setSelectedProject(null)
  }

  // Fetch projects when component mounts
  useEffect(() => {
    fetchProjects()
  }, [])

  // Fetch favorites when component mounts
  useEffect(() => {
    if (!currentUser) return // Skip if no user

    const loadFavorites = async () => {
      try {
        const favProjects = await getFavoriteProjects()
        // Extract just the IDs
        const favoriteIds = favProjects.map((fav) => fav._id)
        setFavorites(favoriteIds)
      } catch (error) {
        console.error('Error loading favorites:', error)
      }
    }

    loadFavorites()
  }, [currentUser])

  // Reload projects and favorites when user navigates back to this page
  useEffect(() => {
    if (currentUser) {
      fetchProjects()
    }
  }, [location.pathname, currentUser])

  // Load freelancer ratings to check which projects have been rated
  useEffect(() => {
    if (!currentUser?._id) return

    const loadMyRatings = async () => {
      try {
        const ratingsData = await getFreelancerRatings(currentUser._id)
        setMyRatings(ratingsData)
      } catch (error) {
        console.error('Error loading ratings:', error)
      }
    }

    loadMyRatings()
  }, [currentUser])

  // Load freelancer ratings for all freelancers in projects
  useEffect(() => {
    if (!projects || projects.length === 0) return

    const loadFreelancerRatings = async () => {
      const freelancerIds = new Set()

      // Collect all unique freelancer IDs from projects
      projects.forEach((project) => {
        if (project.assignee?._id) {
          freelancerIds.add(project.assignee._id)
        }
      })

      // Fetch ratings for each freelancer
      const newCache = { ...freelancerRatingsCache }

      for (const freelancerId of freelancerIds) {
        if (newCache[freelancerId]) {
          continue
        }

        try {
          const ratingsData = await getFreelancerRatings(freelancerId)
          newCache[freelancerId] = ratingsData
        } catch (error) {
          console.error(`Error loading ratings for freelancer ${freelancerId}:`, error)
        }
      }

      setFreelancerRatingsCache(newCache)
    }

    loadFreelancerRatings()
  }, [projects])

  // Function to fetch projects and favorites
  const fetchProjects = async () => {
    try {
      setLoading(true)

      // Fetch created, interested, and favorite projects
      const [createdProjects, interestedProjects] = await Promise.all([getUserProjects(), getInterestedProjects()])

      // Combine and remove duplicates
      const allProjects = [...createdProjects]

      // Add interested projects
      interestedProjects.forEach((interestedProject) => {
        if (!allProjects.some((p) => p._id === interestedProject._id)) {
          allProjects.push(interestedProject)
        }
      })

      // Also fetch and merge favorite projects
      if (currentUser) {
        try {
          const favProjects = await getFavoriteProjects()
          const favoriteIds = favProjects.map((fav) => fav._id)
          setFavorites(favoriteIds)

          // Add favorite project objects to allProjects if not already there
          favProjects.forEach((favProject) => {
            if (!allProjects.some((p) => p._id === favProject._id)) {
              allProjects.push(favProject)
            }
          })
        } catch (error) {
          console.error('Error loading favorites:', error)
        }
      }

      const sortedProjects = [...allProjects].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())

      setProjects(sortedProjects)
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
      case 'cancelled_by_admin':
        return <FaTimes className='text-red-600' />
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
      case 'cancelled_by_admin':
        return 'bg-red-500/10 text-red-600'
      case 'archived':
        return 'bg-gray-500/10 text-gray-500'
      case 'draft':
        return 'bg-yellow-500/10 text-yellow-500'
      default:
        return 'bg-gray-500/10 text-gray-500'
    }
  }

  const formatPriorityLabel = (priority) => {
    if (!priority) return 'Medium'
    return priority.charAt(0).toUpperCase() + priority.slice(1)
  }

  const getPriorityClasses = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500'
      case 'low':
        return 'bg-blue-500/10 text-blue-500'
      default:
        return 'bg-amber-500/10 text-amber-500'
    }
  }

  const isCreator = (project) => project.user._id === currentUser._id || project.user === currentUser._id

  const isFavorited = (projectId) => {
    return favorites.includes(projectId)
  }

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

  // Apply tab filter first
  let filteredProjects =
    projectType === 'all'
      ? projects.filter((project) => project.status !== 'archived')
      : projectType === 'favorites'
        ? projects.filter((project) => isFavorited(project._id) && project.status !== 'archived' && project.status !== 'completed')
        : projectType === 'archived'
          ? projects.filter((project) => project.status === 'archived')
          : projectType === 'completed'
            ? projects.filter((project) => project.status === 'completed')
            : projects.filter((project) => getProjectType(project) === projectType && project.status !== 'archived' && project.status !== 'completed')

  // Apply status filter if "All Projects" tab is selected
  if (projectType === 'all' && statusFilter !== 'all') {
    filteredProjects = filteredProjects.filter((project) => project.status === statusFilter)
  }

  return (
    <motion.div className='space-y-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <motion.div className='flex justify-between items-center' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h2 className='text-2xl font-bold theme-text'>My Projects</h2>
        <motion.button onClick={openModal} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all duration-300' whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          New Project
        </motion.button>
      </motion.div>

      {/* Project Modal - Pass fetchProjects function to refresh after creation */}
      <ProjectModal isOpen={isModalOpen} onClose={closeModal} onProjectCreated={fetchProjects} mode={modalMode} initialData={selectedProject} onProjectUpdated={fetchProjects} />

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
          <FaEye />
          Interested
        </motion.button>
        <motion.button
          onClick={() => setProjectType('favorites')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
    ${projectType === 'favorites' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaHeart />
          Favorites
        </motion.button>
        <motion.button
          onClick={() => setProjectType('completed')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
    ${projectType === 'completed' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaCheck />
          Completed
        </motion.button>
        <motion.button
          onClick={() => setProjectType('archived')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300
    ${projectType === 'archived' ? 'bg-accent text-white' : 'bg-accent/10 text-accent'}`}>
          <FaArchive />
          Archived
        </motion.button>
      </motion.div>

      {/* Status Filter - Only show when "All Projects" tab is selected */}
      {projectType === 'all' && (
        <motion.select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className='px-4 py-2 rounded-lg border-2 border-accent/20 theme-bg theme-text transition-all duration-300 hover:border-accent/50 focus:border-accent focus:outline-none'
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}>
          <option value='all'>All Statuses</option>
          <option value='active'>Active</option>
          <option value='in_progress'>In Progress</option>
          <option value='under_review'>Under Review</option>
          <option value='completed'>Completed</option>
          <option value='paused'>Paused</option>
          <option value='cancelled'>Cancelled</option>
          <option value='cancelled_by_admin'>Canceled by Admin</option>
        </motion.select>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex justify-center py-10'>
          <LoadingSpinner />
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
                : projectType === 'freelance'
                  ? "You aren't working on any freelance projects yet. Browse available projects to get started!"
                  : projectType === 'interested'
                    ? "You haven't shown interest in any projects yet. Browse projects to get started!"
                    : projectType === 'favorites'
                      ? 'No favorite projects yet. Click the heart icon on any project to add it to your favorites!'
                      : projectType === 'completed'
                        ? 'No completed projects yet. Once projects are finished and reviewed, they will appear here!'
                        : projectType === 'archived'
                          ? 'No archived projects yet. Completed projects can be archived to keep your workspace clean!'
                          : 'No projects found in this category.'}
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
                    <div className='flex items-center justify-between w-full'>
                      <h3 className='text-xl font-semibold theme-text'>{project.title}</h3>
                      <motion.button
                        onClick={async (e) => {
                          e.stopPropagation()
                          try {
                            if (isFavorited(project._id)) {
                              await removeFromFavorites(project._id)
                              setFavorites(favorites.filter((id) => id !== project._id))
                            } else {
                              await addToFavorites(project._id)
                              setFavorites([...favorites, project._id])
                            }
                          } catch (error) {
                            console.error('Error toggling favorite:', error)
                          }
                        }}
                        className='ml-2'
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.9 }}>
                        <FaHeart className={`text-2xl ${isFavorited(project._id) ? 'text-red-500' : 'text-gray-400'}`} />
                      </motion.button>
                    </div>
                  </div>
                  <p className='theme-text-secondary text-sm mb-3'>{project.description}</p>
                  <div className='flex items-center gap-4'>
                    <div className='flex items-center gap-2'>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>{formatStatus(project.status)}</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityClasses(project.priority)}`}>{formatPriorityLabel(project.priority)} Priority</span>
                    </div>

                    {project.assignee && (isCreator(project) || isAssignee(project)) && (
                      <div className='text-sm text-accent'>
                        Assigned: {project.assignee.firstName} {project.assignee.lastName}
                      </div>
                    )}
                    <div className='theme-text-secondary text-sm mt-[2px]'>Due: {new Date(project.deadline).toLocaleDateString()}</div>
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
                    const isCompleted = project.status === 'completed'
                    const hasAssignee = project.assignee
                    const isCreatorCheck = isCreator(project)
                    const freelancerId = hasAssignee ? project.assignee._id : null
                    const freelancerRatings = freelancerId ? freelancerRatingsCache[freelancerId] : null
                    const hasRated = freelancerRatings?.ratings?.some((r) => r.projectId === project._id && r.ratedBy._id === currentUser._id)

                    // Button will show if project is completed, has assignee, user is creator, and hasn't rated yet
                    return isCompleted && hasAssignee && isCreatorCheck && !hasRated
                  })() && (
                    <motion.button
                      onClick={() => {
                        setSelectedFreelancerForRating(project.assignee)
                        setSelectedProjectForRating(project)
                        setIsRatingModalOpen(true)
                      }}
                      className='mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/40 transition-all duration-300'
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}>
                      <FaStar />
                      <span>Rate Freelancer</span>
                    </motion.button>
                  )}

                  {/* Rate Client button - for freelancers on assigned projects */}
                  {project.status === 'completed' &&
                    project.assignee &&
                    isAssignee(project) &&
                    !freelancerRatingsCache[project.user._id]?.ratings?.some((r) => r.projectId === project._id && r.ratedBy._id === currentUser._id) && (
                      <motion.button
                        onClick={() => {
                          setSelectedFreelancerForRating({ _id: project.user._id, firstName: project.user.firstName, lastName: project.user.lastName, profilePicture: project.user.profilePicture })
                          setSelectedProjectForRating(project)
                          setIsRatingModalOpen(true)
                          setRatingUserType('client')
                        }}
                        className='mt-2 flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all duration-300'
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}>
                        <FaStar />
                        <span>Rate Client</span>
                      </motion.button>
                    )}
                  {(() => {
                    // Check if user is interested in this project (but not the creator or assigned)
                    const isCreator = project.user._id === currentUser._id || project.user === currentUser._id
                    const isInterested = project.interestedUsers?.some((u) => {
                      const userId = u.userId._id ? u.userId._id : u.userId
                      return userId === currentUser._id
                    })

                    // Only show Remove button if: NOT creator AND interested AND NOT assigned
                    return !isCreator && isInterested && !isAssignee(project)
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
                        if (isLockedStatus(project.status)) return
                        try {
                          await removeAssignee(project._id)
                          await fetchProjects()
                        } catch (err) {
                          console.error('Error removing assignee:', err)
                        }
                      }}
                      disabled={isLockedStatus(project.status)}
                      className={`w-full py-2 rounded transition-all ${
                        isLockedStatus(project.status) ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                      }`}
                      whileHover={isLockedStatus(project.status) ? {} : { scale: 1.02 }}
                      whileTap={isLockedStatus(project.status) ? {} : { scale: 0.98 }}>
                      {isLockedStatus(project.status) ? 'Assigning Locked' : 'Remove Assignment'}
                    </motion.button>
                  )}
                </div>
              )}

              {/* Edit and Publish buttons for creator projects */}
              {isCreator(project) && (
                <div className='mt-2 space-y-2'>
                  <motion.button
                    onClick={() => {
                      if (isLockedStatus(project.status)) return
                      setSelectedProject(project)
                      setModalMode('edit')
                      setIsModalOpen(true)
                    }}
                    disabled={isLockedStatus(project.status)}
                    className={`w-full py-2 rounded transition-all ${
                      isLockedStatus(project.status) ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
                    }`}
                    whileHover={isLockedStatus(project.status) ? {} : { scale: 1.02 }}
                    whileTap={isLockedStatus(project.status) ? {} : { scale: 0.98 }}>
                    {isLockedStatus(project.status) ? 'Edit Locked' : 'Edit Project'}
                  </motion.button>

                  <motion.button
                    onClick={async () => {
                      const confirmed = window.confirm('Remove this project from your profile? Admin will still keep it in audit logs.')
                      if (!confirmed) return

                      try {
                        await deleteProject(project._id)
                        await fetchProjects()
                      } catch (err) {
                        console.error('Error deleting project from profile:', err)
                      }
                    }}
                    className='w-full py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded transition-all'
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}>
                    Delete from My Profile
                  </motion.button>

                  {project.status === 'draft' && (
                    <motion.button
                      onClick={async () => {
                        try {
                          await publishProject(project._id)
                          await fetchProjects()
                        } catch (err) {
                          console.error('Error publishing project:', err)
                        }
                      }}
                      className='w-full py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-all'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      Publish Project
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

      {/* Assign Modal */}
      <AssignModal
        isOpen={isAssignModalOpen}
        onClose={() => {
          setIsAssignModalOpen(false)
          setSelectedProject(null)
        }}
        project={selectedProject}
        onAssignSuccess={fetchProjects}
      />
      {/* Rating Modal for manual rating of completed projects */}
      <RatingModal
        isOpen={isRatingModalOpen}
        onClose={() => {
          setIsRatingModalOpen(false)
          setSelectedFreelancerForRating(null)
          setSelectedProjectForRating(null)
          setRatingUserType('freelancer')
        }}
        freelancer={selectedFreelancerForRating}
        projectId={selectedProjectForRating?._id}
        ratedUserType={ratingUserType}
        onRatingSubmitted={() => {
          // Reload the freelancer's ratings after submission
          const loadFreelancerRatings = async () => {
            try {
              if (!selectedFreelancerForRating?._id) return
              const ratingsData = await getFreelancerRatings(selectedFreelancerForRating._id)
              setFreelancerRatingsCache((prev) => ({
                ...prev,
                [selectedFreelancerForRating._id]: ratingsData
              }))
            } catch (error) {
              console.error('Error loading freelancer ratings:', error)
            }
          }
          loadFreelancerRatings()
          fetchProjects()
        }}
      />
    </motion.div>
  )
}

export default ProjectsList
