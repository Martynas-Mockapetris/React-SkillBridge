import { useState, useCallback, useEffect } from 'react'

/**
 * Custom Hook for Managing Async Operations
 *
 * Handles loading states, error handling, and data fetching for async operations.
 * Provides cleanup on unmount and abort capabilities for fetch requests.
 *
 * @param {Function} asyncFunction - Async function to execute
 * @param {Array} dependencies - Dependency array for re-running the async operation
 * @param {boolean} [immediate=true] - Whether to run immediately on mount
 * @returns {Object} Async operation state and control methods
 *
 * @example
 * const { data, loading, error, execute, abort } = useAsync(
 *   async () => await fetchUserData(userId),
 *   [userId]
 * )
 *
 * @example
 * const { data, loading, error, execute } = useAsync(
 *   async (id) => await deleteItem(id),
 *   [],
 *   false // Don't run immediately
 * )
 *
 * // Manually trigger the async operation
 * const handleDelete = async (id) => {
 *   await execute(id)
 * }
 *
 * @typedef {Object} UseAsyncState
 * @property {*} data - Result data from async operation
 * @property {boolean} loading - Loading state
 * @property {Error|null} error - Error object if operation failed
 * @property {Function} execute - Function to manually trigger async operation
 * @property {Function} abort - Function to abort pending operation
 * @property {Function} reset - Function to reset state to initial
 */
const useAsync = (asyncFunction, dependencies = [], immediate = true) => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [abortController, setAbortController] = useState(null)

  /**
   * Execute the async function
   * @param {...*} args - Arguments to pass to asyncFunction
   * @returns {Promise} Promise resolving to the async operation result
   */
  const execute = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)

        const controller = new AbortController()
        setAbortController(controller)

        // Pass abort signal and any additional arguments to async function
        const result = await asyncFunction(...args, { signal: controller.signal })
        setData(result)
        return result
      } catch (err) {
        // Don't set error if aborted
        if (err.name !== 'AbortError') {
          setError(err)
          console.error('[useAsync] Error:', err.message)
        }
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFunction]
  )

  /**
   * Abort pending async operation
   */
  const abort = useCallback(() => {
    if (abortController) {
      abortController.abort()
      setAbortController(null)
    }
  }, [abortController])

  /**
   * Reset state to initial values
   */
  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
    abort()
  }, [abort])

  /**
   * Run async operation on mount or when dependencies change
   */
  useEffect(() => {
    if (immediate && asyncFunction) {
      execute()
    }

    // Cleanup: abort on unmount
    return () => {
      abort()
    }
  }, [immediate, asyncFunction, ...dependencies])

  return {
    data,
    loading,
    error,
    execute,
    abort,
    reset
  }
}

/**
 * Specialized Hook for Data Fetching with Caching
 *
 * Extends useAsync with caching capabilities to avoid redundant API calls.
 * Cache is per-hook-instance and cleared on unmount.
 *
 * @param {Function} fetchFunction - Async fetch function
 * @param {Array} dependencies - Dependency array
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.cacheDuration=300000] - Cache duration in ms (5 minutes default)
 * @param {boolean} [options.immediate=true] - Run immediately on mount
 * @returns {Object} Fetch state with caching support
 *
 * @example
 * const { data, loading, error, refetch } = useFetch(
 *   async ({ signal }) => await fetch(`/api/projects`, { signal }).then(r => r.json()),
 *   [userId]
 * )
 */
const useFetch = (fetchFunction, dependencies = [], options = {}) => {
  const { cacheDuration = 300000, immediate = true } = options
  const [cache, setCache] = useState({})
  const [cacheTime, setCacheTime] = useState(0)

  const fetchWithCache = useCallback(
    async (...args) => {
      const cacheKey = JSON.stringify(args)
      const now = Date.now()

      // Check if cached data is still valid
      if (cache[cacheKey] && now - cacheTime < cacheDuration) {
        return cache[cacheKey]
      }

      // Fetch new data
      const result = await fetchFunction(...args)

      // Update cache
      setCache((prev) => ({
        ...prev,
        [cacheKey]: result
      }))
      setCacheTime(now)

      return result
    },
    [fetchFunction, cache, cacheTime, cacheDuration]
  )

  const state = useAsync(fetchWithCache, dependencies, immediate)

  /**
   * Force refetch, bypassing cache
   */
  const refetch = useCallback(
    async (...args) => {
      // Clear cache
      setCache({})
      // Re-execute with force
      return state.execute(...args)
    },
    [state]
  )

  return {
    ...state,
    refetch,
    clearCache: () => setCache({})
  }
}

/**
 * Specialized Hook for Mutation Operations (POST, PUT, DELETE)
 *
 * Similar to useAsync but optimized for mutation operations that don't
 * automatically trigger on mount.
 *
 * @param {Function} mutationFunction - Async mutation function
 * @param {Object} [options={}] - Configuration options
 * @param {Function} [options.onSuccess] - Callback on success
 * @param {Function} [options.onError] - Callback on error
 * @returns {Object} Mutation state and execution method
 *
 * @example
 * const { mutate, data, loading, error } = useMutation(
 *   async (formData) => await createProject(formData),
 *   {
 *     onSuccess: () => router.push('/projects'),
 *     onError: (err) => toast.error(err.message)
 *   }
 * )
 *
 * const handleSubmit = async (formData) => {
 *   await mutate(formData)
 * }
 */
const useMutation = (mutationFunction, options = {}) => {
  const { onSuccess, onError } = options
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mutate = useCallback(
    async (...args) => {
      try {
        setLoading(true)
        setError(null)

        const result = await mutationFunction(...args)
        setData(result)

        if (onSuccess) {
          onSuccess(result)
        }

        return result
      } catch (err) {
        setError(err)

        if (onError) {
          onError(err)
        }

        throw err
      } finally {
        setLoading(false)
      }
    },
    [mutationFunction, onSuccess, onError]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
    setLoading(false)
  }, [])

  return {
    mutate,
    data,
    loading,
    error,
    reset
  }
}

export default useAsync
export { useFetch, useMutation }
