const AdminProjectEditModal = ({ isOpen, onClose, onSave, loading, form, setForm, assigneeName, ownerName, canRemoveAssignee, onRemoveAssignee, removeAssigneeLoading }) => {
  if (!isOpen) return null

  const skillsValue = Array.isArray(form.skills) ? form.skills.join(', ') : form.skills || ''

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/50 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto'>
        <h3 className='text-lg font-semibold text-gray-900 dark:text-white mb-4'>Edit Project</h3>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Title</label>
            <input
              type='text'
              value={form.title || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Description</label>
            <textarea
              rows='4'
              value={form.description || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Category</label>
            <input
              type='text'
              value={form.category || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Budget</label>
            <input
              type='number'
              min='0'
              step='1'
              value={form.budget ?? ''}
              onChange={(e) => setForm((prev) => ({ ...prev, budget: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              placeholder='e.g. 1200'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Skills (comma separated)</label>
            <input
              type='text'
              value={skillsValue}
              onChange={(e) => setForm((prev) => ({ ...prev, skills: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
              placeholder='React, Node.js, MongoDB'
            />
          </div>

          <div>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Priority</label>
            <select
              value={form.priority || 'low'}
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
              value={form.deadline || ''}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              className='w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white'
            />
          </div>

          <div className='md:col-span-2'>
            <label className='block text-sm text-gray-600 dark:text-gray-300 mb-1'>Status</label>
            <select
              value={form.status || 'active'}
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

          <div className='md:col-span-2 border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <p className='text-sm font-semibold text-amber-900 dark:text-amber-200'>Assignment Control</p>
                <p className='text-sm text-amber-800 dark:text-amber-300 mt-1'>
                  <span className='font-medium'>Owner:</span> {ownerName || 'Unknown'}
                </p>
                <p className='text-sm text-amber-800 dark:text-amber-300'>
                  <span className='font-medium'>Assignee:</span> {assigneeName || 'No assignee'}
                </p>
                <p className='text-xs text-amber-700 dark:text-amber-400 mt-2'>Only assignee can be removed here. Project owner cannot be removed.</p>
              </div>

              <button
                type='button'
                onClick={onRemoveAssignee}
                disabled={!canRemoveAssignee || loading || removeAssigneeLoading}
                className='px-3 py-2 text-sm rounded-lg bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-60 disabled:cursor-not-allowed'>
                {removeAssigneeLoading ? 'Removing...' : 'Remove Assignee'}
              </button>
            </div>
          </div>
        </div>

        <div className='mt-6 flex justify-end gap-3'>
          <button
            type='button'
            onClick={onClose}
            disabled={loading || removeAssigneeLoading}
            className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'>
            Cancel
          </button>
          <button type='button' onClick={onSave} disabled={loading || removeAssigneeLoading} className='px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60'>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminProjectEditModal
