import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { FaTimes } from 'react-icons/fa'

export const ActiveFilterChips = ({ filters, onRemoveFilter, onClearAll }) => {
  const activeFilters = []

  // Budget range
  if (filters.minBudget || filters.maxBudget) {
    activeFilters.push({
      id: 'budget',
      label: `Budget: €${filters.minBudget || '0'} - €${filters.maxBudget || '∞'}`,
      onRemove: () => {
        onRemoveFilter('budget', null)
      }
    })
  }

  // Status filters
  filters.status?.forEach((status) => {
    activeFilters.push({
      id: `status-${status}`,
      label: status.replace('_', ' '),
      type: 'status',
      onRemove: () => onRemoveFilter('status', status)
    })
  })

  // Skills filters
  filters.skills?.forEach((skill) => {
    activeFilters.push({
      id: `skill-${skill}`,
      label: skill,
      type: 'skill',
      onRemove: () => onRemoveFilter('skills', skill)
    })
  })

  // Priority filters
  filters.priority?.forEach((priority) => {
    activeFilters.push({
      id: `priority-${priority}`,
      label: priority,
      type: 'priority',
      onRemove: () => onRemoveFilter('priority', priority)
    })
  })

  // Match type (only show if skills filter active)
  if (filters.skills?.length > 0 && filters.matchType !== 'any') {
    activeFilters.push({
      id: 'matchType',
      label: `Match: ${filters.matchType} skills`,
      onRemove: () => onRemoveFilter('matchType', null)
    })
  }

  // // Sort (only show if not default)
  // if (filters.sort !== 'newest') {
  //   const sortLabels = {
  //     oldest: 'Oldest First',
  //     'budget-asc': 'Budget: Low to High',
  //     'budget-desc': 'Budget: High to Low',
  //     'deadline-asc': 'Deadline: Soonest First',
  //     'deadline-desc': 'Deadline: Latest First'
  //   }
  //   activeFilters.push({
  //     id: 'sort',
  //     label: `Sort: ${sortLabels[filters.sort]}`,
  //     onRemove: () => onRemoveFilter('sort', null)
  //   })
  // }

  if (activeFilters.length === 0) {
    return null
  }

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className='mb-6 p-4 border border-primary/10 dark:border-light/10 rounded-lg'>
      <div className='flex items-center justify-between mb-3'>
        <h4 className='text-sm font-semibold theme-text-secondary'>Active Filters</h4>
        <button
          onClick={onClearAll}
          className='text-xs px-2 py-1 bg-primary/10 dark:bg-light/10 text-primary/60 dark:text-light/60 rounded hover:bg-primary/20 dark:hover:bg-light/20 hover:text-primary dark:hover:text-light transition-all duration-300 hover:shadow-lg font-medium'>
          Clear All
        </button>
      </div>

      <div className='flex flex-wrap gap-2'>
        <AnimatePresence>
          {activeFilters.map((filter) => (
            <motion.div
              key={filter.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className='inline-flex items-center gap-2 px-3 py-1 bg-light/10 dark:bg-light/5 border border-primary/10 dark:border-light/10 rounded-full text-sm theme-text-secondary backdrop-blur-sm'>
              <span>{filter.label}</span>
              <button onClick={filter.onRemove} className='ml-1 theme-text-secondary hover:text-accent transition-all duration-300' aria-label={`Remove ${filter.label} filter`}>
                <FaTimes size={12} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

ActiveFilterChips.propTypes = {
  filters: PropTypes.object.isRequired,
  onRemoveFilter: PropTypes.func.isRequired,
  onClearAll: PropTypes.func.isRequired
}
