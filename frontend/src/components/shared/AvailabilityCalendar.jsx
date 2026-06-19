import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const AvailabilityCalendar = ({ freelancerId, isOwnProfile = false, isPublicView = true }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState(null)
  const [calendarData, setCalendarData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch calendar data when component mounts or freelancerId changes
  React.useEffect(() => {
    fetchCalendarData()
  }, [currentDate, freelancerId])

  const fetchCalendarData = async () => {
    try {
      setLoading(true)
      setError(null)

      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1

      const endpoint = isPublicView ? `/api/availability/public/${freelancerId}/${year}/${month}` : `/api/availability/${freelancerId}/current?year=${year}&month=${month}`

      const response = await fetch(endpoint)
      if (!response.ok) throw new Error('Failed to fetch calendar')

      const result = await response.json()
      setCalendarData(result.data)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching calendar:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    const colorMap = {
      red: '#ef4444',
      orange: '#f97316',
      yellow: '#eab308',
      green: '#22c55e'
    }
    return colorMap[status] || '#e5e7eb'
  }

  const getStatusLabel = (status) => {
    const labelMap = {
      red: '100% Busy',
      orange: '50% Busy',
      yellow: 'Partially Busy',
      green: 'Available'
    }
    return labelMap[status] || 'Unknown'
  }

  const getDayCapacityLabel = (capacity) => {
    if (capacity === 100) return 'Fully Available'
    if (capacity >= 50) return `${capacity}% Available`
    if (capacity > 0) return `${capacity}% Available (Limited)`
    return 'Fully Booked'
  }

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <div className='animate-spin'>
          <div className='w-8 h-8 border-4 border-accent border-t-transparent rounded-full'></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg'>
        <p className='text-red-700 dark:text-red-400'>Error loading calendar: {error}</p>
      </div>
    )
  }

  if (!calendarData) {
    return <div className='p-4 text-center theme-text-secondary'>No calendar data available</div>
  }

  const monthName = new Date(calendarData.year, calendarData.month - 1).toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDayOfMonth = new Date(calendarData.year, calendarData.month - 1, 1).getDay()
  const daysInMonth = calendarData.days.length

  // Create array with empty slots for days before month starts
  const calendarGrid = [...Array(firstDayOfMonth), ...calendarData.days]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-6 theme-card rounded-lg border dark:border-light/10 border-primary/10'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold theme-text'>{monthName}</h3>
        <div className='flex gap-2'>
          <motion.button onClick={previousMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Previous month'>
            <FaChevronLeft className='theme-text' />
          </motion.button>
          <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Next month'>
            <FaChevronRight className='theme-text' />
          </motion.button>
        </div>
      </div>

      {/* Legend */}
      <div className='grid grid-cols-4 gap-2 mb-6 text-sm'>
        {[
          { status: 'green', label: 'Available' },
          { status: 'yellow', label: 'Partially Busy' },
          { status: 'orange', label: '50% Busy' },
          { status: 'red', label: '100% Busy' }
        ].map((item) => (
          <div key={item.status} className='flex items-center gap-2'>
            <div className='w-3 h-3 rounded flex-shrink-0' style={{ backgroundColor: getStatusColor(item.status) }}></div>
            <span className='theme-text-secondary text-xs'>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Day headers */}
      <div className='grid grid-cols-7 gap-2 mb-2'>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className='text-center text-xs font-semibold theme-text-secondary py-2'>
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className='grid grid-cols-7 gap-2'>
        <AnimatePresence>
          {calendarGrid.map((day, idx) => {
            const isEmpty = !day.date
            const isToday = !isEmpty && new Date(calendarData.year, calendarData.month - 1, day.date).toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={`${calendarData.month}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                onMouseEnter={() => !isEmpty && setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative aspect-square rounded-lg flex items-center justify-center transition-all duration-200 ${!isEmpty ? 'hover:shadow-lg hover:scale-105' : ''}`}
                style={{
                  backgroundColor: isEmpty ? 'transparent' : getStatusColor(day.status)
                }}>
                {!isEmpty && (
                  <>
                    {/* Day number */}
                    <span className={`text-sm font-semibold ${['red', 'orange'].includes(day.status) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day.date}</span>

                    {/* Today indicator - subtle border */}
                    {isToday && <div className='absolute inset-0 rounded-lg border-2 border-white dark:border-gray-900 opacity-60'></div>}

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {hoveredDay === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs whitespace-nowrap z-50 pointer-events-none shadow-lg'>
                          <div className='font-semibold'>{getStatusLabel(day.status)}</div>
                          <div className='text-xs opacity-90'>{getDayCapacityLabel(day.capacity)}</div>
                          {day.projectsCount > 0 && (
                            <div className='text-xs opacity-90 mt-1'>
                              {day.projectsCount} project{day.projectsCount !== 1 ? 's' : ''}
                            </div>
                          )}
                          {day.projectTitles && day.projectTitles.length > 0 && (
                            <div className='text-xs opacity-75 mt-1 max-w-xs'>
                              {day.projectTitles
                                .slice(0, 2)
                                .map((p) => `${p.title} (${p.priority})`)
                                .join(', ')}
                              {day.projectTitles.length > 2 && ` +${day.projectTitles.length - 2} more`}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      {/* Summary Stats - only for own profile */}
      {!isPublicView && (
        <div className='mt-6 pt-6 border-t dark:border-light/10 border-primary/10 grid grid-cols-4 gap-4'>
          {[
            { label: 'Available', value: calendarData.daysBreakdown?.green || 0, color: 'bg-green-100 dark:bg-green-900/30' },
            { label: 'Partially Busy', value: calendarData.daysBreakdown?.yellow || 0, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
            { label: 'Busy', value: calendarData.daysBreakdown?.orange || 0, color: 'bg-orange-100 dark:bg-orange-900/30' },
            { label: 'Fully Busy', value: calendarData.daysBreakdown?.red || 0, color: 'bg-red-100 dark:bg-red-900/30' }
          ].map((stat) => (
            <div key={stat.label} className={`p-3 rounded-lg ${stat.color}`}>
              <div className='text-xs theme-text-secondary'>{stat.label}</div>
              <div className='text-lg font-bold theme-text'>{stat.value}</div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default AvailabilityCalendar
