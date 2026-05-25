import { useState, useEffect, useContext, useRef } from 'react'
import { motion } from 'framer-motion'
import { FaUser, FaBriefcase, FaSearch } from 'react-icons/fa'
import { useLocation, useSearchParams } from 'react-router-dom'
import { SearchContext } from '../../context/SearchContext'
import ProjectCard from './ProjectCard'
import FreelancerCard from './FreelancerCard'
import CardLoader from './CardLoader'
import { getAllProjects, getInterestedProjects } from '../../services/projectService'
import { getAllAnnouncements } from '../../services/announcementService'
import { getFavoriteProjects, addToFavorites, removeFromFavorites, getMyConnections } from '../../services/userService'
import molecularPattern from '../../assets/molecular-pattern.svg'
import { useAuth } from '../../context/AuthContext'

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
  budget: 'all',
  applied: 'all'
}

const defaultFreelancerFilters = {
  availability: 'all',
  verified: 'all',
  rate: 'all'
}

const getFiltersFromSearchParams = (searchParams) => ({
  project: {
    category: searchParams.get('projectCategory') || 'all',
    priority: searchParams.get('projectPriority') || 'all',
    budget: searchParams.get('projectBudget') || 'all',
    applied: searchParams.get('projectApplied') || 'all'
  },
  freelancer: {
    availability: searchParams.get('freelancerAvailability') || 'all',
    verified: searchParams.get('freelancerVerified') || 'all',
    rate: searchParams.get('freelancerRate') || 'all'
  }
})

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

const buildConnectionStatusMap = (connectionsData) => {
  const nextMap = new Map()

  if (!connectionsData) return nextMap

  connectionsData.acceptedConnections?.forEach((connection) => {
    const userId = connection.otherUser?._id
    if (userId) {
      nextMap.set(userId, 'accepted')
    }
  })

  connectionsData.incomingRequests?.forEach((connection) => {
    const userId = connection.otherUser?._id
    if (userId && !nextMap.has(userId)) {
      nextMap.set(userId, 'incoming')
    }
  })

  connectionsData.outgoingRequests?.forEach((connection) => {
    const userId = connection.otherUser?._id
    if (userId && !nextMap.has(userId)) {
      nextMap.set(userId, 'pending')
    }
  })

  return nextMap
}

