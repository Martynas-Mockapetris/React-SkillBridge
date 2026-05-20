import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FaArrowLeft, FaTimes, FaCheck, FaCheckCircle, FaEnvelope } from 'react-icons/fa'
import { getProjectById } from '../services/projectService'
import { useAuth } from '../context/AuthContext'
import ContactModal from '../modal/ContactModal'
import ProjectModal from '../modal/ProjectModal'
import { getCollaborationStageClasses, getCollaborationStageLabel, getDisplayName, getProjectRelationshipSummary } from '../utils/projectDetailUI'
import SubmitProjectModal from '../modal/SubmitProjectModal'
import PageBackground from '../components/shared/PageBackground'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import ReviewProjectModal from '../modal/ReviewProjectModal'
import { useRateNegotiation } from '../hooks/useRateNegotiation'
import { useProjectModals } from '../hooks/useProjectModals'
import { useFavorites } from '../hooks/useFavorites'
import { useProjectMessages } from '../hooks/useProjectMessages'
import { ProjectHeader, RateNegotiationCard, ProjectActions, MessagesTab } from '../components/ProjectDetail'

const PROJECT_BRIEF_LABELS = {
  experienceLevel: {
    not_specified: 'Not specified',
    junior: 'Junior',
    mid: 'Mid',
    senior: 'Senior',
    expert: 'Expert'
  },
  duration: {
    not_specified: 'Not specified',
    less_than_1_week: 'Less than 1 week',
    '1_to_2_weeks': '1 to 2 weeks',
    '2_to_4_weeks': '2 to 4 weeks',
    '1_to_3_months': '1 to 3 months',
    '3_plus_months': '3+ months',
    ongoing: 'Ongoing'
  },
  workload: {
    not_specified: 'Not specified',
    under_10_hours: 'Under 10 hrs/week',
    '10_to_20_hours': '10 to 20 hrs/week',
    '20_to_30_hours': '20 to 30 hrs/week',
    '30_plus_hours': '30+ hrs/week',
    full_time: 'Full time'
  },
  startPreference: {
    not_specified: 'Not specified',
    immediately: 'Immediately',
    this_week: 'This week',
    within_2_weeks: 'Within 2 weeks',
    flexible: 'Flexible'
  },
  budgetType: {
    not_specified: 'Not specified',
    fixed: 'Fixed',
    hourly: 'Hourly',
    negotiable: 'Negotiable'
  }
}

const getProjectBriefLabel = (group, value) => {
  if (!value) return 'Not specified'
  return PROJECT_BRIEF_LABELS[group]?.[value] || 'Not specified'
}

const ProjectDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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

    // If user logged out while on this page, redirect to home or show message
    if (!currentUser) {
      setError('You have been logged out. Please log in to view this project.')
      return
    }

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

  const collaborationStageLabel = getCollaborationStageLabel(project?.status)
  const collaborationStageClasses = getCollaborationStageClasses(project?.status)

  const relationshipSummary = getProjectRelationshipSummary({
    isOwner,
    isAssignee,
    hasAssignee: Boolean(project?.assignee)
  })

  const canContactAssignee = (project?.user?._id === currentUser?._id || project?.user === currentUser?._id) && !['completed', 'archived', 'cancelled_by_admin', 'deleted_by_owner'].includes(project?.status)

  const clientDisplayName = getDisplayName(project?.user, 'Client not available')
  const assigneeDisplayName = getDisplayName(project?.assignee, 'No freelancer assigned yet')
  const projectBrief = project?.projectBrief || {}
  const deliverables = Array.isArray(projectBrief.deliverables) ? projectBrief.deliverables : []

  const experienceLevelLabel = getProjectBriefLabel('experienceLevel', projectBrief.experienceLevel)
  const durationLabel = getProjectBriefLabel('duration', projectBrief.duration)
  const workloadLabel = getProjectBriefLabel('workload', projectBrief.workload)
  const startPreferenceLabel = getProjectBriefLabel('startPreference', projectBrief.startPreference)
  const budgetTypeLabel = getProjectBriefLabel('budgetType', projectBrief.budgetType)

  const handleBack = () => {
    if (location.state?.returnTo) {
      navigate(location.state.returnTo)
      return
    }

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
              {/* Project Brief Section */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className='theme-card p-6 rounded-lg space-y-6'>
                <div className='space-y-2'>
                  <h3 className='text-xl font-semibold theme-text'>Project Brief</h3>
                  <p className='text-sm leading-6 theme-text-secondary'>Summary of the project scope, expectations, and delivery requirements.</p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Experience Level</p>
                    <p className='mt-2 text-base font-semibold theme-text'>{experienceLevelLabel}</p>
                  </div>

                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Start Preference</p>
                    <p className='mt-2 text-base font-semibold theme-text'>{startPreferenceLabel}</p>
                  </div>

                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Estimated Duration</p>
                    <p className='mt-2 text-base font-semibold theme-text'>{durationLabel}</p>
                  </div>

                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Workload</p>
                    <p className='mt-2 text-base font-semibold theme-text'>{workloadLabel}</p>
                  </div>

                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Budget Model</p>
                    <p className='mt-2 text-base font-semibold theme-text'>{budgetTypeLabel}</p>
                    <p className='mt-1 text-sm theme-text-secondary'>{project.rateNegotiation?.currentOffer ? 'Active rate discussion in progress.' : 'No active rate negotiation.'}</p>
                  </div>

                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Skills Required</p>
                    {project.skills?.length > 0 ? (
                      <div className='mt-2 flex flex-wrap gap-2'>
                        {project.skills.map((skill, index) => (
                          <span key={`${skill}-${index}`} className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-accent/10 text-accent'>
                            {skill}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className='mt-2 text-base font-semibold theme-text'>Not specified</p>
                    )}
                  </div>
                </div>

                {projectBrief.objective && (
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Objective</p>
                    <p className='text-sm leading-7 theme-text'>{projectBrief.objective}</p>
                  </div>
                )}

                {deliverables.length > 0 && (
                  <div className='space-y-3'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Deliverables</p>
                    <div className='flex flex-wrap gap-2'>
                      {deliverables.map((deliverable, index) => (
                        <span key={`${deliverable}-${index}`} className='inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-accent/10 text-accent'>
                          {deliverable}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {projectBrief.scopeNotes && (
                  <div className='space-y-2'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Scope Notes</p>
                    <p className='text-sm leading-7 theme-text'>{projectBrief.scopeNotes}</p>
                  </div>
                )}

                {projectBrief.applicationInstructions && (
                  <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-accent/5 p-4 space-y-2'>
                    <p className='text-xs font-semibold uppercase tracking-[0.14em] text-accent'>Application Instructions</p>
                    <p className='text-sm leading-7 theme-text'>{projectBrief.applicationInstructions}</p>
                  </div>
                )}

                <div className='pt-2 space-y-4'>
                  <h3 className='text-xl font-semibold theme-text'>Delivery Snapshot</h3>

                  {project.rateNegotiation?.currentOffer ? (
                    <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Commercial Model</p>
                      <div className='mt-2 flex flex-wrap items-center gap-2'>
                        <span className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-accent/10 text-accent'>
                          {project.rateNegotiation.currentOffer.type === 'hourly' ? 'Hourly Rate' : 'Fixed Price'}
                        </span>

                        {project.rateNegotiation?.status === 'proposed' && (
                          <span className='inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'>Offer Pending</span>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Commercial Model</p>
                      <p className='mt-2 text-sm theme-text-secondary'>Fixed project budget with no active negotiation.</p>
                    </div>
                  )}

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Timeline</p>
                      <p className='mt-2 text-base font-semibold theme-text'>{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'Flexible deadline'}</p>
                      <p className='mt-1 text-sm theme-text-secondary'>
                        {project.status === 'under_review'
                          ? 'Work is completed and waiting for client review.'
                          : project.status === 'in_progress'
                            ? 'Delivery is actively in progress.'
                            : project.status === 'negotiating'
                              ? 'Budget and rate are still being finalized.'
                              : 'Project timing depends on the current collaboration stage.'}
                      </p>
                    </div>

                    <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary'>Work Expectations</p>
                      <div className='mt-2 flex flex-col gap-2 text-sm theme-text-secondary'>
                        <p>
                          <span className='font-semibold theme-text'>Experience:</span> {experienceLevelLabel}
                        </p>
                        <p>
                          <span className='font-semibold theme-text'>Duration:</span> {durationLabel}
                        </p>
                        <p>
                          <span className='font-semibold theme-text'>Workload:</span> {workloadLabel}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

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
            <motion.div className='space-y-5' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
              {/* Collaboration Overview */}
              {project.user && (
                <div className='theme-card p-6 rounded-lg space-y-5'>
                  <div className='space-y-3'>
                    <div className='flex flex-wrap items-center justify-between gap-3'>
                      <h3 className='text-xl font-semibold theme-text'>Collaboration Overview</h3>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${collaborationStageClasses}`}>{collaborationStageLabel}</span>
                    </div>
                    <p className='text-sm leading-6 theme-text-secondary'>{relationshipSummary}</p>
                  </div>

                  <div className='space-y-4'>
                    <div className='rounded-lg border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary mb-3'>Client</p>
                      <div className='flex items-center gap-3'>
                        <img src={project.user.profilePicture || `https://i.pravatar.cc/150?u=${project.user._id}`} alt={project.user.firstName} className='w-12 h-12 rounded-full object-cover border border-accent/20' />
                        <div className='min-w-0'>
                          <div className='flex items-center gap-2 flex-wrap'>
                            <p className='font-semibold theme-text'>{clientDisplayName}</p>
                            {project.user.isEmailVerified && (
                              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                                <FaCheckCircle className='text-[10px]' />
                                Verified
                              </span>
                            )}
                          </div>
                          <p className='text-sm theme-text-secondary'>{project.user.headline || 'Project owner'}</p>
                          <p className='text-xs theme-text-muted mt-1 inline-flex items-center gap-1'>
                            <FaEnvelope className='text-[10px]' />
                            <span className='truncate'>{project.user.email}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className='rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.03] p-4'>
                      <p className='text-xs font-semibold uppercase tracking-[0.14em] theme-text-secondary mb-3'>Freelancer</p>

                      {project.assignee ? (
                        <div className='flex items-center gap-3'>
                          <img
                            src={project.assignee.profilePicture || `https://i.pravatar.cc/150?u=${project.assignee._id}`}
                            alt={project.assignee.firstName}
                            className='w-12 h-12 rounded-full object-cover border border-accent/20'
                          />
                          <div className='min-w-0'>
                            <div className='flex items-center gap-2 flex-wrap'>
                              <p className='font-semibold theme-text'>{assigneeDisplayName}</p>
                              {project.assignee.isEmailVerified && (
                                <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'>
                                  <FaCheckCircle className='text-[10px]' />
                                  Verified
                                </span>
                              )}
                            </div>
                            <p className='text-sm theme-text-secondary'>{project.assignee.headline || 'Assigned freelancer'}</p>
                            <p className='text-xs theme-text-muted mt-1 inline-flex items-center gap-1'>
                              <FaEnvelope className='text-[10px]' />
                              <span className='truncate'>{project.assignee.email}</span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='rounded-lg border border-dashed dark:border-light/10 border-primary/10 p-4'>
                          <p className='font-medium theme-text'>{assigneeDisplayName}</p>
                          <p className='text-sm theme-text-secondary mt-1'>The project is still open and no freelancer has been assigned yet.</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {project.assignee && canContactAssignee && (
                    <motion.button
                      onClick={() => navigate('/messages')}
                      className='w-full py-3 bg-accent/10 text-accent hover:bg-accent hover:text-white rounded-lg transition-all text-sm font-medium'
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}>
                      Contact Assignee
                    </motion.button>
                  )}
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
