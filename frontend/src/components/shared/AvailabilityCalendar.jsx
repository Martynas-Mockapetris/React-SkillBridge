import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight, FaEdit, FaCheck, FaTimes, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'
import { toast } from 'react-toastify'
import AvailabilityEditPanel from './AvailabilityEditPanel'
import AvailabilityCalendarSkeleton from './AvailabilityCalendarSkeleton'
import useAvailability from '../../hooks/useAvailability'
import StatusFilterChips from './StatusFilterChips'

const AvailabilityCalendar = ({ freelancerId, isOwnProfile = false, isPublicView = true }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState({})
  const [saving, setSaving] = useState(false)
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  const [statusFilter, setStatusFilter] = useState(null)
  const [filterLoading, setFilterLoading] = useState(false)

  const {
    calendarData,
    loading,
    error,
    isPublic,
    optimisticUpdates,
    fetchCalendarData,
    fetchFilteredCalendarData,
    updateMultipleDays,
    toggleVisibility,
    applyOptimisticUpdate,
    rollbackOptimisticUpdate,
    clearOptimisticUpdates
  } = useAvailability(freelancerId, isPublicView)

  // Fetch calendar data when component mounts or freelancerId changes
  React.useEffect(() => {
    fetchCalendarData()
  }, [currentDate, freelancerId])

  React.useEffect(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    fetchCalendarData(year, month).catch((err) => {
      console.error('Failed to fetch calendar on mount:', err)
    })
  }, [currentDate, freelancerId, fetchCalendarData])

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

  const VALID_STATUSES = ['green', 'yellow', 'orange', 'red']

  const isValidStatus = (status) => {
    return VALID_STATUSES.includes(status)
  }

  const isValidDateKey = (dateKey) => {
    const [year, month, date] = dateKey.split('-').map(Number)
    if (!year || !month || !date) return false
    if (month < 1 || month > 12) return false
    if (date < 1 || date > 31) return false

    const selectedDate = new Date(year, month - 1, date)
    const isValidDate = selectedDate.getFullYear() === year && selectedDate.getMonth() === month - 1 && selectedDate.getDate() === date

    return isValidDate
  }

  const canModifyDate = (dateKey) => {
    const [year, month, date] = dateKey.split('-').map(Number)
    const selectedDate = new Date(year, month - 1, date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    return selectedDate >= today
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

  const handleDayClick = (day) => {
    if (!editMode || !day.date) return

    const dateKey = `${calendarData.year}-${calendarData.month}-${day.date}`

    if (!canModifyDate(dateKey)) {
      toast.error('Cannot modify past dates')
      return
    }

    const { [dateKey]: _, ...rest } = selectedDays
    if (selectedDays[dateKey]) {
      setSelectedDays(rest)
    } else {
      setSelectedDays({
        ...selectedDays,
        [dateKey]: day.status
      })
    }
  }

  const handleStatusChange = (dateKey, newStatus) => {
    if (!isValidStatus(newStatus)) {
      toast.error('Invalid status selected')
      console.error(`Invalid status: ${newStatus}`)
      return
    }

    if (!isValidDateKey(dateKey)) {
      toast.error('Invalid date key')
      console.error(`Invalid date key: ${dateKey}`)
      return
    }

    setSelectedDays({
      ...selectedDays,
      [dateKey]: newStatus
    })
  }

  const handleSaveChanges = async () => {
    if (Object.keys(selectedDays).length === 0) {
      toast.info('No changes to save')
      return
    }

    // Validate all selected days before saving
    const invalidDays = Object.entries(selectedDays).filter(([dateKey, status]) => {
      if (!isValidDateKey(dateKey)) {
        console.error(`Invalid date key format: ${dateKey}`)
        return true
      }
      if (!isValidStatus(status)) {
        console.error(`Invalid status: ${status}`)
        return true
      }
      if (!canModifyDate(dateKey)) {
        console.error(`Cannot modify past date: ${dateKey}`)
        return true
      }
      return false
    })

    if (invalidDays.length > 0) {
      toast.error(`Cannot modify ${invalidDays.length} day(s). Check console for details.`)
      return
    }

    setSaving(true)

    try {
      // Apply optimistic updates
      Object.entries(selectedDays).forEach(([dateKey, status]) => {
        applyOptimisticUpdate(dateKey, status)
      })

      // Convert selectedDays to updates format for the hook
      const updates = Object.entries(selectedDays).map(([dateKey, status]) => {
        const [year, month, date] = dateKey.split('-')
        return { year: parseInt(year), month: parseInt(month), date: parseInt(date), status }
      })

      const { failures } = await updateMultipleDays(updates)

      if (failures.length > 0) {
        // Rollback failed updates
        failures.forEach(({ year, month, date }) => {
          const dateKey = `${year}-${month}-${date}`
          rollbackOptimisticUpdate(dateKey)
        })
        toast.error(`Failed to update ${failures.length} day(s)`)
      } else {
        toast.success('Availability updated successfully')
        clearOptimisticUpdates()
      }

      setEditMode(false)
      setSelectedDays({})

      // Refresh calendar
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      await fetchCalendarData(year, month)
    } catch (err) {
      // Rollback all optimistic updates on critical error
      clearOptimisticUpdates()
      toast.error(`Error updating availability: ${err.message}`)
      console.error('Error saving changes:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditMode(false)
    setSelectedDays({})
  }

  const handleToggleVisibility = async () => {
    setTogglingVisibility(true)
    try {
      const newVisibility = await toggleVisibility()
      toast.success(`Calendar is now ${newVisibility ? 'public' : 'private'}`)
    } catch (err) {
      toast.error(`Error updating visibility: ${err.message}`)
      console.error('Error toggling visibility:', err)
    } finally {
      setTogglingVisibility(false)
    }
  }

  const handleStatusFilterChange = async (status) => {
    setStatusFilter(status)
    setFilterLoading(true)

    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      await fetchFilteredCalendarData(year, month, status)
    } catch (err) {
      console.error('Error applying filter:', err)
      toast.error('Error applying filter')
    } finally {
      setFilterLoading(false)
    }
  }

  const handleClearFilter = async () => {
    setStatusFilter(null)
    setFilterLoading(true)

    try {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      await fetchCalendarData(year, month)
    } catch (err) {
      console.error('Error clearing filter:', err)
    } finally {
      setFilterLoading(false)
    }
  }

  if (loading) {
    return <AvailabilityCalendarSkeleton />
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
  const calendarGrid = [...Array(firstDayOfMonth), ...calendarData.days]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-6 theme-card rounded-lg border dark:border-light/10 border-primary/10'>
      {/* Header */}
      <div className='flex items-center justify-between mb-6'>
        <h3 className='text-lg font-semibold theme-text'>{monthName}</h3>
        <div className='flex gap-2 items-center'>
          <motion.button onClick={previousMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Previous month'>
            <FaChevronLeft className='theme-text' />
          </motion.button>
          <motion.button onClick={nextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Next month'>
            <FaChevronRight className='theme-text' />
          </motion.button>
          {isOwnProfile && !editMode && (
            <>
              <motion.button
                onClick={() => setEditMode(true)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200 text-accent'
                aria-label='Edit availability'>
                <FaEdit />
              </motion.button>
              <motion.button
                onClick={handleToggleVisibility}
                disabled={togglingVisibility}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200 text-accent disabled:opacity-50'
                title={isPublic ? 'Make calendar private' : 'Make calendar public'}
                aria-label='Toggle calendar visibility'>
                {togglingVisibility ? <FaSpinner className='animate-spin' /> : isPublic ? <FaEye /> : <FaEyeSlash />}
              </motion.button>
            </>
          )}
        </div>
      </div>

      {/* Edit Mode Banner */}
      {editMode && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
          <p className='text-blue-700 dark:text-blue-400 text-sm font-medium'>Click on a day to select it, then choose its status. {Object.keys(selectedDays).length} day(s) selected.</p>
        </motion.div>
      )}

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

      {/* Status Filter - only for own profile */}
      {isOwnProfile && !editMode && (
        <div className='mb-6 pb-6 border-b dark:border-light/10 border-primary/10'>
          <StatusFilterChips selectedStatus={statusFilter} onStatusChange={handleStatusFilterChange} onClear={handleClearFilter} />
          {filterLoading && (
            <div className='mt-3 flex items-center gap-2 text-sm theme-text-secondary'>
              <div className='animate-spin'>
                <div className='w-4 h-4 border-2 border-accent border-t-transparent rounded-full'></div>
              </div>
              <span>Filtering calendar...</span>
            </div>
          )}
        </div>
      )}

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
            const dateKey = `${calendarData.year}-${calendarData.month}-${day.date}`
            const isSelected = selectedDays[dateKey]
            const currentStatus = optimisticUpdates[dateKey] || isSelected || day.status

            return (
              <motion.div
                key={`${calendarData.month}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                onMouseEnter={() => !isEmpty && setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
                onClick={() => handleDayClick(day)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer ${!isEmpty && editMode ? 'hover:shadow-lg hover:scale-110 ring-2' : !isEmpty ? 'hover:shadow-lg hover:scale-105' : ''} ${isSelected ? 'ring-4 ring-blue-500' : editMode && !isEmpty ? 'ring-2 ring-gray-300 dark:ring-gray-600' : ''}`}
                style={{
                  backgroundColor: isEmpty ? 'transparent' : getStatusColor(currentStatus)
                }}>
                {!isEmpty && (
                  <>
                    {/* Day number */}
                    <span className={`text-sm font-semibold ${['red', 'orange'].includes(currentStatus) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day.date}</span>

                    {/* Today indicator */}
                    {isToday && <div className='absolute inset-0 rounded-lg border-2 border-white dark:border-gray-900 opacity-60'></div>}

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='absolute top-1 right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                        <FaCheck className='text-white text-xs' />
                      </motion.div>
                    )}

                    {/* Hover tooltip */}
                    <AnimatePresence>
                      {hoveredDay === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs whitespace-nowrap z-50 pointer-events-none shadow-lg'>
                          <div className='font-semibold'>{getStatusLabel(currentStatus)}</div>
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

      {/* Summary Stats - only for own profile, hidden in edit mode */}
      {!isPublicView && !editMode && (
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

      {/* Edit Panel - only in edit mode */}
      {editMode && <AvailabilityEditPanel selectedDays={selectedDays} onStatusChange={handleStatusChange} onSave={handleSaveChanges} onCancel={handleCancel} saving={saving} />}
    </motion.div>
  )
}

export default AvailabilityCalendar
