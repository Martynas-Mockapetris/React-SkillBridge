import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaBell, FaCheckCircle, FaUserFriends, FaEnvelope, FaCheckDouble } from 'react-icons/fa'
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '../../services/userService'

const typeIconMap = {
  message_received: <FaEnvelope className='text-[11px]' />,
  connection_requested: <FaUserFriends className='text-[11px]' />,
  connection_accepted: <FaCheckCircle className='text-[11px]' />
}

const formatRelativeTime = (value) => {
  if (!value) return ''

  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return ''

  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(Math.floor(diffMs / (1000 * 60)), 0)

  if (diffMinutes < 1) return 'Just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`

  return new Date(value).toLocaleDateString()
}

const resolveNotificationLink = (notification) => {
  if (notification?.type === 'connection_accepted' && notification?.metadata?.userId) {
    return {
      pathname: `/freelancer/${notification.metadata.userId}`
    }
  }

  if (notification?.type === 'connection_requested') {
    return {
      pathname: '/profile',
      state: {
        activeTab: 'connections'
      }
    }
  }

  if (notification?.type === 'message_received') {
    return {
      pathname: '/profile',
      state: {
        activeTab: 'messages'
      }
    }
  }

  return {
    pathname: notification?.link || '/profile'
  }
}

const NotificationDropdown = ({ isOpen, onClose, unreadCount, onUnreadCountChange }) => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [markingAllRead, setMarkingAllRead] = useState(false)

  useEffect(() => {
    const loadNotifications = async () => {
      if (!isOpen) {
        return
      }

      try {
        setLoading(true)
        const data = await getMyNotifications(8)
        setNotifications(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Failed to load notifications:', error.response?.data || error.message)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    loadNotifications()
  }, [isOpen])

  const visibleUnreadCount = useMemo(() => notifications.filter((item) => !item.isRead).length, [notifications])

  const handleMarkOneAsRead = async (notificationId) => {
    try {
      const updated = await markNotificationAsRead(notificationId)

      setNotifications((prev) => prev.map((item) => (item._id === notificationId ? updated : item)))

      if (typeof onUnreadCountChange === 'function') {
        onUnreadCountChange(Math.max(unreadCount - 1, 0))
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error.response?.data || error.message)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAllRead(true)
      await markAllNotificationsAsRead()

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date().toISOString()
        }))
      )

      if (typeof onUnreadCountChange === 'function') {
        onUnreadCountChange(0)
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error.response?.data || error.message)
    } finally {
      setMarkingAllRead(false)
    }
  }

  if (!isOpen) {
    return null
  }

  return (
    <div className='absolute right-0 top-14 z-[70] w-[22rem] overflow-hidden rounded-3xl border border-white/10 bg-[#0f1720]/95 shadow-2xl backdrop-blur-xl'>
      <div className='flex items-center justify-between border-b border-white/10 px-4 py-3'>
        <div>
          <p className='text-sm font-semibold text-white'>Notifications</p>
          <p className='text-xs text-white/60'>{visibleUnreadCount > 0 ? `${visibleUnreadCount} unread` : 'All caught up'}</p>
        </div>

        <button
          type='button'
          onClick={handleMarkAllAsRead}
          disabled={markingAllRead || visibleUnreadCount === 0}
          className='text-xs font-semibold text-accent transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-40'>
          Mark all read
        </button>
      </div>

      <div className='max-h-[26rem] overflow-y-auto'>
        {loading ? (
          <div className='px-4 py-8 text-center text-sm text-white/65'>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className='flex flex-col items-center gap-3 px-4 py-10 text-center text-white/65'>
            <div className='flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5'>
              <FaBell className='text-sm' />
            </div>
            <div>
              <p className='text-sm font-medium text-white'>No notifications yet</p>
              <p className='mt-1 text-xs text-white/60'>New messages and network activity will appear here.</p>
            </div>
          </div>
        ) : (
          notifications.map((notification) => {
            const destination = resolveNotificationLink(notification)

            return (
              <div key={notification._id} className={`border-b border-white/5 px-4 py-3 transition-colors ${notification.isRead ? 'bg-transparent' : 'bg-white/[0.04]'}`}>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-accent'>
                    {typeIconMap[notification.type] || <FaBell className='text-[11px]' />}
                  </div>

                  <div className='min-w-0 flex-1'>
                    <Link to={destination} onClick={onClose} className='block'>
                      <div className='flex items-start justify-between gap-3'>
                        <p className='text-sm font-semibold text-white'>{notification.title}</p>
                        {!notification.isRead && <span className='mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-accent' />}
                      </div>

                      <p className='mt-1 text-xs leading-5 text-white/70'>{notification.body}</p>
                      <p className='mt-2 text-[11px] uppercase tracking-[0.18em] text-white/40'>{formatRelativeTime(notification.createdAt)}</p>
                    </Link>
                  </div>
                </div>

                {!notification.isRead && (
                  <button
                    type='button'
                    onClick={() => handleMarkOneAsRead(notification._id)}
                    className='mt-3 inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent transition-opacity hover:opacity-80'>
                    <FaCheckDouble className='text-[10px]' />
                    Mark read
                  </button>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default NotificationDropdown
