import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { archiveProject } from '../../services/projectService'
import ProjectCompletionButton from '../shared/ProjectCompletionButton'
import RescheduleModal from '../../modal/RescheduleModal'

const ProjectActions = ({
  project,
  currentUser,
  isOwner,
  isAssignee,
  hasApplied,
  isFavorited,
  favoriteLoading,
  handleToggleFavorite,
  setIsEditModalOpen,
  setIsContactModalOpen,
  setIsSubmitModalOpen,
  setIsReviewModalOpen,
  isRescheduleModalOpen,
  setIsRescheduleModalOpen,
  loadProject
}) => {
  const navigate = useNavigate()

  const isLockedStatus = (status) => ['under_review', 'completed', 'archived', 'cancelled', 'cancelled_by_admin', 'deleted_by_owner'].includes(status)

  const handleArchiveProject = async () => {
    try {
      await archiveProject(project._id)
      loadProject()
    } catch (error) {
      console.error('Error archiving project:', error)
      alert('Failed to archive project')
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className='theme-card p-6 rounded-lg space-y-3'>
      {/* Edit Project Button - for owner only */}
      {isOwner && !['completed', 'archived', 'deleted_by_owner'].includes(project.status) && (
        <button
          onClick={() => {
            if (isLockedStatus(project.status)) return
            setIsEditModalOpen(true)
          }}
          disabled={isLockedStatus(project.status)}
          className={`w-full py-3 rounded-lg transition-all duration-300 ${
            isLockedStatus(project.status) ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white hover:shadow-lg'
          }`}>
          {isLockedStatus(project.status) ? 'Edit Locked' : 'Edit Project'}
        </button>
      )}

      {/* Apply / Express Interest CTA */}
      {!['completed', 'archived', 'deleted_by_owner'].includes(project.status) && (
        <>
          {currentUser && currentUser._id !== project.user?._id ? (
            <button
              onClick={() => setIsContactModalOpen(true)}
              className={`w-full py-3 rounded-lg transition-all duration-300 ${hasApplied ? 'bg-accent/10 text-accent hover:bg-accent hover:text-white hover:shadow-lg' : 'bg-accent text-white hover:bg-accent/90 hover:shadow-lg'}`}>
              {hasApplied ? 'Send Follow-up Message' : 'Apply for Project'}
            </button>
          ) : !currentUser ? (
            <button onClick={() => navigate('/login')} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 hover:shadow-lg transition-all duration-300'>
              Login to Apply
            </button>
          ) : (
            <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
              Your Project
            </button>
          )}
        </>
      )}

      {/* Submit Project Button - for assignee in progress */}
      {isAssignee && project.status === 'in_progress' && (
        <button onClick={() => setIsSubmitModalOpen(true)} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 hover:shadow-lg transition-all duration-300'>
          Submit Project
        </button>
      )}

      {/* Pending Review Badge - for assignee under review */}
      {isAssignee && project.status === 'under_review' && (
        <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
          Pending Review
        </button>
      )}

      {/* Pending Project Badge - for owner in progress */}
      {isOwner && project.status === 'in_progress' && (
        <button disabled className='w-full py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed opacity-50'>
          Pending Project
        </button>
      )}

      {/* Review Submission Button - for owner under review */}
      {isOwner && project.status === 'under_review' && (
        <button onClick={() => setIsReviewModalOpen(true)} className='w-full py-3 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white hover:shadow-lg transition-all duration-300'>
          Review Submission
        </button>
      )}

      {/* Mark Complete Button - for owner or assignee under review/in progress */}
      {(isOwner || isAssignee) && ['in_progress', 'under_review'].includes(project.status) && <ProjectCompletionButton project={project} onComplete={loadProject} variant='button' size='md' />}

      {/* Reschedule Project Button - for owner */}
      {isOwner && !['completed', 'archived', 'cancelled', 'deleted_by_owner'].includes(project.status) && (
        <button onClick={() => setIsRescheduleModalOpen(true)} className='w-full py-3 bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white rounded-lg hover:shadow-lg transition-all duration-300'>
          Reschedule Project
        </button>
      )}

      {/* Reschedule Modal */}
      <RescheduleModal isOpen={isRescheduleModalOpen} project={project} onClose={() => setIsRescheduleModalOpen(false)} onReschedule={loadProject} />

      {/* Archive Project Button - for owner when completed */}
      {isOwner && project.status === 'completed' && (
        <button onClick={handleArchiveProject} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 hover:shadow-lg transition-all duration-300'>
          Archive Project
        </button>
      )}

      {/* Favorite Button */}
      <button
        onClick={() => {
          if (!currentUser) {
            alert('Please login to favorite projects')
            return
          }
          handleToggleFavorite()
        }}
        disabled={favoriteLoading}
        className={`w-full py-3 border-2 rounded-lg transition-all duration-300 ${isFavorited ? 'bg-accent text-white border-accent hover:bg-accent/90 hover:shadow-lg' : 'border-accent text-accent hover:bg-accent/10 hover:shadow-lg'}`}>
        {favoriteLoading ? 'Loading...' : isFavorited ? 'Unfavorite' : 'Save to Favorites'}
      </button>
    </motion.div>
  )
}

ProjectActions.propTypes = {
  project: PropTypes.shape({
    _id: PropTypes.string,
    status: PropTypes.string,
    user: PropTypes.shape({
      _id: PropTypes.string
    }),
    assignee: PropTypes.shape({
      _id: PropTypes.string
    })
  }).isRequired,
  currentUser: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  isOwner: PropTypes.bool,
  isAssignee: PropTypes.bool,
  hasApplied: PropTypes.bool,
  isFavorited: PropTypes.bool,
  favoriteLoading: PropTypes.bool,
  handleToggleFavorite: PropTypes.func.isRequired,
  setIsEditModalOpen: PropTypes.func.isRequired,
  setIsContactModalOpen: PropTypes.func.isRequired,
  setIsSubmitModalOpen: PropTypes.func.isRequired,
  setIsReviewModalOpen: PropTypes.func.isRequired,
  isRescheduleModalOpen: PropTypes.bool,
  setIsRescheduleModalOpen: PropTypes.func.isRequired,
  loadProject: PropTypes.func.isRequired
}

export default ProjectActions