const ListingTabs = () => {
  const location = useLocation()
  const { currentUser } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const initialFilters = getFiltersFromSearchParams(searchParams)
  const initialTab = normalizeListingTab(searchParams.get('tab') || location.state?.activeTab)
  const initialPage = Math.max(Number(searchParams.get('page')) || 1, 1)
  const initialSearch = searchParams.get('search') || ''

  const [activeTab, setActiveTab] = useState(initialTab)
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [projects, setProjects] = useState([])
  const [freelancers, setFreelancers] = useState([])
  const [error, setError] = useState(null)
  const [projectFilters, setProjectFilters] = useState(initialFilters.project)
  const [freelancerFilters, setFreelancerFilters] = useState(initialFilters.freelancer)
  const { searchTerm, updateSearch } = useContext(SearchContext)
  const [searchInput, setSearchInput] = useState(initialSearch)
  const hasInitializedPageReset = useRef(false)
  const [appliedProjectIds, setAppliedProjectIds] = useState(new Set())
  const [favoriteProjectIds, setFavoriteProjectIds] = useState(new Set())
  const [favoritingProjectIds, setFavoritingProjectIds] = useState(new Set())
  const [connectionStatusByFreelancerId, setConnectionStatusByFreelancerId] = useState(new Map())

  useEffect(() => {
    const nextTab = normalizeListingTab(searchParams.get('tab') || location.state?.activeTab)
    const nextPage = Math.max(Number(searchParams.get('page')) || 1, 1)
    const nextSearch = searchParams.get('search') || ''
    const nextFilters = getFiltersFromSearchParams(searchParams)

    if (nextTab !== activeTab) {
      setActiveTab(nextTab)
    }

    if (nextPage !== currentPage) {
      setCurrentPage(nextPage)
    }

    if (nextSearch !== searchTerm) {
      updateSearch(nextSearch)
    }

    if (nextSearch !== searchInput) {
      setSearchInput(nextSearch)
    }

    if (JSON.stringify(nextFilters.project) !== JSON.stringify(projectFilters)) {
      setProjectFilters(nextFilters.project)
    }

    if (JSON.stringify(nextFilters.freelancer) !== JSON.stringify(freelancerFilters)) {
      setFreelancerFilters(nextFilters.freelancer)
    }
  }, [searchParams, location.state])

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams)

    nextParams.set('tab', activeTab)

    if (currentPage > 1) {
      nextParams.set('page', String(currentPage))
    } else {
      nextParams.delete('page')
    }

    if (searchTerm) {
      nextParams.set('search', searchTerm)
    } else {
      nextParams.delete('search')
    }

    if (projectFilters.category !== 'all') nextParams.set('projectCategory', projectFilters.category)
    else nextParams.delete('projectCategory')

    if (projectFilters.priority !== 'all') nextParams.set('projectPriority', projectFilters.priority)
    else nextParams.delete('projectPriority')

    if (projectFilters.budget !== 'all') nextParams.set('projectBudget', projectFilters.budget)
    else nextParams.delete('projectBudget')

    if (projectFilters.applied !== 'all') nextParams.set('projectApplied', projectFilters.applied)
    else nextParams.delete('projectApplied')

    if (freelancerFilters.availability !== 'all') nextParams.set('freelancerAvailability', freelancerFilters.availability)
    else nextParams.delete('freelancerAvailability')

    if (freelancerFilters.verified !== 'all') nextParams.set('freelancerVerified', freelancerFilters.verified)
    else nextParams.delete('freelancerVerified')

    if (freelancerFilters.rate !== 'all') nextParams.set('freelancerRate', freelancerFilters.rate)
    else nextParams.delete('freelancerRate')

    if (nextParams.toString() !== searchParams.toString()) {
      setSearchParams(nextParams, { replace: true })
    }
  }, [activeTab, currentPage, searchTerm, projectFilters, freelancerFilters, searchParams, setSearchParams])

  const handleSearchSubmit = () => {
    updateSearch(searchInput.trim())
  }

  const handleSearchReset = () => {
    setSearchInput('')
    updateSearch('')
  }

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleSearchSubmit()
    }
  }

  useEffect(() => {
    if (!hasInitializedPageReset.current) {
      hasInitializedPageReset.current = true
      return
    }

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

      const isApplied = appliedProjectIds.has(project._id)
      const matchesApplied = projectFilters.applied === 'all' || (projectFilters.applied === 'not-applied' && !isApplied) || (projectFilters.applied === 'applied' && isApplied)

      return matchesSearch && matchesCategory && matchesPriority && matchesBudget && matchesApplied
    })
  }

  useEffect(() => {
    const loadFavoriteProjects = async () => {
      if (!currentUser) {
        setFavoriteProjectIds(new Set())
        return
      }

      try {
        const favoriteProjects = await getFavoriteProjects()
        setFavoriteProjectIds(new Set(favoriteProjects.map((project) => project._id)))
      } catch (error) {
        console.error('Error loading favorite projects:', error)
        setFavoriteProjectIds(new Set())
      }
    }

    loadFavoriteProjects()
  }, [currentUser?._id])

  useEffect(() => {
    const loadConnections = async () => {
      if (!currentUser) {
        setConnectionStatusByFreelancerId(new Map())
        return
      }

      try {
        const connectionsData = await getMyConnections()
        setConnectionStatusByFreelancerId(buildConnectionStatusMap(connectionsData))
      } catch (error) {
        console.error('Error loading connection states for listings:', error)
        setConnectionStatusByFreelancerId(new Map())
      }
    }

    loadConnections()
  }, [currentUser?._id])

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

  useEffect(() => {
    const loadAppliedProjects = async () => {
      if (!currentUser) {
        setAppliedProjectIds(new Set())
        return
      }

      try {
        const interestedProjects = await getInterestedProjects()
        const appliedIds = new Set(interestedProjects.map((project) => project._id))
        setAppliedProjectIds(appliedIds)
      } catch (error) {
        console.error('Error loading applied projects:', error)
        setAppliedProjectIds(new Set())
      }
    }

    loadAppliedProjects()
  }, [currentUser?._id])

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
    }

    fetchProjects()
  }, [activeTab])

  const handleToggleFavoriteProject = async (projectId) => {
    if (!currentUser) {
      alert('Please login to favorite projects')
      return
    }

    setFavoritingProjectIds((current) => {
      const next = new Set(current)
      next.add(projectId)
      return next
    })

    try {
      const isAlreadyFavorited = favoriteProjectIds.has(projectId)

      if (isAlreadyFavorited) {
        await removeFromFavorites(projectId)
      } else {
        await addToFavorites(projectId)
      }

      setFavoriteProjectIds((current) => {
        const next = new Set(current)

        if (next.has(projectId)) {
          next.delete(projectId)
        } else {
          next.add(projectId)
        }

        return next
      })
    } catch (error) {
      console.error('Error toggling favorite project:', error)
    } finally {
      setFavoritingProjectIds((current) => {
        const next = new Set(current)
        next.delete(projectId)
        return next
      })
    }
  }

  // Pagination
  const itemsPerPage = 6
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const filteredProjects = filterProjects(projects)
  const filteredFreelancers = filterFreelancers(freelancers)
  const projectCategories = [...new Set(projects.map((project) => project.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))

  const currentItems = activeTab === 'projects' ? filteredProjects.slice(indexOfFirstItem, indexOfLastItem) : filteredFreelancers.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil((activeTab === 'projects' ? filteredProjects.length : filteredFreelancers.length) / itemsPerPage)
  const activeProjectFilterCount = Object.values(projectFilters).filter((value) => value !== 'all').length
  const activeFreelancerFilterCount = Object.values(freelancerFilters).filter((value) => value !== 'all').length
  const activeFilterCount = activeTab === 'projects' ? activeProjectFilterCount : activeFreelancerFilterCount
  const visibleResultsCount = activeTab === 'projects' ? filteredProjects.length : filteredFreelancers.length

  return (
    <section className='w-full pt-[96px] md:pt-[104px] pb-20 theme-bg relative z-[2]'>
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
            <div className='mb-8 overflow-hidden rounded-[5px] border dark:border-light/10 border-primary/10 bg-gradient-to-br from-white/80 via-white/60 to-accent/5 dark:from-light/[0.06] dark:via-light/[0.03] dark:to-accent/10 backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.06)]'>
              <div className='flex flex-col gap-5 border-b dark:border-light/10 border-primary/10 px-5 py-5 md:px-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent'>
                      {activeTab === 'projects' ? 'Project discovery' : 'Freelancer discovery'}
                    </span>
                    <span className='inline-flex items-center rounded-full dark:bg-light/10 bg-primary/5 px-3 py-1 text-xs font-medium theme-text-secondary'>
                      {visibleResultsCount} result{visibleResultsCount === 1 ? '' : 's'}
                    </span>
                    {activeFilterCount > 0 && (
                      <span className='inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300'>
                        {activeFilterCount} active filter{activeFilterCount === 1 ? '' : 's'}
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => {
                      if (activeTab === 'projects') {
                        setProjectFilters(defaultProjectFilters)
                      } else {
                        setFreelancerFilters(defaultFreelancerFilters)
                      }
                    }}
                    className='inline-flex items-center justify-center rounded-full border dark:border-light/10 border-primary/10 px-4 py-2 text-sm font-medium theme-text-secondary hover:border-accent hover:text-accent hover:bg-accent/5 transition-all'>
                    Clear filters
                  </button>
                </div>

                <div className='grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end'>
                  <label className='block'>
                    <span className='mb-2 block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>{activeTab === 'projects' ? 'Search projects' : 'Search freelancers'}</span>
                    <div className='relative'>
                      <FaSearch className='pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-accent/80' size={16} />
                      <input
                        type='text'
                        value={searchInput}
                        onChange={(event) => setSearchInput(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={activeTab === 'projects' ? 'Search by title, description, or skills' : 'Search by name, specialty, or skills'}
                        className='h-[50px] w-full rounded-lg border dark:border-light/10 border-primary/10 bg-white/80 dark:bg-light/[0.06] pl-11 pr-4 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'
                      />
                    </div>
                  </label>

                  <div className='flex flex-col gap-3 sm:flex-row'>
                    <button onClick={handleSearchSubmit} className='inline-flex h-[50px] items-center justify-center rounded-lg bg-accent px-5 text-sm font-semibold text-white transition-all hover:bg-accent/90'>
                      Search
                    </button>

                    <button
                      onClick={handleSearchReset}
                      className='inline-flex h-[50px] items-center justify-center rounded-lg border dark:border-light/10 border-primary/10 px-5 text-sm font-medium theme-text-secondary transition-all hover:border-accent hover:text-accent hover:bg-accent/5'>
                      Reset search
                    </button>
                  </div>
                </div>
              </div>

              {activeTab === 'projects' ? (
                <div className='grid grid-cols-1 gap-4 p-5 md:grid-cols-2 xl:grid-cols-4 md:p-6'>
                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Category</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Match projects by discipline</span>
                    <select
                      value={projectFilters.category}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, category: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>All categories</option>
                      {projectCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Priority</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Surface the urgency level you want</span>
                    <select
                      value={projectFilters.priority}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, priority: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>Any priority</option>
                      <option value='low'>Low</option>
                      <option value='medium'>Medium</option>
                      <option value='high'>High</option>
                    </select>
                  </label>

                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Budget</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Screen by commercial fit</span>
                    <select
                      value={projectFilters.budget}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, budget: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>Any budget</option>
                      <option value='under-500'>Under 500 EUR</option>
                      <option value='500-2000'>500-2000 EUR</option>
                      <option value='2000-5000'>2000-5000 EUR</option>
                      <option value='5000-plus'>5000+ EUR</option>
                    </select>
                  </label>

                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Application status</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Hide projects you have already applied to</span>
                    <select
                      value={projectFilters.applied}
                      onChange={(event) => setProjectFilters((current) => ({ ...current, applied: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>All projects</option>
                      <option value='not-applied'>Hide applied projects</option>
                      <option value='applied'>Applied only</option>
                    </select>
                  </label>
                </div>
              ) : (
                <div className='grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:p-6'>
                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Availability</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>See who can start sooner</span>
                    <select
                      value={freelancerFilters.availability}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, availability: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>Any availability</option>
                      <option value='available'>Available</option>
                      <option value='limited'>Limited availability</option>
                      <option value='unavailable'>Unavailable</option>
                    </select>
                  </label>

                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Verification</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Use trust as a quick screening signal</span>
                    <select
                      value={freelancerFilters.verified}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, verified: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
                      <option value='all'>All profiles</option>
                      <option value='verified'>Verified only</option>
                      <option value='unverified'>Unverified only</option>
                    </select>
                  </label>

                  <label className='group rounded-2xl border dark:border-light/10 border-primary/10 bg-white/70 dark:bg-light/[0.03] px-4 py-4 transition-all hover:border-accent/40 hover:bg-white/90 dark:hover:bg-light/[0.05]'>
                    <span className='block text-xs font-semibold uppercase tracking-[0.16em] theme-text-secondary'>Hourly rate</span>
                    <span className='mt-1 block text-sm theme-text-secondary'>Keep pricing expectations aligned</span>
                    <select
                      value={freelancerFilters.rate}
                      onChange={(event) => setFreelancerFilters((current) => ({ ...current, rate: event.target.value }))}
                      className='theme-select mt-4 w-full rounded-xl border dark:border-light/10 border-primary/10 bg-primary/5 dark:bg-light/[0.06] px-4 py-3 theme-text outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20'>
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

              <div className='flex flex-col gap-2 border-t dark:border-light/10 border-primary/10 px-5 py-4 text-sm theme-text-secondary md:flex-row md:items-center md:justify-between md:px-6'>
                <p>
                  {activeFilterCount > 0
                    ? `Showing ${visibleResultsCount} refined result${visibleResultsCount === 1 ? '' : 's'} for the current filters.`
                    : `Showing all ${activeTab === 'projects' ? 'available projects' : 'available freelancers'} right now.`}
                </p>
                <p className='text-xs uppercase tracking-[0.16em] opacity-70'>{activeTab === 'projects' ? 'Discovery tuned for clients' : 'Discovery tuned for hiring'}</p>
              </div>
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
                    ? currentItems.map((project, index) => (
                        <ProjectCard
                          key={project._id}
                          project={project}
                          index={index}
                          isApplied={appliedProjectIds.has(project._id)}
                          isFavorited={favoriteProjectIds.has(project._id)}
                          isFavoriting={favoritingProjectIds.has(project._id)}
                          onToggleFavorite={handleToggleFavoriteProject}
                        />
                      ))
                    : currentItems.map((freelancer, index) => (
                        <FreelancerCard key={freelancer._id} freelancer={freelancer} index={index} connectionStatus={connectionStatusByFreelancerId.get(freelancer.freelancer?._id) || 'none'} />
                      ))}
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
