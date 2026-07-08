import { useTheme } from '../context/ThemeContext'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { ProjectFilterPanel } from '../components/shared/ProjectFilterPanel'
import { ActiveFilterChips } from '../components/shared/ActiveFilterChips'
import { SortResultsHeader } from '../components/shared/SortResultsHeader'
import ListingTabs from '../components/Listings/ListingTabs'
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
    <main className={`transition-colors duration-300 ${isDarkMode ? 'bg-primary text-light' : 'bg-light text-primary'}`}>
      <div className='grid grid-cols-1 lg:grid-cols-4 gap-6 p-4 md:p-8'>
        {/* Filter Panel */}
        <aside className='lg:col-span-1'>
          <ProjectFilterPanel filters={filters} onFilterChange={handleFilterChange} onClearAll={clearAllFilters} hasActiveFilters={hasActiveFilters()} />
        </aside>

        {/* Main Content */}
        <div className='lg:col-span-3'>
          {hasActiveFilters() && <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={clearAllFilters} />}

          {hasActiveFilters() ? (
            <div className='mb-6'>
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
