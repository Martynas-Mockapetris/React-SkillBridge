import { Link } from 'react-router-dom'
import { getProjectStatusBadgeClass, formatProjectStatusLabel, getProjectPriorityBadgeClass, formatProjectPriorityLabel } from '../utils/projectStatusUI'

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

const AdminProjectDetailModal = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto'>
        <div className='flex items-start justify-between gap-4 mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{project.title || project.name}</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Project quick review</p>
          </div>
          <button type='button' onClick={onClose} className='px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
            Close
          </button>
        </div>

        <div className='flex flex-wrap gap-2 mb-4'>
          <span className={`px-2 py-1 text-xs rounded-full ${getProjectStatusBadgeClass(project.status)}`}>{formatProjectStatusLabel(project.status)}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getProjectPriorityBadgeClass(project.priority)}`}>{formatProjectPriorityLabel(project.priority)} Priority</span>
        </div>

        <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>{project.description}</p>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm mb-4'>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>ID</div>
            <div className='text-gray-900 dark:text-white font-medium break-all'>{project.id || 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Category</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.category || 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Budget</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.budget ?? 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Progress</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.progress || 0}%</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Deadline</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.deadline || 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Created</div>
            <div className='text-gray-900 dark:text-white font-medium'>{formatDateTime(project.createdAt)}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Updated</div>
            <div className='text-gray-900 dark:text-white font-medium'>{formatDateTime(project.updatedAt)}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Rated</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.isRated ? 'Yes' : 'No'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 md:col-span-2'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Owner / Assignee</div>
            <div className='text-gray-900 dark:text-white font-medium flex flex-wrap items-center gap-2'>
              <span>Owner:</span>
              {project.user?._id ? (
                <Link to={`/freelancer/${project.user._id}`} className='text-accent hover:underline'>
                  {`${project.user.firstName || ''} ${project.user.lastName || ''}`.trim() || project.user._id}
                </Link>
              ) : (
                <span>N/A</span>
              )}

              <span className='text-gray-400 mx-1'>|</span>
              <span>Assignee:</span>
              {project.assignee?._id ? (
                <Link to={`/freelancer/${project.assignee._id}`} className='text-accent hover:underline'>
                  {`${project.assignee.firstName || ''} ${project.assignee.lastName || ''}`.trim() || project.assignee._id}
                </Link>
              ) : (
                <span>None</span>
              )}
            </div>
          </div>
        </div>

        <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Submission Note</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.submission?.note || 'No note'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Submitted At</div>
            <div className='text-gray-900 dark:text-white font-medium'>{formatDateTime(project.submission?.submittedAt)}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Submission Links</div>
            <div className='text-gray-900 dark:text-white font-medium'>{(project.submission?.links || []).length}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Submission Files</div>
            <div className='text-gray-900 dark:text-white font-medium'>{(project.submission?.files || []).length}</div>
          </div>
        </div>

        <div className='mb-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Review Decision</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.review?.decision || 'Pending'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Reviewed At</div>
            <div className='text-gray-900 dark:text-white font-medium'>{formatDateTime(project.review?.reviewedAt)}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 md:col-span-2'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Review Feedback</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.review?.feedback || 'No feedback'}</div>
          </div>
        </div>

        <div className='mb-1 grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Negotiation Status</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.rateNegotiation?.status || 'none'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Current Offer</div>
            <div className='text-gray-900 dark:text-white font-medium'>
              {project.rateNegotiation?.currentOffer?.amount ? `${project.rateNegotiation.currentOffer.amount} (${project.rateNegotiation.currentOffer.type || 'hourly'})` : 'No offer'}
            </div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Negotiation History</div>
            <div className='text-gray-900 dark:text-white font-medium'>{(project.rateNegotiation?.history || []).length}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400 mb-1'>Agreed At</div>
            <div className='text-gray-900 dark:text-white font-medium'>{formatDateTime(project.rateNegotiation?.agreedAt)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectDetailModal
