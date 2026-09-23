import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { motion, AnimatePresence } from 'framer-motion'
import { FaWindowMaximize, FaWindowMinimize } from 'react-icons/fa'
import { toast } from 'react-toastify'
import AvailabilityCalendarSkeleton from './AvailabilityCalendarSkeleton'

const AvailabilityCalendar = ({ freelancerId, isOwnProfile = false, isPublicView = true }) => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredDay, setHoveredDay] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedDays, setSelectedDays] = useState({})
  const [saving, setSaving] = useState(false)
  const [togglingVisibility, setTogglingVisibility] = useState(false)
  const [statusFilter, setStatusFilter] = useState(null)
  const [filterLoading, setFilterLoading] = useState(false)
  const [viewMode, setViewMode] = useState('detailed') // 'compact' or 'detailed'

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

  // Guard: Don't render if no freelancerId
  if (!freelancerId) {
    return <div className='p-4 text-center theme-text-secondary'>No freelancer ID provided</div>
  }

  // Fetch calendar data when component mounts or freelancerId changes
  useEffect(() => {
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
    if (!editMode || !day?.date) return

    const dateKey = `${calendarData.year}-${calendarData.month}-${day?.date}`

    if (!canModifyDate(dateKey)) {
      toast.error('Cannot modify past dates')
      return
    }

    const rest = Object.fromEntries(Object.entries(selectedDays).filter(([key]) => key !== dateKey))
    if (selectedDays[dateKey]) {
      setSelectedDays(rest)
    } else {
      setSelectedDays({
        ...selectedDays,
        [dateKey]: day?.status
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

  if (!calendarData || !calendarData.days) {
    return <div className='p-4 text-center theme-text-secondary'>No calendar data available</div>
  }

  return (
    <div className='space-y-4 my-0 pb-6'>
      {/* View Toggle Button */}
      <div className='flex justify-end gap-2 px-6 mt-6'>
        <motion.button
          onClick={() => setViewMode('compact')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
            viewMode === 'compact' ? 'bg-accent text-white shadow-lg' : 'bg-primary/10 dark:bg-light/10 theme-text hover:shadow hover:bg-primary/20 dark:hover:bg-light/20'
          }`}
          aria-label='Switch to compact view'
          title='Compact view'>
          <FaWindowMinimize className='text-xs' />
          <span className='hidden sm:inline'>Compact</span>
        </motion.button>
        <motion.button
          onClick={() => setViewMode('detailed')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 text-sm font-medium ${
            viewMode === 'detailed' ? 'bg-accent text-white shadow-lg' : 'bg-primary/10 dark:bg-light/10 theme-text hover:shadow hover:bg-primary/20 dark:hover:bg-light/20'
          }`}
          aria-label='Switch to detailed view'
          title='Detailed view'>
          <FaWindowMaximize className='text-xs' />
          <span className='hidden sm:inline'>Detailed</span>
        </motion.button>
      </div>

      {/* Calendar View */}
      <AnimatePresence mode='wait'>
        {viewMode === 'compact' ? (
          <motion.div key='compact' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='px-6 mb-6'>
            <CompactCalendarView
              calendarData={calendarData}
              currentDate={currentDate}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getDayCapacityLabel={getDayCapacityLabel}
            />
          </motion.div>
        ) : (
          <motion.div key='detailed' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className='px-6 mb-6'>
            <DetailedCalendarView
              calendarData={calendarData}
              currentDate={currentDate}
              isOwnProfile={isOwnProfile}
              isPublicView={isPublicView}
              isPublic={isPublic}
              editMode={editMode}
              selectedDays={selectedDays}
              saving={saving}
              togglingVisibility={togglingVisibility}
              statusFilter={statusFilter}
              filterLoading={filterLoading}
              optimisticUpdates={optimisticUpdates}
              hoveredDay={hoveredDay}
              onPreviousMonth={previousMonth}
              onNextMonth={nextMonth}
              onEditMode={() => setEditMode(true)}
              onHandleToggleVisibility={handleToggleVisibility}
              onStatusFilterChange={handleStatusFilterChange}
              onClearFilter={handleClearFilter}
              onDayClick={handleDayClick}
              onStatusChange={handleStatusChange}
              onSaveChanges={handleSaveChanges}
              onCancel={handleCancel}
              onHoveredDay={setHoveredDay}
              getStatusColor={getStatusColor}
              getStatusLabel={getStatusLabel}
              getDayCapacityLabel={getDayCapacityLabel}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

AvailabilityCalendar.propTypes = {
  freelancerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isOwnProfile: PropTypes.bool,
  isPublicView: PropTypes.bool
}

export default AvailabilityCalendar
