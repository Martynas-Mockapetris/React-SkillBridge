import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

  return (
    <div className='rounded-lg p-4 md:p-6 border border-primary/10 dark:border-light/10 backdrop-blur-sm'>
      {/* Header with Clear Button */}
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold theme-text'>Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className='text-sm px-3 py-1 bg-primary/10 dark:bg-light/10 text-primary/60 dark:text-light/60 rounded-md hover:bg-primary/20 dark:hover:bg-light/20 hover:text-primary dark:hover:text-light transition-all duration-300 hover:shadow-lg font-medium'>
            Clear All
          </button>
        )}
      </div>

      {/* Budget Range */}
      <div className='border-b theme-border mb-4 pb-4'>
        <button onClick={() => toggleSection('budget')} className='w-full flex items-center justify-between py-2 text-left font-medium theme-text hover:theme-text-secondary transition-all duration-300'>
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
                  className='px-3 py-2 border theme-border rounded-lg text-sm theme-text focus:outline-none focus:ring-2 focus:ring-accent theme-input'
                />
                <input
                  type='number'
                  placeholder='Max Budget'
                  value={filters.maxBudget}
                  onChange={(e) => onFilterChange('maxBudget', e.target.value)}
                  className='px-3 py-2 border theme-border rounded-lg text-sm theme-text focus:outline-none focus:ring-2 focus:ring-accent theme-input'
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Status Filter */}
      <div className='border-b theme-border mb-4 pb-4'>
        <button onClick={() => toggleSection('status')} className='w-full flex items-center justify-between py-2 text-left font-medium theme-text hover:theme-text-secondary transition-all duration-300'>
          <span>Status</span>
          <span className={`transform transition-transform ${expandedSections.status ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.status && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-2 mt-3'>
                {statusOptions.map((status) => (
                  <label key={status} className='flex items-center cursor-pointer'>
                    <input type='checkbox' checked={filters.status.includes(status)} onChange={() => onFilterChange('addStatus', status)} className='w-4 h-4 rounded border-accent text-accent focus:ring-accent' />
                    <span className='ml-2 text-sm theme-text capitalize'>{status.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skills Filter */}
      <div className='border-b theme-border mb-4 pb-4'>
        <button onClick={() => toggleSection('skills')} className='w-full flex items-center justify-between py-2 text-left font-medium theme-text hover:theme-text-secondary transition-all duration-300'>
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
                className='w-full mt-3 px-3 py-2 border theme-border rounded-lg text-sm theme-text focus:outline-none focus:ring-2 focus:ring-accent resize-none theme-input'
                rows='3'
              />
              {/* Match Type Toggle */}
              <div className='mt-3 flex gap-2'>
                {matchTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => onFilterChange('matchType', option.value)}
                    className={`flex-1 px-2 py-2 text-xs font-medium rounded-lg transition-all duration-300 hover:shadow-lg ${filters.matchType === option.value ? 'bg-accent text-white' : 'bg-primary/10 dark:bg-light/10 theme-text-secondary hover:bg-primary/20 dark:hover:bg-light/20'}`}>
                    {option.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Priority Filter */}
      <div className='border-b theme-border mb-4 pb-4'>
        <button onClick={() => toggleSection('priority')} className='w-full flex items-center justify-between py-2 text-left font-medium theme-text hover:theme-text-secondary transition-all duration-300'>
          <span>Priority</span>
          <span className={`transform transition-transform ${expandedSections.priority ? 'rotate-180' : ''}`}>▼</span>
        </button>
        <AnimatePresence>
          {expandedSections.priority && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              <div className='grid grid-cols-2 gap-2 mt-3'>
                {priorityOptions.map((priority) => (
                  <label key={priority} className='flex items-center cursor-pointer'>
                    <input type='checkbox' checked={filters.priority.includes(priority)} onChange={() => onFilterChange('addPriority', priority)} className='w-4 h-4 rounded border-accent text-accent focus:ring-accent' />
                    <span className='ml-2 text-sm theme-text capitalize'>{priority}</span>
                  </label>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sort Options - Always Visible */}
      <div className='pt-4 border-t theme-border mt-4'>
        <div className='flex items-center justify-between mb-3'>
          <h4 className='font-medium theme-text'>Sort Results</h4>
          <div className='flex-1 ml-3 h-0.5 bg-gradient-to-r from-accent to-transparent'></div>
        </div>
        <div className='flex flex-col gap-2'>
          {sortOptions.map((option) => (
            <motion.label key={option.value} whileHover={{ x: 4 }} className='flex items-center cursor-pointer group'>
              <input
                type='radio'
                name='sort'
                value={option.value}
                checked={filters.sort === option.value}
                onChange={(e) => onFilterChange('sort', e.target.value)}
                className='w-4 h-4 border-accent text-accent focus:ring-accent'
              />
              <span className='ml-2 text-sm theme-text group-hover:text-accent transition-colors'>{option.label}</span>
              {filters.sort === option.value && <motion.div layoutId='activeSort' className='ml-auto w-2 h-2 bg-accent rounded-full' initial={{ scale: 0 }} animate={{ scale: 1 }} />}
            </motion.label>
          ))}
        </div>
      </div>
    </div>
  )
}
