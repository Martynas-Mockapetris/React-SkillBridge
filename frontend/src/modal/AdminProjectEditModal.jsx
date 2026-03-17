const AdminProjectEditModal = ({ isOpen, onClose, onSave, loading, form, setForm }) => {
  if (!isOpen) return null

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Edit Project</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Title</label>
            <input
              type='text'
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Description</label>
            <textarea
              rows='3'
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Category</label>
            <input
              type='text'
              value={form.category}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Priority</label>
            <select
              value={form.priority}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'>
              <option value='low'>Low</option>
              <option value='medium'>Medium</option>
              <option value='high'>High</option>
            </select>
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Deadline</label>
            <input
              type='date'
              value={form.deadline}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'>
              <option value='draft'>Draft</option>
              <option value='active'>Active</option>
              <option value='assigned'>Assigned</option>
              <option value='negotiating'>Negotiating</option>
              <option value='in_progress'>In Progress</option>
              <option value='under_review'>Under Review</option>
              <option value='completed'>Completed</option>
              <option value='cancelled'>Cancelled</option>
              <option value='inactive'>Inactive</option>
              <option value='archived'>Archived</option>
              <option value='paused'>Paused</option>
            </select>
          </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button type='button' onClick={onClose} disabled={loading} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
            Cancel
          </button>
          <button type='button' onClick={onSave} disabled={loading} className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectEditModal
