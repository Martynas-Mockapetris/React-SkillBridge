import { motion, AnimatePresence } from 'framer-motion'
import PropTypes from 'prop-types'
import { FaChevronLeft, FaChevronRight, FaEdit, FaCheck, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa'
import AvailabilityEditPanel from './AvailabilityEditPanel'

const DetailedCalendarView = ({
  calendarData,
  isOwnProfile,
  isPublicView,
  isPublic,
  editMode,
  selectedDays,
  saving,
  togglingVisibility,
  statusFilter,
  filterLoading,
  optimisticUpdates,
  hoveredDay,
  onPreviousMonth,
  onNextMonth,
  onEditMode,
  onHandleToggleVisibility,
  onStatusFilterChange,
  onClearFilter,
  onDayClick,
  onStatusChange,
  onSaveChanges,
  onCancel,
  onHoveredDay,
  getStatusColor,
  getStatusLabel,
  getDayCapacityLabel
}) => {
  if (!calendarData || !calendarData.days) {
    return <div className='p-4 text-center theme-text-secondary'>No calendar data available</div>
  }

  const monthName = new Date(calendarData.year, calendarData.month - 1).toLocaleString('default', {
    month: 'long',
    year: 'numeric'
  })
  // Convert to Monday-first calendar (0 = Monday, 6 = Sunday)
  const firstDayOfMonth = (new Date(calendarData.year, calendarData.month - 1, 1).getDay() + 6) % 7
  const calendarGrid = [...Array(firstDayOfMonth), ...calendarData.days]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className='p-6 bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent rounded-lg border border-primary/10 dark:border-light/10 backdrop-blur-sm'>
      {/* Header */}
      <div className='flex items-center justify-between mb-7'>
        <h3 className='text-lg font-semibold theme-text'>{monthName}</h3>
        <div className='flex gap-2 items-center'>
          <motion.button onClick={onPreviousMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Previous month'>
            <FaChevronLeft className='theme-text' />
          </motion.button>
          <motion.button onClick={onNextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200' aria-label='Next month'>
            <FaChevronRight className='theme-text' />
          </motion.button>
          {isOwnProfile && !editMode && (
            <>
              <motion.button
                onClick={onEditMode}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className='p-2 hover:bg-accent/10 rounded-lg transition-colors duration-200 text-accent'
                aria-label='Edit availability'>
                <FaEdit />
              </motion.button>
              <motion.button
                onClick={onHandleToggleVisibility}
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
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className='mb-4 p-4 bg-accent/10 border border-accent/30 rounded-lg theme-text-secondary text-sm font-medium'>
          Click on a day to select it, then choose its status. {Object.keys(selectedDays).length} day(s) selected.
        </motion.div>
      )}

      {/* Legend */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-3 mb-6'>
        {[
          { status: 'green', label: 'Available', capacity: '100%' },
          { status: 'yellow', label: 'Partially Busy', capacity: '1-50%' },
          { status: 'orange', label: '50% Busy', capacity: '50-99%' },
          { status: 'red', label: '100% Busy', capacity: '0%' }
        ].map((item) => (
          <motion.div
            key={item.status}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className='p-3 rounded-lg bg-gradient-to-br dark:from-light/5 dark:via-light/[0.02] from-primary/5 via-primary/[0.02] to-transparent border border-primary/10 dark:border-light/10 backdrop-blur-sm'>
            <div className='flex items-center gap-3'>
              <div className='w-4 h-4 md:w-5 md:h-5 rounded flex-shrink-0' style={{ backgroundColor: getStatusColor(item.status) }}></div>
              <div className='flex flex-col min-w-0'>
                <span className='theme-text text-xs md:text-sm font-medium'>{item.label}</span>
                <span className='theme-text-secondary text-xs opacity-70'>{item.capacity}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Status Filter - only for own profile */}
      {isOwnProfile && !editMode && (
        <div className='mb-6 pb-6 border-b border-primary/10 dark:border-light/10'>
          <StatusFilterChips selectedStatus={statusFilter} onStatusChange={onStatusFilterChange} onClear={onClearFilter} />
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
      <div className='grid grid-cols-7 gap-1 mb-3'>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <div key={day} className='text-center text-xs md:text-sm font-semibold theme-text-secondary py-2 md:py-3'>
            <span className='hidden sm:inline'>{day}</span>
            <span className='sm:hidden'>{day.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid - Responsive */}
      <div className='grid grid-cols-7 gap-1'>
        <AnimatePresence>
          {calendarGrid?.map((day, idx) => {
            const isEmpty = !day?.date
            const isToday = !isEmpty && new Date(calendarData.year, calendarData.month - 1, day?.date).toDateString() === new Date().toDateString()
            const dateKey = `${calendarData.year}-${calendarData.month}-${day?.date}`
            const isSelected = selectedDays[dateKey]
            const currentStatus = optimisticUpdates[dateKey] || isSelected || day?.status

            return (
              <motion.div
                key={`${calendarData.month}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.02 }}
                onMouseEnter={() => !isEmpty && onHoveredDay(idx)}
                onMouseLeave={() => onHoveredDay(null)}
                onClick={() => onDayClick(day)}
                className={`relative aspect-square rounded-lg flex flex-col items-center justify-center transition-all duration-200 cursor-pointer text-xs md:text-sm ${
                  !isEmpty && editMode ? 'hover:shadow-lg hover:scale-110 ring-2' : !isEmpty ? 'hover:shadow-lg hover:scale-105' : ''
                } ${isSelected ? 'ring-4 ring-blue-500' : editMode && !isEmpty ? 'ring-2 ring-gray-300 dark:ring-gray-600' : ''}`}
                style={{
                  backgroundColor: isEmpty ? 'transparent' : getStatusColor(currentStatus)
                }}>
                {!isEmpty && (
                  <>
                    {/* Day number */}
                    <span className={`font-semibold ${['red', 'orange'].includes(currentStatus) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day.date}</span>

                    {/* Capacity indicator bar */}
                    {day.capacity < 100 && (
                      <div className='absolute bottom-1 left-1 right-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full overflow-hidden'>
                        <div className='h-full bg-green-500 transition-all' style={{ width: `${100 - day.capacity}%` }} />
                      </div>
                    )}

                    {/* Today indicator */}
                    {isToday && <div className='absolute inset-0 rounded-lg border-2 border-white dark:border-gray-900 opacity-60'></div>}

                    {/* Selected indicator */}
                    {isSelected && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='absolute top-1 right-1 w-3 h-3 md:w-4 md:h-4 bg-blue-500 rounded-full flex items-center justify-center'>
                        <FaCheck className='text-white text-xs' />
                      </motion.div>
                    )}

                    {/* Project count badge */}
                    {!isSelected && day.projectsCount > 0 && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className='absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-accent rounded-full flex items-center justify-center'>
                        <span className='text-white text-xs font-bold'>{day.projectsCount}</span>
                      </motion.div>
                    )}

                    {/* Hover tooltip - hidden on mobile */}
                    <AnimatePresence>
                      {hoveredDay === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className='hidden md:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-xs z-50 pointer-events-none shadow-lg max-w-xs'>
                          <div className='font-semibold'>{getStatusLabel(currentStatus)}</div>
                          <div className='text-xs opacity-90'>{getDayCapacityLabel(day.capacity)}</div>
                          {day.projectsCount > 0 && (
                            <div className='text-xs opacity-90 mt-1 space-y-1'>
                              <div className='font-medium'>
                                {day.projectsCount} project{day.projectsCount !== 1 ? 's' : ''}
                              </div>
                              {day.projectTitles &&
                                day.projectTitles.slice(0, 3).map((proj, idx) => (
                                  <div key={idx} className='text-xs truncate opacity-90'>
                                    • {proj.title}
                                  </div>
                                ))}
                              {day.projectTitles && day.projectTitles.length > 3 && <div className='text-xs opacity-75'>+{day.projectTitles.length - 3} more</div>}
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
        <div className='mt-6 pt-6 border-t theme-border grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4'>
          {[
            { label: 'Available', value: calendarData.daysBreakdown?.green || 0, statusColor: 'green' },
            { label: 'Partially Busy', value: calendarData.daysBreakdown?.yellow || 0, statusColor: 'yellow' },
            { label: 'Busy', value: calendarData.daysBreakdown?.orange || 0, statusColor: 'orange' },
            { label: 'Fully Busy', value: calendarData.daysBreakdown?.red || 0, statusColor: 'red' }
          ].map((stat) => (
            <div key={stat.label} className='p-2 md:p-3 rounded-lg theme-card border theme-border'>
              <div className='text-xs theme-text-secondary'>{stat.label}</div>
              <div className='text-lg md:text-xl font-bold theme-text'>{stat.value}</div>
              <div className='mt-1 w-2 h-2 rounded-full' style={{ backgroundColor: getStatusColor(stat.statusColor) }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Panel - only in edit mode */}
      {editMode && <AvailabilityEditPanel selectedDays={selectedDays} onStatusChange={onStatusChange} onSave={onSaveChanges} onCancel={onCancel} saving={saving} />}
    </motion.div>
  )
}

DetailedCalendarView.propTypes = {
  calendarData: PropTypes.object.isRequired,
  isOwnProfile: PropTypes.bool,
  isPublicView: PropTypes.bool,
  isPublic: PropTypes.bool,
  editMode: PropTypes.bool,
  selectedDays: PropTypes.object,
  saving: PropTypes.bool,
  togglingVisibility: PropTypes.bool,
  statusFilter: PropTypes.string,
  filterLoading: PropTypes.bool,
  optimisticUpdates: PropTypes.object,
  hoveredDay: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onPreviousMonth: PropTypes.func.isRequired,
  onNextMonth: PropTypes.func.isRequired,
  onEditMode: PropTypes.func,
  onHandleToggleVisibility: PropTypes.func,
  onStatusFilterChange: PropTypes.func,
  onClearFilter: PropTypes.func,
  onDayClick: PropTypes.func,
  onStatusChange: PropTypes.func,
  onSaveChanges: PropTypes.func,
  onCancel: PropTypes.func,
  onHoveredDay: PropTypes.func,
  getStatusColor: PropTypes.func.isRequired,
  getStatusLabel: PropTypes.func.isRequired,
  getDayCapacityLabel: PropTypes.func
}

export default DetailedCalendarView
