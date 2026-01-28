import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaClock, FaDollarSign, FaUser, FaTags, FaEnvelope } from 'react-icons/fa'
import { getProjectById } from '../services/projectService'
import { useAuth } from '../context/AuthContext'
import ContactModal from '../modal/ContactModal'
import molecularPattern from '../assets/molecular-pattern.svg'
import GroupedMessagesList from '../components/Profile/GroupedMessageList'
import { getProjectMessages } from '../services/messageService'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()

  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(false)

  const [isContactModalOpen, setIsContactModalOpen] = useState(false)

  // Fetch project data from API
  useEffect(() => {
    const fetchProject = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await getProjectById(id)
        setProject(data)
      } catch (err) {
        console.error('Error fetching project:', err)
        setError('Failed to load project. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProject()
    }
  }, [id])

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
        <motion.div className='mb-8' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
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
              <div className='theme-card p-6 rounded-lg'>
                <h2 className='text-2xl font-semibold theme-text mb-4'>Description</h2>
                <p className='theme-text-secondary leading-relaxed'>{project.description}</p>
              </div>

              {/* Skills Required */}
              {project.skills && project.skills.length > 0 && (
                <div className='theme-card p-6 rounded-lg'>
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
            <motion.div className='space-y-6' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
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
                    <p className='text-lg font-semibold capitalize theme-text'>{project.status}</p>
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
                <button className='w-full py-3 border-2 border-accent text-accent rounded-lg hover:bg-accent/10 transition-all'>Save Project</button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && project?.user?._id === currentUser?._id && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <GroupedMessagesList messages={messages} loading={messagesLoading} />
          </motion.div>
        )}
      </div>
      {/* Contact Modal */}
      {project && project.user && <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} project={project} />}
    </section>
  )
}

export default ProjectDetail
