import { useTheme } from '../context/ThemeContext'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { ProjectFilterPanel } from '../components/shared/ProjectFilterPanel'
import { ActiveFilterChips } from '../components/shared/ActiveFilterChips'
import { SortResultsHeader } from '../components/shared/SortResultsHeader'
import { SortIndicatorBadge } from '../components/shared/SortIndicatorBadge'
import FilterSidebar from '../components/shared/FilterSidebar'
import EmptyFilterState from '../components/shared/EmptyFilterState'
import ExportResultsButton from '../components/shared/ExportResultsButton'
import ProjectCard from '../components/Listings/ProjectCard'
import CardLoader from '../components/Listings/CardLoader'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaFilter, FaChevronLeft } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { trackFilterSearch, trackFilterToggle, trackExport } from '../utils/filterAnalytics'

const FilteredProjectsView = () => {
  const { isDarkMode } = useTheme()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const { filters, loading, updateFilter, addStatusFilter, addSkillFilter, addPriorityFilter, removeFilter, clearAllFilters, hasActiveFilters, fetchFilteredProjects, results } = useProjectFilters()

  // Fetch projects when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      fetchFilteredProjects()
      // Track filter search analytics
      trackFilterSearch(filters, results.pagination?.total || 0)
    }
  }, [filters])

  // Track sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen)
    trackFilterToggle('sidebar')
  }

  // Track export action
  const handleExport = (format) => {
    trackExport(format, results.projects.length)
  }

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
    <main className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      {/* Header with back button */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} sticky top-0 z-40 backdrop-blur-md`}>
        <div className='p-4 md:p-6 flex items-center justify-between'>
          <div className='flex items-center gap-4'>
            <button onClick={() => navigate('/listings')} className={`p-2 rounded-lg transition-colors ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`} aria-label='Back to listings'>
              <FaChevronLeft size={20} />
            </button>
            <h1 className='text-3xl font-bold'>Advanced Search</h1>
          </div>

          {/* Mobile sidebar toggle */}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className='md:hidden p-2 rounded-lg bg-blue-500 text-white flex items-center gap-2'>
            <FaFilter size={16} />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main content with sidebar */}
      <div className={`flex`}>
        {/* Mobile-responsive FilterSidebar */}
        <FilterSidebar
          isOpen={sidebarOpen}
          onToggle={handleSidebarToggle}
          onClose={() => setSidebarOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          onClearAll={clearAllFilters}
          hasActiveFilters={hasActiveFilters()}
          isDarkMode={isDarkMode}
        />

        {/* Main content */}
        <div className='flex-1 w-full p-4 md:p-8'>
          {/* No filters message */}
          {!hasActiveFilters() && <EmptyFilterState isDarkMode={isDarkMode} onApplyFilter={() => setSidebarOpen(true)} />}

          {/* Active filters display */}
          {hasActiveFilters() && (
            <>
              <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={clearAllFilters} />

              {/* Sort indicator and results count */}
              <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-transparent rounded-lg border border-blue-100'>
                <div className='flex items-center justify-between flex-wrap gap-4'>
                  <div className='flex items-center gap-3'>
                    <p className='text-xs font-medium text-gray-600 uppercase tracking-wide'>Sorting</p>
                    <SortIndicatorBadge currentSort={filters.sort} onSortChange={handleSortChange} />
                  </div>
                  <div className='text-right'>
                    <p className='text-xs font-medium text-gray-600 uppercase tracking-wide'>Results</p>
                    <motion.span key={results.pagination?.total} initial={{ scale: 0.8 }} animate={{ scale: 1 }} className='inline-block text-2xl font-bold text-blue-600'>
                      {results.pagination?.total || 0}
                    </motion.span>
                  </div>
                </div>
              </div>

              {/* Results header */}
              <div className='flex items-center justify-between flex-wrap gap-4 mb-6'>
                <SortResultsHeader totalResults={results.pagination?.total || 0} currentSort={filters.sort} onSortChange={handleSortChange} />
                <ExportResultsButton projects={results.projects} filters={filters} isDarkMode={isDarkMode} />
              </div>

              {/* Loading state */}
              {loading && (
                <div className='grid grid-cols-1 gap-6 mt-6'>
                  {[...Array(6)].map((_, i) => (
                    <CardLoader key={i} />
                  ))}
                </div>
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
                  className={`p-12 rounded-lg border-2 border-dashed text-center ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-300 bg-gray-50'}`}>
                  <h3 className='text-xl font-bold mb-2'>No projects found</h3>
                  <p className={`mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Try adjusting your filters to find more projects</p>
                  <button onClick={clearAllFilters} className='px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'>
                    Clear All Filters
                  </button>
                </motion.div>
              )}

              {/* Pagination info */}
              {!loading && results.pagination?.pages > 1 && (
                <div className='mt-6 text-center text-sm text-gray-600'>
                  <p>
                    Page {results.pagination?.page} of {results.pagination?.pages}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

export default FilteredProjectsView
