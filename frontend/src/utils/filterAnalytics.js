/**
 * Analytics tracking utility for filter searches
 * Tracks user interactions and search patterns
 */

const ANALYTICS_STORAGE_KEY = 'projectFilterAnalytics'
const MAX_ANALYTICS_ENTRIES = 100

export const trackFilterSearch = (filters, resultCount) => {
  try {
    const analytics = getAnalytics()

    const entry = {
      timestamp: new Date().toISOString(),
      filters: {
        minBudget: filters.minBudget,
        maxBudget: filters.maxBudget,
        status: filters.status || [],
        skills: filters.skills || [],
        priority: filters.priority || [],
        search: filters.search || '',
        sort: filters.sort || 'newest'
      },
      resultCount,
      sessionId: getSessionId()
    }

    analytics.searches.push(entry)

    // Keep only recent entries
    if (analytics.searches.length > MAX_ANALYTICS_ENTRIES) {
      analytics.searches = analytics.searches.slice(-MAX_ANALYTICS_ENTRIES)
    }

    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics))
    return entry
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

export const trackExport = (format, projectCount) => {
  try {
    const analytics = getAnalytics()

    const entry = {
      timestamp: new Date().toISOString(),
      format,
      projectCount,
      sessionId: getSessionId()
    }

    analytics.exports.push(entry)
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics))
    return entry
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

export const trackFilterToggle = (source) => {
  try {
    const analytics = getAnalytics()

    const entry = {
      timestamp: new Date().toISOString(),
      source,
      sessionId: getSessionId()
    }

    analytics.interactions.push(entry)
    localStorage.setItem(ANALYTICS_STORAGE_KEY, JSON.stringify(analytics))
    return entry
  } catch (error) {
    console.warn('Analytics tracking error:', error)
  }
}

export const getAnalytics = () => {
  try {
    const stored = localStorage.getItem(ANALYTICS_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.warn('Error reading analytics:', error)
  }

  return {
    searches: [],
    exports: [],
    interactions: [],
    createdAt: new Date().toISOString()
  }
}

export const getAnalyticsSummary = () => {
  const analytics = getAnalytics()

  return {
    totalSearches: analytics.searches.length,
    totalExports: analytics.exports.length,
    totalInteractions: analytics.interactions.length,
    averageResultsPerSearch: analytics.searches.length > 0 ? Math.round(analytics.searches.reduce((sum, s) => sum + s.resultCount, 0) / analytics.searches.length) : 0,
    mostUsedSkills: getMostUsedFilters(analytics.searches, 'skills'),
    mostUsedStatuses: getMostUsedFilters(analytics.searches, 'status'),
    mostUsedPriorities: getMostUsedFilters(analytics.searches, 'priority'),
    exportFormats: analytics.exports.reduce((acc, exp) => {
      acc[exp.format] = (acc[exp.format] || 0) + 1
      return acc
    }, {}),
    recentSearches: analytics.searches.slice(-10).reverse()
  }
}

export const clearAnalytics = () => {
  try {
    localStorage.removeItem(ANALYTICS_STORAGE_KEY)
    return true
  } catch (error) {
    console.warn('Error clearing analytics:', error)
    return false
  }
}

const getMostUsedFilters = (searches, filterKey) => {
  const filterMap = {}

  searches.forEach((search) => {
    const values = search.filters[filterKey]
    if (Array.isArray(values)) {
      values.forEach((value) => {
        filterMap[value] = (filterMap[value] || 0) + 1
      })
    }
  })

  return Object.entries(filterMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, count]) => ({ key, count }))
}

const getSessionId = () => {
  let sessionId = sessionStorage.getItem('filterSearchSessionId')
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessionStorage.setItem('filterSearchSessionId', sessionId)
  }
  return sessionId
}

export const exportAnalytics = () => {
  try {
    const analytics = getAnalytics()
    const summary = getAnalyticsSummary()

    const exportData = {
      exportDate: new Date().toISOString(),
      summary,
      fullData: analytics
    }

    const jsonContent = JSON.stringify(exportData, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `analytics_${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.warn('Error exporting analytics:', error)
  }
}
