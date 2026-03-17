import { getProjectStatusBadgeClass, formatProjectStatusLabel, getProjectPriorityBadgeClass, formatProjectPriorityLabel } from '../utils/projectStatusUI'

const AdminProjectDetailModal = ({ isOpen, onClose, project }) => {
  if (!isOpen || !project) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6'>
        <div className='flex items-start justify-between gap-4 mb-4'>
          <div>
            <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>{project.name}</h3>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Project quick details</p>
          </div>
          <button type='button' onClick={onClose} className='px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
            Close
          </button>
        </div>

        <p className='text-sm text-gray-600 dark:text-gray-300 mb-4'>{project.description}</p>

        <div className='flex flex-wrap gap-2 mb-4'>
          <span className={`px-2 py-1 text-xs rounded-full ${getProjectStatusBadgeClass(project.status)}`}>{formatProjectStatusLabel(project.status)}</span>
          <span className={`px-2 py-1 text-xs rounded-full ${getProjectPriorityBadgeClass(project.priority)}`}>{formatProjectPriorityLabel(project.priority)} Priority</span>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-sm'>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Category</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.category || 'General'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Deadline</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.deadline || 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Created</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3'>
            <div className='text-gray-500 dark:text-gray-400'>Progress</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.progress || 0}%</div>
          </div>
          <div className='rounded-lg bg-gray-50 dark:bg-gray-700/50 p-3 md:col-span-2'>
            <div className='text-gray-500 dark:text-gray-400'>Team</div>
            <div className='text-gray-900 dark:text-white font-medium'>{project.team?.join(', ') || 'N/A'}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectDetailModal
