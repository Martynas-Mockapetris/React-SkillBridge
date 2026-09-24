import { useTheme } from '../context/ThemeContext'
import { useProjectFilters } from '../hooks/useProjectFilters'
import { ProjectFilterPanel } from '../components/shared/ProjectFilterPanel'
import { ActiveFilterChips } from '../components/shared/ActiveFilterChips'
import ListingTabs from '../components/Listings/ListingTabs'
import molecularPattern from '../assets/molecular-pattern.svg'
import { useState } from 'react'

const defaultProjectFilters = {
  category: 'all',
  priority: 'all',
  budget: 'all',
  applied: 'all'
}

const defaultFreelancerFilters = {
  availability: 'all',
  verified: 'all',
  rate: 'all'
}

const Listings = () => {
  const { isDarkMode } = useTheme()
  const [activeTab, setActiveTab] = useState('projects')
  const [projectFilters, setProjectFilters] = useState(defaultProjectFilters)
  const [freelancerFilters, setFreelancerFilters] = useState(defaultFreelancerFilters)
  const { filters, updateFilter, addStatusFilter, addSkillFilter, addPriorityFilter, removeFilter, clearAllFilters, hasActiveFilters } = useProjectFilters()

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
    } else if (filterName === 'matchType') {
      updateFilter('matchType', 'any')
    } else {
      removeFilter(filterName, value)
    }
  }

  const handleClearAllFilters = () => {
    clearAllFilters()
    setProjectFilters(defaultProjectFilters)
    setFreelancerFilters(defaultFreelancerFilters)
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
          <div className='sticky top-20 md:static lg:static z-20 pt-[100px]'>
            <ProjectFilterPanel
              filters={filters}
              onFilterChange={handleFilterChange}
              onClearAll={handleClearAllFilters}
              hasActiveFilters={hasActiveFilters()}
              activeTab={activeTab}
              projectFilters={projectFilters}
              onProjectFiltersChange={setProjectFilters}
              freelancerFilters={freelancerFilters}
              onFreelancerFiltersChange={setFreelancerFilters}
            />
          </div>
        </aside>

        {/* Main Content */}
        <div className='md:col-span-2 lg:col-span-3'>
          {hasActiveFilters() && <ActiveFilterChips filters={filters} onRemoveFilter={handleRemoveFilter} onClearAll={handleClearAllFilters} />}

          <ListingTabs
            activeTab={activeTab}
            onActiveTabChange={setActiveTab}
            filters={filters}
            projectFilters={projectFilters}
            onProjectFiltersChange={setProjectFilters}
            freelancerFilters={freelancerFilters}
            onFreelancerFiltersChange={setFreelancerFilters}
          />
        </div>
      </div>
    </main>
  )
}

export default Listings
