import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaTimes } from 'react-icons/fa'

export const ProjectFilterPanel = ({ filters, onFilterChange, onClearAll, hasActiveFilters }) => {
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    status: true,
    skills: true,
    priority: false,
    sort: false
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const statusOptions = ['draft', 'active', 'assigned', 'in_progress', 'under_review', 'completed', 'cancelled', 'negotiating']
  const priorityOptions = ['low', 'medium', 'high', 'urgent']
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'budget-asc', label: 'Budget: Low to High' },
    { value: 'budget-desc', label: 'Budget: High to Low' }
  ]
  const matchTypeOptions = [
    { value: 'any', label: 'Any Skill Match' },
    { value: 'all', label: 'All Skills Match' }
  ]

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      active: 'bg-green-100 text-green-800',
      assigned: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-purple-100 text-purple-800',
      under_review: 'bg-orange-100 text-orange-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800',
      negotiating: 'bg-yellow-100 text-yellow-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className='bg-white rounded-lg shadow p-4 md:p-6'>
      {/* Header with Clear Button */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-gray-900'>Filters</h3>
        {hasActiveFilters && (
          <button onClick={onClearAll} className='text-sm px-3 py-1 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors font-medium'>
            Clear All
          </button>
        )}
      </div>

      {/* Budget Range */}
      <div className='border-b border-gray-200 mb-4 pb-4'>
        <button onClick={() => toggleSection('budget')} className='w-full flex items-center justify-between py-2 text-left font-medium text-gray-700 hover:text-gray-900'>
          <span>Budget Range</span>
          <span className={`transform transition-transform ${expandedSections.budget ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.budget && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-3 mt-3'>
                <input
                  type='number'
                  placeholder='Min Budget'
                  value={filters.minBudget}
                  onChange={(e) => onFilterChange('minBudget', e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
                <input
                  type='number'
                  placeholder='Max Budget'
                  value={filters.maxBudget}
                  onChange={(e) => onFilterChange('maxBudget', e.target.value)}
                  className='px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Filter */}
      <div className='border-b border-gray-200 mb-4 pb-4'>
        <button onClick={() => toggleSection('status')} className='w-full flex items-center justify-between py-2 text-left font-medium text-gray-700 hover:text-gray-900'>
          <span>Status</span>
          <span className={`transform transition-transform ${expandedSections.status ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.status && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-2 mt-3'>
                {statusOptions.map((status) => (
                  <label key={status} className='flex items-center cursor-pointer'>
                    <input type='checkbox' checked={filters.status.includes(status)} onChange={() => onFilterChange('addStatus', status)} className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500' />
                    <span className='ml-2 text-sm text-gray-700 capitalize'>{status.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills Filter */}
      <div className='border-b border-gray-200 mb-4 pb-4'>
        <button onClick={() => toggleSection('skills')} className='w-full flex items-center justify-between py-2 text-left font-medium text-gray-700 hover:text-gray-900'>
          <span>Skills</span>
          <span className={`transform transition-transform ${expandedSections.skills ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.skills && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <textarea
                placeholder='Enter skills (comma-separated)'
                value={filters.skills.join(', ')}
                onChange={(e) => {
                  const skills = e.target.value
                    .split(',')
                    .map((s) => s.trim().toLowerCase())
                    .filter((s) => s.length > 0)
                  onFilterChange('skills', skills)
                }}
                className='w-full mt-3 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'
                rows='3'
              />
              {/* Match Type Toggle */}
              <div className='mt-3 flex gap-2'>
                {matchTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange('matchType', option.value)}
                    className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-colors ${filters.matchType === option.value ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Priority Filter */}
      <div className='border-b border-gray-200 mb-4 pb-4'>
        <button onClick={() => toggleSection('priority')} className='w-full flex items-center justify-between py-2 text-left font-medium text-gray-700 hover:text-gray-900'>
          <span>Priority</span>
          <span className={`transform transition-transform ${expandedSections.priority ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.priority && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-2 mt-3'>
                {priorityOptions.map((priority) => (
                  <label key={priority} className='flex items-center cursor-pointer'>
                    <input
                      type='checkbox'
                      checked={filters.priority.includes(priority)}
                      onChange={() => onFilterChange('addPriority', priority)}
                      className='w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700 capitalize'>{priority}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Options */}
      <div>
        <button onClick={() => toggleSection('sort')} className='w-full flex items-center justify-between py-2 text-left font-medium text-gray-700 hover:text-gray-900'>
          <span>Sort By</span>
          <span className={`transform transition-transform ${expandedSections.sort ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.sort && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='mt-3 flex flex-col gap-2'>
                {sortOptions.map((option) => (
                  <label key={option.value} className='flex items-center cursor-pointer'>
                    <input
                      type='radio'
                      name='sort'
                      value={option.value}
                      checked={filters.sort === option.value}
                      onChange={(e) => onFilterChange('sort', e.target.value)}
                      className='w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700'>{option.label}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
