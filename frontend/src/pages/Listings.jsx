import { useTheme } from '../context/ThemeContext'
import { motion } from 'framer-motion'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { ProjectFilterPanel } from '../components/shared/ProjectFilterPanel'
import { ActiveFilterChips } from '../components/shared/ActiveFilterChips'
import { SortResultsHeader } from '../components/shared/SortResultsHeader'
import { SortIndicatorBadge } from '../components/shared/SortIndicatorBadge'
import ListingTabs from '../components/Listings/ListingTabs'
import molecularPattern from '../assets/molecular-pattern.svg'
import { useEffect } from 'react'

const Listings = () => {
  const { isDarkMode } = useTheme()
  const { filters, updateFilter, addStatusFilter, addSkillFilter, addPriorityFilter, removeFilter, clearAllFilters, hasActiveFilters, fetchFilteredProjects, results } = useProjectFilters()

  // Fetch projects when filters change
  useEffect(() => {
    if (hasActiveFilters()) {
      fetchFilteredProjects()
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
    <main className={`relative transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      {/* Background Patterns */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute -left-40 -top-20 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[550px] h-[550px] rotate-45' />
        </div>
        <div className='absolute -right-32 bottom-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[450px] h-[450px] rotate-[-30deg]' />
        </div>
      </div>

      <div className='relative z-10 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 p-4 sm:p-6 md:p-8'>
        {/* Filter Panel */}
        <aside className='md:col-span-1 lg:col-span-1'>
          <div className='sticky top-20 md:static lg:static z-20 pt-[100px] sm:pt-[80px] md:pt-0'>
            <ProjectFilterPanel filters={filters} onFilterChange={handleFilterChange} onClearAll={clearAllFilters} hasActiveFilters={hasActiveFilters()} />
          </div>
        </aside>

        {/* Main Content */}
        <div className='md:col-span-2 lg:col-span-3'>
          {hasActiveFilters() && <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={clearAllFilters} />}

          {hasActiveFilters() ? (
            <div className='mb-6'>
              <div className='flex items-center justify-between mb-4 p-4 rounded-lg border border-primary/10 dark:border-light/10'>
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
              <ListingTabs filteredProjects={results.projects} isFiltered={true} />
            </div>
          ) : (
            <ListingTabs />
          )}
        </div>
      </div>
    </main>
  )
}

export default Listings
