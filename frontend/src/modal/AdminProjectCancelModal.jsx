const AdminProjectCancelModal = ({ isOpen, onClose, onConfirm, projectName, loading }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-2'>Cancel Project</h3>
        <p className='text-sm text-gray-600 dark:text-gray-300 mb-6'>
          Are you sure you want to cancel <span className='font-semibold'>"{projectName}"</span>? This will mark it as <span className='font-semibold'>Canceled by Admin</span> and lock further changes.
        </p>
        <div className='flex justify-end gap-3'>
          <button type='button' onClick={onClose} disabled={loading} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
            Cancel
          </button>
          <button type='button' onClick={onConfirm} disabled={loading} className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60'>
            {loading ? 'Applying...' : 'Yes, Cancel Project'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectCancelModal
