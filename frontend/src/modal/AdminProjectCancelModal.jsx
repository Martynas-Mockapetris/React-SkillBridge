import PropTypes from 'prop-types'
import LoadingSpinner from '../components/shared/LoadingSpinner'

const AdminProjectCancelModal = ({ isOpen, onClose, onConfirm, projectName, loading }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-md theme-card rounded-lg shadow-xl p-6'>
        <h3 className='text-lg font-semibold theme-text mb-2'>Cancel Project</h3>
        <p className='text-sm theme-text-secondary mb-6'>
          Are you sure you want to cancel <span className='font-semibold'>"{projectName}"</span>? This will mark it as <span className='font-semibold'>Canceled by Admin</span> and lock further changes.
        </p>
        <div className='flex justify-end gap-3'>
          <button type='button' onClick={onClose} disabled={loading} className='px-4 py-2 rounded-lg border theme-border theme-text-secondary hover:bg-white/50 dark:hover:bg-black/20'>
            Cancel
          </button>
          <button type='button' onClick={onConfirm} disabled={loading} className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2'>
            {loading && <LoadingSpinner size='sm' className='border-t-2 border-white' />}
            {loading ? 'Applying...' : 'Yes, Cancel Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

AdminProjectCancelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  loading: PropTypes.bool
}

export default AdminProjectCancelModal
