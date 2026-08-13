import { useTheme } from '../context/ThemeContext'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { ProjectFilterPanel } from '../components/shared/ProjectFilterPanel'
import { ActiveFilterChips } from '../components/shared/ActiveFilterChips'
import { SortResultsHeader } from '../components/shared/SortResultsHeader'
import { SortIndicatorBadge } from '../components/shared/SortIndicatorBadge'
import EmptyFilterState from '../components/shared/EmptyFilterState'
import ProjectCard from '../components/Listings/ProjectCard'
import CardLoader from '../components/Listings/CardLoader'
import LoadingSpinner from '../components/shared/LoadingSpinner'
import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { trackFilterSearch, trackExport } from '../utils/filterAnalytics'

const FilteredProjectsView = () => {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const { filters, loading, updateFilter, addStatusFilter, addSkillFilter, addPriorityFilter, removeFilter, clearAllFilters, hasActiveFilters, fetchFilteredProjects, results } = useProjectFilters()

  // Fetch projects when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      fetchFilteredProjects()
      // Track filter search analytics
      trackFilterSearch(filters, results.pagination?.total || 0)
    }
  }, [filters])

  const handleFilterChange = (filterName, value) => {
    if (filterName === 'addStatus') {
      addStatusFilter(value)
    } else if (filterName === 'addSkill') {
      addSkillFilter(value)
    } else if (filterName === 'addPriority') {
      addPriorityFilter(value)
    } else {
      updateFilter(filterName, value)
    }
  }

  const handleRemoveFilter = (filterName, value) => {
    if (filterName === 'budget') {
      updateFilter('minBudget', '')
      updateFilter('maxBudget', '')
    } else if (filterName === 'sort') {
      updateFilter('sort', 'newest')
    } else if (filterName === 'matchType') {
      updateFilter('matchType', 'any')
    } else {
      removeFilter(filterName, value)
    }
  }

  const handleSortChange = (sortValue) => {
    updateFilter('sort', sortValue)
  }

  return (
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-8'>
        {/* Filter Panel */}
        <aside className='lg:col-span-1'>
          <div className='sticky top-20 lg:static z-20 pt-[100px]'>
            <ProjectFilterPanel filters={filters} onFilterChange={handleFilterChange} onClearAll={clearAllFilters} hasActiveFilters={hasActiveFilters()} />
          </div>
        </aside>

        {/* Main Content */}
        <div className='lg:col-span-3'>
          {hasActiveFilters() && <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={clearAllFilters} />}

          {hasActiveFilters() ? (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4 p-4 bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent rounded-lg border border-primary/10 dark:border-light/10 backdrop-blur-sm'>
                <div className='flex items-center gap-3'>
                  <div>
                    <p className='text-xs font-medium theme-text-secondary uppercase tracking-wide'>Sorting</p>
                    <SortIndicatorBadge currentSort={filters.sort} onSortChange={handleSortChange} />
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-xs font-medium theme-text-secondary uppercase tracking-wide'>Results</p>
                  <motion.span key={results.pagination?.total} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className='inline-block text-2xl font-bold text-accent'>
                    {results.pagination?.total || 0}
                  </motion.span>
                </div>
              </div>
              <SortResultsHeader totalResults={results.pagination?.total || 0} currentSort={filters.sort} onSortChange={handleSortChange} />

              {/* Loading state */}
              {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='mt-6'>
                  <div className='flex justify-center mb-8'>
                    <LoadingSpinner size='md' />
                  </div>
                  <div className='grid grid-cols-1 gap-6'>
                    {[...Array(6)].map((_, i) => (
                      <CardLoader key={i} />
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Projects grid */}
              {!loading && results.projects.length > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='grid grid-cols-1 gap-6 mt-6'>
                  <AnimatePresence>
                    {results.projects.map((project) => (
                      <motion.div key={project._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                        <ProjectCard project={project} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {/* No results state */}
              {!loading && results.projects.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`p-12 rounded-lg border-2 border-dashed text-center border-primary/10 dark:border-light/10 bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm`}>
                  <h3 className='text-xl font-bold mb-2'>No projects found</h3>
                  <p className={`mb-4 theme-text-secondary`}>Try adjusting your filters to find more projects</p>
                  <button onClick={clearAllFilters} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/80 transition-colors font-medium'>
                    Clear All Filters
                  </button>
                </motion.div>
              )}

              {/* Pagination info */}
              {!loading && results.pagination?.pages > 1 && (
                <div className='mt-8 text-center text-sm theme-text-secondary'>
                  <p className='font-medium'>
                    Page {results.pagination?.page} of {results.pagination?.pages}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <EmptyFilterState isDarkMode={isDarkMode} onApplyFilter={() => {}} />
          )}
        </div>
      </div>
    </main>
  )
}

export default FilteredProjectsView
