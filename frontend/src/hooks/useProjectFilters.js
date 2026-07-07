import { useState, useCallback, useEffect } from 'react'
import { toast } from 'react-toastify'

export const useProjectFilters = () => {
  const [filters, setFilters] = useState({
    minBudget: '',
    maxBudget: '',
    status: [],
    skills: [],
    priority: [],
    matchType: 'any',
    sort: 'newest'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [results, setResults] = useState({
    projects: [],
    pagination: { total: 0, page: 1, limit: 10, pages: 0 },
    appliedFilters: {}
  })

  // Load filters from localStorage on mount
  useEffect(() => {
    const savedFilters = localStorage.getItem('projectFilters')
    if (savedFilters) {
      try {
        const parsed = JSON.parse(savedFilters)
        setFilters(parsed)
      } catch (err) {
        console.error('Failed to parse saved filters:', err)
      }
    }
  }, [])

  // Save filters to localStorage when changed
  useEffect(() => {
    localStorage.setItem('projectFilters', JSON.stringify(filters))
  }, [filters])

  const updateFilter = useCallback((filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
      // Reset pagination when filter changes
      page: 1
    }))
  }, [])

  const updateMultipleFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1
    }))
  }, [])

  const addStatusFilter = useCallback((status) => {
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status) ? prev.status.filter((s) => s !== status) : [...prev.status, status],
      page: 1
    }))
  }, [])

  const addSkillFilter = useCallback((skill) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill) ? prev.skills.filter((s) => s !== skill) : [...prev.skills, skill],
      page: 1
    }))
  }, [])

  const addPriorityFilter = useCallback((priority) => {
    setFilters((prev) => ({
      ...prev,
      priority: prev.priority.includes(priority) ? prev.priority.filter((p) => p !== priority) : [...prev.priority, priority],
      page: 1
    }))
  }, [])

  const removeFilter = useCallback((filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: Array.isArray(prev[filterName]) ? prev[filterName].filter((item) => item !== value) : '',
      page: 1
    }))
  }, [])

  const clearAllFilters = useCallback(() => {
    setFilters({
      minBudget: '',
      maxBudget: '',
      status: [],
      skills: [],
      priority: [],
      matchType: 'any',
      sort: 'newest'
    })
    setResults({
      projects: [],
      pagination: { total: 0, page: 1, limit: 10, pages: 0 },
      appliedFilters: {}
    })
  }, [])

  const hasActiveFilters = useCallback(() => {
    return filters.minBudget || filters.maxBudget || filters.status.length > 0 || filters.skills.length > 0 || filters.priority.length > 0 || filters.sort !== 'newest'
  }, [filters])

  const fetchFilteredProjects = useCallback(
    async (page = 1) => {
      try {
        setLoading(true)
        setError(null)

        // Build query parameters
        const params = new URLSearchParams()

        if (filters.minBudget) params.append('minBudget', filters.minBudget)
        if (filters.maxBudget) params.append('maxBudget', filters.maxBudget)
        if (filters.status.length > 0) params.append('status', filters.status.join(','))
        if (filters.skills.length > 0) params.append('skills', filters.skills.join(','))
        if (filters.priority.length > 0) params.append('priority', filters.priority.join(','))

        params.append('matchType', filters.matchType)
        params.append('sort', filters.sort)
        params.append('page', page)
        params.append('limit', 10)

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/projects/filter?${params.toString()}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include'
        })

        if (!response.ok) {
          throw new Error('Failed to fetch filtered projects')
        }

        const data = await response.json()
        setResults(data.data)
        setError(null)
      } catch (err) {
        console.error('Error fetching filtered projects:', err)
        setError(err.message)
        toast.error('Failed to fetch filtered projects')
      } finally {
        setLoading(false)
      }
    },
    [filters]
  )

  const updatePage = useCallback(
    (page) => {
      setFilters((prev) => ({ ...prev, page }))
      fetchFilteredProjects(page)
    },
    [fetchFilteredProjects]
  )

  return {
    filters,
    loading,
    error,
    results,
    updateFilter,
    updateMultipleFilters,
    addStatusFilter,
    addSkillFilter,
    addPriorityFilter,
    removeFilter,
    clearAllFilters,
    hasActiveFilters,
    fetchFilteredProjects,
    updatePage
  }
}
