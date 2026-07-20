import { useState, useCallback } from 'react'
import { authAxios } from '../utils/axiosConfig'

const useAvailability = (freelancerId, isPublicView = true) => {
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPublic, setIsPublic] = useState(false)
  const [optimisticUpdates, setOptimisticUpdates] = useState({})

  const applyOptimisticUpdate = useCallback((dateKey, newStatus) => {
    setOptimisticUpdates((prev) => ({
      ...prev,
      [dateKey]: newStatus
    }))
  }, [])

  const rollbackOptimisticUpdate = useCallback((dateKey) => {
    setOptimisticUpdates((prev) => {
      const { [dateKey]: _, ...rest } = prev
      return rest
    })
  }, [])

  const clearOptimisticUpdates = useCallback(() => {
    setOptimisticUpdates({})
  }, [])

  const fetchCalendarData = useCallback(
    async (year, month) => {
      if (!freelancerId) return

      try {
        setLoading(true)
        setError(null)

        const endpoint = isPublicView ? `/api/availability/public/${freelancerId}/${year}/${month}` : `/api/availability/${freelancerId}/current?year=${year}&month=${month}`

        const response = await authAxios.get(endpoint)
        const result = response.data
        setCalendarData(result.data)
        setIsPublic(result.data?.isPublic || false)
        return result.data
      } catch (err) {
        setError(err.message)
        console.error('Error fetching calendar:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [freelancerId, isPublicView]
  )

  const updateDayAvailability = useCallback(
    async (year, month, date, manualStatus) => {
      if (!freelancerId) return

      try {
        const response = await authAxios.put(`/api/availability/${freelancerId}/${year}/${month}/${date}`, { manualStatus })
        const result = response.data
        return result.data
      } catch (err) {
        console.error(`Error updating ${year}-${month}-${date}:`, err)
        throw err
      }
    },
    [freelancerId]
  )

  const toggleVisibility = useCallback(async () => {
    if (!freelancerId) return

    try {
      await authAxios.patch(`/api/availability/${freelancerId}/visibility`, { isPublic: !isPublic })
      setIsPublic(!isPublic)
      return !isPublic
    } catch (err) {
      console.error('Error toggling visibility:', err)
      throw err
    }
  }, [freelancerId, isPublic])

  const updateMultipleDays = useCallback(
    async (updates) => {
      const results = []
      const failures = []

      for (const { year, month, date, status } of updates) {
        try {
          const result = await updateDayAvailability(year, month, date, status)
          results.push(result)
        } catch (err) {
          failures.push({ year, month, date, error: err.message })
        }
      }

      if (failures.length > 0) {
        console.warn(`${failures.length} update(s) failed:`, failures)
      }

      return { results, failures }
    },
    [updateDayAvailability]
  )

  const fetchFilteredCalendarData = useCallback(
    async (year, month, status) => {
      if (!freelancerId) return

      try {
        setLoading(true)
        setError(null)

        const statusParam = status ? `&status=${status}` : ''
        const endpoint = `/api/availability/${freelancerId}/filtered?year=${year}&month=${month}${statusParam}`

        const response = await authAxios.get(endpoint)
        const result = response.data
        setCalendarData(result.data)
        return result.data
      } catch (err) {
        setError(err.message)
        console.error('Error fetching filtered calendar:', err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [freelancerId]
  )

  return {
    calendarData,
    loading,
    error,
    isPublic,
    optimisticUpdates,
    fetchCalendarData,
    updateDayAvailability,
    updateMultipleDays,
    fetchFilteredCalendarData,
    toggleVisibility,
    applyOptimisticUpdate,
    rollbackOptimisticUpdate,
    clearOptimisticUpdates,
    setCalendarData,
    setError
  }
}

export default useAvailability
