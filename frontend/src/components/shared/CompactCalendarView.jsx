import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const CompactCalendarView = ({ calendarData, currentDate, onPreviousMonth, onNextMonth, getStatusColor, getStatusLabel, getDayCapacityLabel }) => {
  const [hoveredDay, setHoveredDay] = useState(null)

  if (!calendarData || !calendarData.days) {
    return <div className='p-4 text-center theme-text-secondary text-sm'>No calendar data available</div>
  }

  const monthName = new Date(calendarData.year, calendarData.month - 1).toLocaleString('default', {
    month: 'short',
    year: 'numeric'
  })
  // Convert to Monday-first calendar (0 = Monday, 6 = Sunday)
  const firstDayOfMonth = (new Date(calendarData.year, calendarData.month - 1, 1).getDay() + 6) % 7
  const calendarGrid = [...Array(firstDayOfMonth), ...calendarData.days]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-4 theme-card rounded-lg border dark:border-light/10 border-primary/10'>
      {/* Compact Header */}
      <div className='flex items-center justify-between mb-4'>
        <h4 className='text-sm font-semibold theme-text'>{monthName}</h4>
        <div className='flex gap-1'>
          <motion.button onClick={onPreviousMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-1.5 hover:bg-accent/10 rounded transition-colors duration-200' aria-label='Previous month'>
            <FaChevronLeft className='theme-text text-xs' />
          </motion.button>
          <motion.button onClick={onNextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-1.5 hover:bg-accent/10 rounded transition-colors duration-200' aria-label='Next month'>
            <FaChevronRight className='theme-text text-xs' />
          </motion.button>
        </div>
      </div>

      {/* Compact Day Headers */}
      <div className='grid grid-cols-7 gap-0.5 mb-1'>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
          <div key={day} className='text-center text-xs font-semibold theme-text-secondary py-0.5'>
            {day}
          </div>
        ))}
      </div>

      {/* Compact Calendar Grid */}
      <div className='grid grid-cols-7 gap-0.5'>
        <AnimatePresence>
          {calendarGrid?.map((day, idx) => {
            const isEmpty = !day?.date
            const isToday = !isEmpty && new Date(calendarData.year, calendarData.month - 1, day?.date).toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={`${calendarData.month}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                onMouseEnter={() => !isEmpty && setHoveredDay(idx)}
                onMouseLeave={() => setHoveredDay(null)}
                className={`relative aspect-square rounded flex items-center justify-center text-xs font-semibold transition-all duration-150 ${
                  !isEmpty ? 'hover:shadow-md hover:scale-110 cursor-pointer' : ''
                } ${isToday ? 'ring-1' : ''}`}
                style={{
                  backgroundColor: isEmpty ? 'transparent' : getStatusColor(day?.status),
                  ringColor: isToday ? '#ffffff' : 'transparent'
                }}>
                {!isEmpty && (
                  <>
                    <span className={`${['red', 'orange'].includes(day?.status) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day.date}</span>

                    {/* Today indicator - small dot */}
                    {isToday && <div className='absolute inset-0 rounded border border-white dark:border-gray-900 opacity-50 pointer-events-none'></div>}

                    {/* Hover Tooltip */}
                    <AnimatePresence>
                      {hoveredDay === idx && (
                        <motion.div
                          initial={{ opacity: 0, y: -8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: -8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className='hidden sm:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded text-xs z-50 pointer-events-none shadow-lg whitespace-nowrap'>
                          <div className='font-semibold'>{getStatusLabel(day?.status)}</div>
                          <div className='text-xs opacity-80'>{getDayCapacityLabel(day.capacity)}</div>
                          {day.projectsCount > 0 && (
                            <div className='text-xs opacity-80 mt-0.5'>
                              {day.projectsCount} project{day.projectsCount !== 1 ? 's' : ''}
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

      {/* Compact Legend */}
      <div className='grid grid-cols-4 gap-1 mt-3 text-xs'>
        {[
          { status: 'green', label: 'Available' },
          { status: 'yellow', label: 'Partial' },
          { status: 'orange', label: 'Busy' },
          { status: 'red', label: 'Full' }
        ].map((item) => (
          <div key={item.status} className='flex items-center gap-1'>
            <div className='w-1.5 h-1.5 rounded flex-shrink-0' style={{ backgroundColor: getStatusColor(item.status) }}></div>
            <span className='theme-text-secondary truncate'>{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default CompactCalendarView
