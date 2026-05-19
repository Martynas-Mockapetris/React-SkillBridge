import { useState, useEffect, useContext } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase } from 'react-icons/fa'
import { useLocation } from 'react-router-dom'
import { SearchContext } from '../../context/SearchContext'
import ProjectCard from './ProjectCard'
import FreelancerCard from './FreelancerCard'
import CardLoader from './CardLoader'
import { getAllProjects } from '../../services/projectService'
import { getAllAnnouncements } from '../../services/announcementService'
import molecularPattern from '../../assets/molecular-pattern.svg'

const parseCommaSeparatedList = (value) => {
  if (!value || typeof value !== 'string') return []

  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

const formatAvailabilityLabel = (value) => {
  switch (value) {
    case 'available':
      return 'Available'
    case 'limited':
      return 'Limited availability'
    case 'unavailable':
      return 'Unavailable'
    default:
      return 'Availability not specified'
  }
}

const buildFreelancerListingModel = (announcement) => {
  const user = announcement.userId || {}
  const name = [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || 'Freelancer'

  const fallbackSkills = parseCommaSeparatedList(user.skills)
  const fallbackCategories = parseCommaSeparatedList(user.serviceCategories)
  const primarySkills = (announcement.skills && announcement.skills.length > 0 ? announcement.skills : [...fallbackSkills, ...fallbackCategories]).slice(0, 4)

  const specialty = user.headline?.trim() || fallbackCategories[0] || 'Freelancer available for project work'
  const publicLocation = user.showLocationPublic && user.location ? user.location : ''
  const effectiveHourlyRate = user.showHourlyRate ? (user.hourlyRate ?? announcement.hourlyRate ?? null) : null

  return {
    _id: announcement._id,
    title: announcement.title,
    background: announcement.background,
    hourlyRate: announcement.hourlyRate,
    skills: announcement.skills,
    isActive: announcement.isActive,
    name,
    specialty,
    searchText: [name, specialty, announcement.title, announcement.background, ...primarySkills].filter(Boolean).join(' ').toLowerCase(),
    freelancer: {
      _id: user._id,
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      name,
      specialty,
      profilePicture: user.profilePicture || '',
      userType: user.userType,
      headline: user.headline || '',
      availabilityStatus: user.availabilityStatus || 'available',
      availabilityLabel: formatAvailabilityLabel(user.availabilityStatus),
      experienceLevel: user.experienceLevel || 'entry',
      yearsOfExperience: user.yearsOfExperience ?? 0,
      skills: user.skills || '',
      serviceCategories: user.serviceCategories || '',
      primarySkills,
      location: publicLocation,
      timezone: user.timezone || '',
      hourlyRate: effectiveHourlyRate,
      hourlyRateLabel: effectiveHourlyRate !== null ? `€${effectiveHourlyRate}/hr` : 'Rate on request',
      showHourlyRate: user.showHourlyRate ?? true,
      showLocationPublic: user.showLocationPublic ?? true,
      profileVisibility: user.profileVisibility || 'public',
      isEmailVerified: Boolean(user.isEmailVerified)
    }
  }
}

const normalizeListingTab = (value) => {
  if (value === 'freelancers' || value === 'talent') return 'freelancers'
  if (value === 'projects' || value === 'work') return 'projects'
  return 'projects'
}

const defaultProjectFilters = {
  category: 'all',
  priority: 'all',
  budget: 'all'
}

const defaultFreelancerFilters = {
  availability: 'all',
  verified: 'all',
  rate: 'all'
}

const matchesBudgetRange = (budget, range) => {
  if (range === 'all') return true

  const normalizedBudget = Number(budget)
  if (Number.isNaN(normalizedBudget)) return false

  switch (range) {
    case 'under-500':
      return normalizedBudget < 500
    case '500-2000':
      return normalizedBudget >= 500 && normalizedBudget <= 2000
    case '2000-5000':
      return normalizedBudget > 2000 && normalizedBudget <= 5000
    case '5000-plus':
      return normalizedBudget > 5000
    default:
      return true
  }
}

const matchesRateRange = (rate, range) => {
  if (range === 'all') return true
  if (range === 'unspecified') return rate === null || rate === undefined || Number.isNaN(Number(rate))

  const normalizedRate = Number(rate)
  if (Number.isNaN(normalizedRate)) return false

  switch (range) {
    case 'under-25':
      return normalizedRate < 25
    case '25-50':
      return normalizedRate >= 25 && normalizedRate <= 50
    case '50-100':
      return normalizedRate > 50 && normalizedRate <= 100
    case '100-plus':
      return normalizedRate > 100
    default:
      return true
  }
}

const ListingTabs = () => {
  const location = useLocation()
  const initialTab = normalizeListingTab(location.state?.activeTab)

  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [projects, setProjects] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [error, setError] = useState(null)
  const [projectFilters, setProjectFilters] = useState(defaultProjectFilters)
  const [freelancerFilters, setFreelancerFilters] = useState(defaultFreelancerFilters)
  const { searchTerm } = useContext(SearchContext)

  useEffect(() => {
    const nextTab = normalizeListingTab(location.state?.activeTab)
    setActiveTab(nextTab)
    setCurrentPage(1)
  }, [location.state])

  useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchTerm, projectFilters, freelancerFilters])

  // Function to filter projects by search term and project-specific filters
  const filterProjects = (projectsList) => {
    const normalizedSearch = searchTerm.toLowerCase()

    return projectsList.filter((project) => {
      const matchesSearch =
        !searchTerm ||
        project.title.toLowerCase().includes(normalizedSearch) ||
        project.description.toLowerCase().includes(normalizedSearch) ||
        project.skills?.some((skill) => skill.toLowerCase().includes(normalizedSearch))

      const matchesCategory = projectFilters.category === 'all' || project.category === projectFilters.category
      const matchesPriority = projectFilters.priority === 'all' || (project.priority || 'low') === projectFilters.priority
      const matchesBudget = matchesBudgetRange(project.budget, projectFilters.budget)

      return matchesSearch && matchesCategory && matchesPriority && matchesBudget
    })
  }

  // Function to filter freelancers by search term and freelancer-specific filters
  const filterFreelancers = (freelancersList) => {
    const normalizedSearch = searchTerm.toLowerCase()

    return freelancersList.filter((freelancer) => {
      const freelancerInfo = freelancer.freelancer || {}

      const matchesSearch = !searchTerm || freelancer.searchText?.includes(normalizedSearch)
      const matchesAvailability = freelancerFilters.availability === 'all' || freelancerInfo.availabilityStatus === freelancerFilters.availability
      const matchesVerified = freelancerFilters.verified === 'all' || (freelancerFilters.verified === 'verified' ? Boolean(freelancerInfo.isEmailVerified) : !freelancerInfo.isEmailVerified)
      const matchesRate = matchesRateRange(freelancerInfo.hourlyRate, freelancerFilters.rate)

      return matchesSearch && matchesAvailability && matchesVerified && matchesRate
    })
  }

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      if (activeTab === 'projects') {
        try {
          setIsLoading(true)
          setError(null)
          const data = await getAllProjects()
          setProjects(data)
        } catch (err) {
          console.error('Error fetching projects:', err)
          setError('Failed to load projects. Please try again.')
        } finally {
          setIsLoading(false)
        }
      } else {
        // Fetch announcements from freelancers
        try {
          setIsLoading(true)
          setError(null)

          // Fetch all active announcements with populated user data
          const announcements = await getAllAnnouncements()

          // Filter to only include announcements from freelancers or both users
          const filteredAnnouncements = announcements.filter((announcement) => announcement.userId && ['freelancer', 'both'].includes(announcement.userId.userType))

          const mapped = filteredAnnouncements.map(buildFreelancerListingModel)

          setFreelancers(mapped)
        } catch (err) {
          console.error('Error fetching freelancers:', err)
          setError('Failed to load freelancers. Please try again.')
        } finally {
          setIsLoading(false)
        }
      }
      setCurrentPage(1)
    }

    fetchProjects()
  }, [activeTab])

  // Pagination
  const itemsPerPage = 6
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const filteredProjects = filterProjects(projects)
  const filteredFreelancers = filterFreelancers(freelancers)
  const projectCategories = [...new Set(projects.map((project) => project.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))

  const currentItems = activeTab === 'projects' ? filteredProjects.slice(indexOfFirstItem, indexOfLastItem) : filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil((activeTab === 'projects' ? filteredProjects.length : filteredFreelancers.length) / itemsPerPage)

  return (
    <section className='w-full pt-0 pb-20 theme-bg relative z-[2]'>
      <div className='absolute inset-0 overflow-hidden'>
        {/* Molecular patterns */}
        <div className='absolute -left-20 top-40 opacity-20'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
        </div>
        <div className='absolute -right-20 bottom-20 opacity-15'>
          <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[-30deg]' />
        </div>
        <div className='absolute left-3/4 top-28 opacity-10'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[35deg]' />
        </div>
        <div className='absolute right-1/3 top-1/3 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[60deg]' />
        </div>
        <div className='absolute left-1/3 bottom-40 opacity-5'>
          <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-15deg]' />
        </div>
      </div>

      {/* Main container */}
      <div className='container mx-auto px-4 relative z-10'>
        <div className='max-w-8xl mx-auto'>
          {/* Projects and Freelancers tabs */}
          <div className='flex w-full'>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'projects'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaBriefcase className='text-lg' />
              <span className='font-medium'>Projects</span>
            </button>
            <button
              onClick={() => setActiveTab('freelancers')}
              className={`flex-1 py-4 px-6 flex items-center justify-center gap-2 border-b-2 transition-all duration-300 ${
                activeTab === 'freelancers'
                  ? 'border-accent text-accent dark:bg-light/5 bg-primary/5'
                  : 'dark:border-light/10 border-primary/10 dark:text-light/60 text-primary/60 dark:hover:text-light/80 hover:text-primary/80 dark:hover:bg-light/5 hover:bg-primary/5'
              }`}>
              <FaUser className='text-lg' />
              <span className='font-medium'>Freelancers</span>
            </button>
          </div>

          {/* Content section with animation */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'projects' ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'projects' ? 20 : -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className='bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent backdrop-blur-sm rounded-b-lg p-12'>
            <div className='mb-8 rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] backdrop-blur-sm p-5'>
              <div className='flex items-center justify-between gap-3 flex-wrap mb-4'>
                <div>
                  <h3 className='text-lg font-semibold theme-text'>{activeTab === 'projects' ? 'Project filters' : 'Freelancer filters'}</h3>
                  <p className='text-sm theme-text-secondary'>Refine {activeTab === 'projects' ? 'project opportunities' : 'freelancer matches'} using filters tailored to the selected tab.</p>
                </div>

                <button
                  onClick={() => {
                    if (activeTab === 'projects') {
                      setProjectFilters(defaultProjectFilters)
                    } else {
                      setFreelancerFilters(defaultFreelancerFilters)
                    }
                  }}
                  className='px-4 py-2 rounded-lg border dark:border-light/10 border-primary/10 theme-text-secondary hover:text-accent hover:border-accent transition-colors'>
                  Clear filters
                </button>
              </div>

              {activeTab === 'projects' ? (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Category</span>
                    <select
                      value={projectFilters.category}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, category: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>All categories</option>
                      {projectCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Priority</span>
                    <select
                      value={projectFilters.priority}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, priority: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>Any priority</option>
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </label>

                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Budget</span>
                    <select
                      value={projectFilters.budget}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, budget: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>Any budget</option>
                      <option value='under-500'>Under 500 EUR</option>
                      <option value='500-2000'>500-2000 EUR</option>
                      <option value='2000-5000'>2000-5000 EUR</option>
                      <option value='5000-plus'>5000+ EUR</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Availability</span>
                    <select
                      value={freelancerFilters.availability}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, availability: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>Any availability</option>
                      <option value='available'>Available</option>
                      <option value='limited'>Limited availability</option>
                      <option value='unavailable'>Unavailable</option>
                    </select>
                  </label>

                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Verification</span>
                    <select
                      value={freelancerFilters.verified}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, verified: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>All profiles</option>
                      <option value='verified'>Verified only</option>
                      <option value='unverified'>Unverified only</option>
                    </select>
                  </label>

                  <label className='space-y-2'>
                    <span className='block text-sm font-medium theme-text'>Hourly rate</span>
                    <select
                      value={freelancerFilters.rate}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, rate: event.target.value }))}
                      className='w-full px-4 py-3 rounded-xl theme-input theme-text border dark:border-light/10 border-primary/10'>
                      <option value='all'>Any rate</option>
                      <option value='under-25'>Under 25 EUR/hr</option>
                      <option value='25-50'>25-50 EUR/hr</option>
                      <option value='50-100'>50-100 EUR/hr</option>
                      <option value='100-plus'>100+ EUR/hr</option>
                      <option value='unspecified'>Rate on request</option>
                    </select>
                  </label>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && activeTab === 'projects' && (
              <div className='text-center py-8'>
                <p className='text-red-500 mb-4'>{error}</p>
                <button onClick={() => window.location.reload()} className='px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all'>
                  Retry
                </button>
              </div>
            )}

            {/* Empty state for projects */}
            {!isLoading && !error && activeTab === 'projects' && projects.length === 0 && (
              <div className='text-center py-12'>
                <FaBriefcase className='text-6xl theme-text-secondary mx-auto mb-4 opacity-50' />
                <h3 className='text-xl font-semibold theme-text mb-2'>No projects available</h3>
                <p className='theme-text-secondary'>Check back later for new opportunities!</p>
              </div>
            )}

            {!isLoading && !error && activeTab === 'projects' && projects.length > 0 && filteredProjects.length === 0 && (
              <div className='text-center py-12'>
                <FaBriefcase className='text-6xl theme-text-secondary mx-auto mb-4 opacity-50' />
                <h3 className='text-xl font-semibold theme-text mb-2'>No projects match these filters</h3>
                <p className='theme-text-secondary'>Try broadening the category, priority, budget, or search criteria.</p>
              </div>
            )}

            {!isLoading && activeTab === 'freelancers' && filteredFreelancers.length === 0 && (
              <div className='text-center py-12'>
                <FaUser className='text-6xl theme-text-secondary mx-auto mb-4 opacity-50' />
                <h3 className='text-xl font-semibold theme-text mb-2'>No freelancers match these filters</h3>
                <p className='theme-text-secondary'>Adjust availability, verification, rate, or search to widen the results.</p>
              </div>
            )}

            {/* Grid of cards */}
            {((!error || activeTab === 'freelancers') && isLoading) || currentItems.length > 0 ? (
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                {isLoading
                  ? Array(6)
                      .fill(0)
                      .map((_, index) => <CardLoader key={index} />)
                  : activeTab === 'projects'
                    ? currentItems.map((project, index) => <ProjectCard key={project._id} project={project} index={index} />)
                    : currentItems.map((freelancer, index) => <FreelancerCard key={freelancer._id} freelancer={freelancer} index={index} />)}
              </div>
            ) : null}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
              <div className='mt-12 flex justify-center gap-2'>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-10 h-10 rounded-lg transition-all duration-300 ${currentPage === i + 1 ? 'bg-accent text-white' : 'bg-accent/20 text-accent hover:bg-accent/30'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}

export default ListingTabs
