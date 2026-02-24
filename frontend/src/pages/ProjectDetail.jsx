import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaClock, FaDollarSign, FaUser, FaTags, FaTimes, FaCheck } from 'react-icons/fa'
import { getProjectById } from '../services/projectService'
import { useAuth } from '../context/AuthContext'
import ContactModal from '../modal/ContactModal'
import ProjectModal from '../modal/ProjectModal'
import { formatStatus } from '../utils/formatters'
import SubmitProjectModal from '../modal/SubmitProjectModal'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ReviewProjectModal from '../modal/ReviewProjectModal'
import { useRateNegotiation } from '../hooks/useRateNegotiation'
import { useProjectModals } from '../hooks/useProjectModals'
import { useFavorites } from '../hooks/useFavorites'
import { useProjectMessages } from '../hooks/useProjectMessages'
import { ProjectHeader, SkillsRequired, RateNegotiationCard, ProjectActions, MessagesTab } from '../components/ProjectDetail'

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentUser, loading: authLoading } = useAuth()

  const [project, setProject] = useState(null)
  const [activeTab, setActiveTab] = useState('details')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Extract modal state into hook
  const { isContactModalOpen, setIsContactModalOpen, isEditModalOpen, setIsEditModalOpen, isSubmitModalOpen, setIsSubmitModalOpen, isReviewModalOpen, setIsReviewModalOpen } = useProjectModals()

  // Extract favorites into hook
  const { isFavorited, favoriteLoading, handleToggleFavorite } = useFavorites(id, currentUser)

  // Extract messages into hook
  const { messages, messagesLoading } = useProjectMessages(project, currentUser)

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

  const { rateAmount, setRateAmount, rateType, setRateType, rateLoading, rateError, setRateError, handleProposeRate, handleCounterRate, handleAcceptRate } = useRateNegotiation(id, loadProject)

  const isOwner = currentUser && project && currentUser._id === project.user?._id
  const isAssignee = currentUser && project && (project.assignee?._id ? project.assignee._id === currentUser._id : project.assignee === currentUser._id)

  // Fetch project on mount or when id/currentUser changes
  useEffect(() => {
    if (authLoading) return
    if (id) loadProject()
  }, [id, currentUser, authLoading])

  // Build negotiation timeline for MessagesTab
  const negotiationHistory = project?.rateNegotiation?.history || []
  const getOfferLabel = (userId) => {
    if (!userId) return 'User'
    if (project?.user?._id && userId.toString() === project.user._id.toString()) return 'Client'
    if (project?.assignee?._id && userId.toString() === project.assignee._id.toString()) return 'Freelancer'
    return 'User'
  }
  const formatOfferType = (type) => (type === 'fixed' ? 'fixed' : '/hr')
  const negotiationTimeline = negotiationHistory.map((offer) => {
    const label = getOfferLabel(offer.proposedBy)
    const time = offer.proposedAt ? new Date(offer.proposedAt) : null
    return {
      text: `${label} proposed €${offer.amount} ${formatOfferType(offer.type)}`,
      time
    }
  })

  const handleBack = () => {
    navigate(-1)
  }

  // Loading state
  if (loading) {
    return (
      <section className='w-full theme-bg relative z-[1] pt-[80px]'>
        <div className='container mx-auto px-4 py-12 relative z-10 min-h-[calc(100vh-336px)]'>
          <div className='flex items-center justify-center min-h-[400px]'>
            <LoadingSpinner />
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
      <PageBackground variant='profile' />

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
        <ProjectHeader project={project} />

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
              <SkillsRequired skills={project.skills} />

              {/* Review Feedback Section - visible to both */}
              {project.review && project.review.decision && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='theme-card p-6 rounded-lg border-l-4 border-accent space-y-3'>
                  <div className='flex items-center gap-2'>
                    {project.review.decision === 'accepted' ? (
                      <>
                        <FaCheck className='text-green-500 text-xl' />
                        <h3 className='text-lg font-semibold text-green-600 dark:text-green-400'>Project Accepted</h3>
                      </>
                    ) : (
                      <>
                        <FaTimes className='text-red-500 text-xl' />
                        <h3 className='text-lg font-semibold text-red-600 dark:text-red-400'>Changes Requested</h3>
                      </>
                    )}
                  </div>

                  {project.review.feedback && (
                    <div className='bg-primary/5 dark:bg-light/5 rounded-lg p-4 border border-primary/10 dark:border-light/10'>
                      <p className='text-xs font-semibold theme-text-secondary mb-2'>Feedback from Client:</p>
                      <p className='text-sm theme-text leading-relaxed'>{project.review.feedback}</p>
                    </div>
                  )}

                  <p className='text-xs theme-text-secondary'>
                    {new Date(project.review.reviewedAt).toLocaleDateString()} at {new Date(project.review.reviewedAt).toLocaleTimeString()}
                  </p>
                </motion.div>
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
                    <img
                      src={project.assignee.profilePicture || `https://i.pravatar.cc/150?u=${project.assignee._id}`}
                      alt={project.assignee.firstName}
                      className='w-14 h-14 rounded-full object-cover border-2 border-accent/20'
                    />
                    <div>
                      <p className='font-semibold theme-text'>
                        {project.assignee.firstName} {project.assignee.lastName}
                      </p>
                      <p className='text-sm theme-text-secondary'>{project.assignee.email}</p>
                    </div>
                  </div>

                  {/* Contact button */}
                  {/* Only show if project is NOT (completed/archived) */}
                  {(project.user._id === currentUser?._id || project.user === currentUser?._id) && !['completed', 'archived'].includes(project.status) && (
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

              {/* Rate Negotiation */}
              <RateNegotiationCard
                project={project}
                currentUser={currentUser}
                rateAmount={rateAmount}
                setRateAmount={setRateAmount}
                rateType={rateType}
                setRateType={setRateType}
                rateLoading={rateLoading}
                rateError={rateError}
                handleProposeRate={handleProposeRate}
                handleCounterRate={handleCounterRate}
                handleAcceptRate={handleAcceptRate}
              />

              {/* Project Details Card */}
              <div className='theme-card p-6 rounded-lg space-y-4'>
                <h3 className='text-xl font-semibold theme-text mb-4'>Project Details</h3>

                {/* Budget */}
                {(!project.rateNegotiation || project.rateNegotiation.status === 'accepted') && (
                  <div className='flex items-center gap-3 theme-text-secondary'>
                    <FaDollarSign className='text-accent' />
                    <div>
                      <p className='text-sm'>Budget</p>
                      <p className='text-lg font-semibold theme-text'>€{project.budget}</p>
                    </div>
                  </div>
                )}

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
                    <img src={project.user.profilePicture || `https://i.pravatar.cc/150?u=${project.user._id}`} alt={project.user.firstName} className='w-12 h-12 rounded-full object-cover' />
                    <div>
                      <p className='font-semibold theme-text'>
                        {project.user.firstName} {project.user.lastName}
                      </p>
                      <p className='text-sm theme-text-secondary'>{project.user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <ProjectActions
                project={project}
                currentUser={currentUser}
                isOwner={isOwner}
                isAssignee={isAssignee}
                isFavorited={isFavorited}
                favoriteLoading={favoriteLoading}
                handleToggleFavorite={handleToggleFavorite}
                setIsEditModalOpen={setIsEditModalOpen}
                setIsContactModalOpen={setIsContactModalOpen}
                setIsSubmitModalOpen={setIsSubmitModalOpen}
                setIsReviewModalOpen={setIsReviewModalOpen}
                loadProject={loadProject}
              />
            </motion.div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && <MessagesTab project={project} currentUser={currentUser} messages={messages} messagesLoading={messagesLoading} negotiationTimeline={negotiationTimeline} id={id} />}
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
