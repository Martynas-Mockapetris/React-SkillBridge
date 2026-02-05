import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaClock, FaDollarSign, FaUser, FaTags } from 'react-icons/fa'
import { getProjectById } from '../services/projectService'
import { useAuth } from '../context/AuthContext'
import ContactModal from '../modal/ContactModal'
import ProjectModal from '../modal/ProjectModal'
import molecularPattern from '../assets/molecular-pattern.svg'
import GroupedMessagesList from '../components/Profile/GroupedMessageList'
import { getProjectMessages } from '../services/messageService'
import { getFavoriteProjects, addToFavorites, removeFromFavorites } from '../services/userService'
import { formatStatus } from '../utils/formatters'
import SubmitProjectModal from '../modal/SubmitProjectModal'
import ReviewProjectModal from '../modal/ReviewProjectModal'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, loading: authLoading } = useAuth()

  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false)
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)

  const isOwner = currentUser && project && currentUser._id === project.user?._id
  const isAssignee = currentUser && project && (project.assignee?._id ? project.assignee._id === currentUser._id : project.assignee === currentUser._id)

  // Load project data
  const loadProject = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await getProjectById(id)
      setProject(data)
    } catch (err) {
      console.error('Error fetching project:', err)
      if (err.response?.status === 404) {
        setError('Project not found or not yet published.')
      } else if (err.response?.status === 401) {
        setError('Authentication required. Please log in.')
      } else {
        setError('Failed to load project. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  // Fetch project on mount or when id/currentUser changes
  useEffect(() => {
    if (authLoading) return
    if (id) loadProject()
  }, [id, currentUser, authLoading])

  // Fetch messages when project loads and user is owner
  useEffect(() => {
    const fetchMessages = async () => {
      if (project && currentUser && project.user?._id === currentUser._id) {
        try {
          setMessagesLoading(true)
          const data = await getProjectMessages(project._id)
          setMessages(data)
        } catch (error) {
          console.error('Error fetching messages:', error)
        } finally {
          setMessagesLoading(false)
        }
      }
    }

    fetchMessages()
  }, [project, currentUser])

  // Load favorites when project or user changes
  useEffect(() => {
    const loadFavorites = async () => {
      if (project && currentUser) {
        try {
          const favorites = await getFavoriteProjects()
          const favoriteIds = favorites.map((fav) => fav._id)
          setIsFavorited(favoriteIds.includes(project._id))
        } catch (error) {
          console.error('Error loading favorites:', error)
          setIsFavorited(false)
        }
      }
    }

    loadFavorites()
  }, [project, currentUser])

  const handleBack = () => {
    navigate(-1)
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
        <motion.div className='mb-4 pb-4 border-b-2 dark:border-light/10 border-primary/10' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className='text-4xl font-bold theme-text mb-2'>{project.title}</h1>
          <p className='theme-text-secondary flex items-center gap-2'>
            <FaTags />
            {project.category}
          </p>
        </motion.div>

        {/* Project Content */}
        {/* Tabs for project owner */}
        {project?.user?._id === currentUser?._id && (
          <motion.div className='flex gap-4 mb-8 border-b dark:border-light/10 border-primary/10' initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-6 transition-all duration-300 font-medium ${activeTab === 'details' ? 'border-b-2 border-accent text-accent' : 'theme-text-secondary hover:text-accent'}`}>
              Project Details
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-6 transition-all duration-300 font-medium flex items-center gap-2 ${activeTab === 'messages' ? 'border-b-2 border-accent text-accent' : 'theme-text-secondary hover:text-accent'}`}>
              Messages
              {messages.length > 0 && <span className='px-2 py-1 bg-accent text-white rounded-full text-sm'>{messages.length}</span>}
            </button>
          </motion.div>
        )}

        {/* Project Content */}
        {activeTab === 'details' && (
          <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
            {/* Main Content */}
            <motion.div className='lg:col-span-2 space-y-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              {/* Description Section */}
              <div className='theme-card p-2 rounded-lg'>
                <h2 className='text-2xl font-semibold theme-text mb-4'>Description</h2>
                <p className='theme-text-secondary leading-relaxed'>{project.description}</p>
              </div>

              {/* Skills Required */}
              {project.skills && project.skills.length > 0 && (
                <div className='theme-card p-2 rounded-lg'>
                  <h2 className='text-2xl font-semibold theme-text mb-4'>Skills Required</h2>
                  <div className='flex flex-wrap gap-2'>
                    {project.skills.map((skill, index) => (
                      <span key={index} className='px-3 py-1 bg-accent/10 text-accent rounded-full text-sm'>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Sidebar */}
            <motion.div className='space-y-6 p-2' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              {/* Assigned Person Card */}
              {project.assignee && (
                <div className='theme-card p-6 rounded-lg border-2 border-accent/30'>
                  <h3 className='text-xl font-semibold theme-text mb-4 flex items-center gap-2'>
                    <span className='w-3 h-3 bg-accent rounded-full'></span>
                    Assigned To
                  </h3>
                  <div className='flex items-center gap-3 mb-4'>
                    <img src={project.assignee.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={project.assignee.firstName} className='w-14 h-14 rounded-full object-cover border-2 border-accent/20' />
                    <div>
                      <p className='font-semibold theme-text'>
                        {project.assignee.firstName} {project.assignee.lastName}
                      </p>
                      <p className='text-sm theme-text-secondary'>{project.assignee.email}</p>
                    </div>
                  </div>

                  {/* Contact button */}
                  {(project.user._id === currentUser?._id || project.user === currentUser?._id) && (
                    <div className='pt-4 border-t dark:border-light/10 border-primary/10'>
                      <motion.button
                        onClick={() => navigate(`/messages`)}
                        className='w-full py-2 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded transition-all text-sm'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}>
                        Contact Assignee
                      </motion.button>
                    </div>
                  )}
                </div>
              )}

              {/* Project Details Card */}
              <div className='theme-card p-6 rounded-lg space-y-4'>
                <h3 className='text-xl font-semibold theme-text mb-4'>Project Details</h3>

                {/* Budget */}
                <div className='flex items-center gap-3 theme-text-secondary'>
                  <FaDollarSign className='text-accent' />
                  <div>
                    <p className='text-sm'>Budget</p>
                    <p className='text-lg font-semibold theme-text'>€{project.budget}</p>
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
                    <p className='text-lg font-semibold theme-text'>{formatStatus(project.status)}</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              {project.user && (
                <div className='theme-card p-6 rounded-lg'>
                  <h3 className='text-xl font-semibold theme-text mb-4'>Client Info</h3>
                  <div className='flex items-center gap-3'>
                    <img src={project.user.profilePicture || 'https://i.pravatar.cc/150?img=1'} alt={project.user.firstName} className='w-12 h-12 rounded-full object-cover' />
                    <div>
                      <p className='font-semibold theme-text'>
                        {project.user.firstName} {project.user.lastName}
                      </p>
                      <p className='text-sm theme-text-secondary'>{project.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons - Placeholder for future commits */}
              <div className='theme-card p-6 rounded-lg space-y-3'>
                {currentUser && currentUser._id === project.user?._id && (
                  <button onClick={() => setIsEditModalOpen(true)} className='w-full py-3 bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition-all'>
                    Edit Project
                  </button>
                )}
                {currentUser && currentUser._id !== project.user?._id ? (
                  <button onClick={() => setIsContactModalOpen(true)} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                    Contact Creator
                  </button>
                ) : !currentUser ? (
                  <button onClick={() => navigate('/login')} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                    Login to Contact
                  </button>
                ) : (
                  <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
                    Your Project
                  </button>
                )}
                {/* Submission/Review Buttons */}
                {isAssignee && project.status === 'in_progress' && (
                  <button onClick={() => setIsSubmitModalOpen(true)} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                    Submit Project
                  </button>
                )}

                {isAssignee && project.status === 'under_review' && (
                  <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
                    Pending Review
                  </button>
                )}

                {isOwner && project.status === 'in_progress' && (
                  <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
                    Pending Project
                  </button>
                )}

                {isOwner && project.status === 'under_review' && (
                  <button onClick={() => setIsReviewModalOpen(true)} className='w-full py-3 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition-all'>
                    Review Submission
                  </button>
                )}

                {project.status === 'completed' && (
                  <button disabled className='w-full py-3 bg-green-500 text-white rounded-lg cursor-not-allowed opacity-50'>
                    Completed
                  </button>
                )}
                {/* Favorite Button */}
                <button
                  onClick={async () => {
                    if (!currentUser) {
                      alert('Please login to favorite projects')
                      return
                    }

                    setFavoriteLoading(true)
                    try {
                      if (isFavorited) {
                        await removeFromFavorites(project._id)
                        setIsFavorited(false)
                      } else {
                        await addToFavorites(project._id)
                        setIsFavorited(true)
                      }
                    } catch (error) {
                      console.error('Error toggling favorite:', error)
                      alert('Failed to update favorites. Please try again.')
                    } finally {
                      setFavoriteLoading(false)
                    }
                  }}
                  disabled={favoriteLoading}
                  className={`w-full py-3 border-2 rounded-lg transition-all ${isFavorited ? 'bg-accent text-white border-accent hover:bg-accent/90' : 'border-accent text-accent hover:bg-accent/10'}`}>
                  {favoriteLoading ? 'Loading...' : isFavorited ? 'Unfavorite' : 'Save to Favorites'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && project?.user?._id === currentUser?._id && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GroupedMessagesList
              messages={messages}
              loading={messagesLoading}
              projectId={id}
              isProjectCreator={true}
              onRefresh={async () => {
                try {
                  const updatedProject = await getProjectById(id)
                  setProject(updatedProject)

                  const updatedMessages = await getProjectMessages(id)
                  setMessages(updatedMessages)
                } catch (error) {
                  console.error('Error refreshing data:', error)
                }
              }}
            />
          </motion.div>
        )}
      </div>
      {/* Edit Project Modal */}
      {project && <ProjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} mode='edit' initialData={project} onProjectUpdated={loadProject} />}

      {/* Contact Modal */}
      {project && project.user && <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} project={project} />}

      {/* Submit and Review Modals */}
      {project && <SubmitProjectModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} project={project} onSubmitSuccess={loadProject} />}

      {project && <ReviewProjectModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} project={project} onReviewSuccess={loadProject} />}
    </section>
  )
}

export default ProjectDetail
