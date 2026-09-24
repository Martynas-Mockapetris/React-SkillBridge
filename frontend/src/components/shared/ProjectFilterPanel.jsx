import { useState } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'

export const ProjectFilterPanel = ({ filters, onFilterChange, onClearAll, hasActiveFilters, activeTab, projectFilters, onProjectFiltersChange, freelancerFilters, onFreelancerFiltersChange }) => {
  const [expandedSections, setExpandedSections] = useState({
    budget: true,
    status: true,
    skills: true,
    priority: false,
    specific: true
  })

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const statusOptions = ['draft', 'active', 'assigned', 'in_progress', 'under_review', 'completed', 'cancelled', 'negotiating']
  const priorityOptions = ['low', 'medium', 'high', 'urgent']
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
      <div className='mb-4 pb-4'>
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

      {/* Tab-specific filters */}
      <div className='theme-border'>
        <button onClick={() => toggleSection('specific')} className='w-full flex items-center justify-between py-2 text-left font-medium theme-text hover:theme-text-secondary transition-all duration-300'>
          <span>{activeTab === 'projects' ? 'Project Filters' : 'Freelancer Filters'}</span>
          <span className={`transform transition-transform ${expandedSections.specific ? 'rotate-180' : ''}`}>▼</span>
        </button>

        <AnimatePresence>
          {expandedSections.specific && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='overflow-hidden'>
              {activeTab === 'projects' ? (
                <div className='space-y-3 mt-3'>
                  <select
                    value={projectFilters.category}
                    onChange={(event) => onProjectFiltersChange((current) => ({ ...current, category: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      All categories
                    </option>
                    <option value='Web Development'>Web Development</option>
                    <option value='Backend Development'>Backend Development</option>
                    <option value='UI/UX Design'>UI/UX Design</option>
                    <option value='Mobile Development'>Mobile Development</option>
                    <option value='DevOps'>DevOps</option>
                  </select>

                  <select
                    value={projectFilters.budget}
                    onChange={(event) => onProjectFiltersChange((current) => ({ ...current, budget: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      Any budget
                    </option>
                    <option value='under-500'>Under 500 EUR</option>
                    <option value='500-2000'>500-2000 EUR</option>
                    <option value='2000-5000'>2000-5000 EUR</option>
                    <option value='5000-plus'>5000+ EUR</option>
                  </select>

                  <select
                    value={projectFilters.applied}
                    onChange={(event) => onProjectFiltersChange((current) => ({ ...current, applied: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      All projects
                    </option>
                    <option value='not-applied'>Hide applied projects</option>
                    <option value='applied'>Applied only</option>
                  </select>
                </div>
              ) : (
                <div className='space-y-3 mt-3'>
                  <select
                    value={freelancerFilters.availability}
                    onChange={(event) => onFreelancerFiltersChange((current) => ({ ...current, availability: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      Any availability
                    </option>
                    <option value='available'>Available</option>
                    <option value='limited'>Limited availability</option>
                    <option value='unavailable'>Unavailable</option>
                  </select>

                  <select
                    value={freelancerFilters.verified}
                    onChange={(event) => onFreelancerFiltersChange((current) => ({ ...current, verified: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      All profiles
                    </option>
                    <option value='verified'>Verified only</option>
                    <option value='unverified'>Unverified only</option>
                  </select>

                  <select
                    value={freelancerFilters.rate}
                    onChange={(event) => onFreelancerFiltersChange((current) => ({ ...current, rate: event.target.value }))}
                    className='w-full rounded-lg border theme-border bg-white dark:bg-gray-800 px-3 py-2 text-sm text-primary dark:text-light theme-select'>
                    <option value='all' className='bg-white text-primary dark:bg-gray-800 dark:text-light'>
                      Any rate
                    </option>
                    <option value='under-25'>Under 25 EUR/hr</option>
                    <option value='25-50'>25-50 EUR/hr</option>
                    <option value='50-100'>50-100 EUR/hr</option>
                    <option value='100-plus'>100+ EUR/hr</option>
                    <option value='unspecified'>Rate on request</option>
                  </select>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

ProjectFilterPanel.propTypes = {
  filters: PropTypes.object.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired,
  hasActiveFilters: PropTypes.bool,
  activeTab: PropTypes.oneOf(['projects', 'freelancers']).isRequired,
  projectFilters: PropTypes.shape({
    category: PropTypes.string,
    priority: PropTypes.string,
    budget: PropTypes.string,
    applied: PropTypes.string
  }).isRequired,
  onProjectFiltersChange: PropTypes.func.isRequired,
  freelancerFilters: PropTypes.shape({
    availability: PropTypes.string,
    verified: PropTypes.string,
    rate: PropTypes.string
  }).isRequired,
  onFreelancerFiltersChange: PropTypes.func.isRequired
}
