import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { archiveProject } from '../../services/projectService'

const ProjectActions = ({
  project,
  currentUser,
  isOwner,
  isAssignee,
  isFavorited,
  favoriteLoading,
  handleToggleFavorite,
  setIsEditModalOpen,
  setIsContactModalOpen,
  setIsSubmitModalOpen,
  setIsReviewModalOpen,
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
          className={`w-full py-3 rounded-lg transition-all ${
            isLockedStatus(project.status) ? 'bg-gray-400 text-white cursor-not-allowed opacity-60' : 'bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white'
          }`}>
          {isLockedStatus(project.status) ? 'Edit Locked' : 'Edit Project'}
        </button>
      )}

      {/* Contact Creator / Login Button */}
      {!['completed', 'archived', 'deleted_by_owner'].includes(project.status) && (
        <>
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
        </>
      )}

      {/* Submit Project Button - for assignee in progress */}
      {isAssignee && project.status === 'in_progress' && (
        <button onClick={() => setIsSubmitModalOpen(true)} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
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
        <button onClick={() => setIsReviewModalOpen(true)} className='w-full py-3 bg-purple-500/10 text-purple-600 rounded-lg hover:bg-purple-500 hover:text-white transition-all'>
          Review Submission
        </button>
      )}

      {/* Archive Project Button - for owner when completed */}
      {isOwner && project.status === 'completed' && (
        <button onClick={handleArchiveProject} className='w-full py-3 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
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
        className={`w-full py-3 border-2 rounded-lg transition-all ${isFavorited ? 'bg-accent text-white border-accent hover:bg-accent/90' : 'border-accent text-accent hover:bg-accent/10'}`}>
        {favoriteLoading ? 'Loading...' : isFavorited ? 'Unfavorite' : 'Save to Favorites'}
      </button>
    </motion.div>
  )
}

export default ProjectActions
