import { useCallback, useEffect, useState } from 'react'
import { getUnreadNotificationCount } from '../services/userService'

const useNotificationCount = (isEnabled = true) => {
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshUnreadCount = useCallback(async () => {
    if (!isEnabled) {
      setUnreadCount(0)
      return 0
    }

    try {
      setLoading(true)
      const data = await getUnreadNotificationCount()
      const nextCount = Number(data?.unreadCount) || 0
      setUnreadCount(nextCount)
      return nextCount
    } catch (error) {
      console.error('Failed to refresh unread notification count:', error.response?.data || error.message)
      return 0
    } finally {
      setLoading(false)
    }
  }, [isEnabled])

  useEffect(() => {
    if (!isEnabled) {
      setUnreadCount(0)
      return undefined
    }

    refreshUnreadCount()

    const intervalId = window.setInterval(() => {
      refreshUnreadCount()
    }, 30000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [isEnabled, refreshUnreadCount])

  return {
    unreadCount,
    loading,
    refreshUnreadCount
  }
}

export default useNotificationCount
