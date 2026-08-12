import { motion, AnimatePresence } from 'framer-motion'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

const CompactCalendarView = ({ calendarData, currentDate, onPreviousMonth, onNextMonth, getStatusColor, getStatusLabel }) => {
  if (!calendarData || !calendarData.days) {
    return <div className='p-4 text-center theme-text-secondary text-sm'>No calendar data available</div>
  }

  // Helper to generate calendar grid for a specific month
  const generateCalendarGrid = (year, month, daysData) => {
    const firstDayOfMonth = (new Date(year, month - 1, 1).getDay() + 6) % 7
    const daysInMonth = new Date(year, month, 0).getDate()
    const leadingEmpty = Array(firstDayOfMonth).fill(null)

    let monthDays
    if (daysData) {
      monthDays = daysData
    } else {
      // Create placeholder days with green status for months without data
      monthDays = Array.from({ length: daysInMonth }, (_, i) => ({
        date: i + 1,
        status: 'green',
        capacity: 100
      }))
    }

    const trailingEmpty = Array(42 - leadingEmpty.length - monthDays.length).fill(null)
    return [...leadingEmpty, ...monthDays, ...trailingEmpty]
  }

  // Get month name
  const getMonthName = (year, month) => new Date(year, month - 1).toLocaleString('default', { month: 'short' })

  // Calculate previous month
  const getPrevMonth = (year, month) => (month === 1 ? { year: year - 1, month: 12 } : { year, month: month - 1 })

  // Calculate next month
  const getNextMonth = (year, month) => (month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 })

  const currentYear = calendarData.year
  const currentMonth = calendarData.month
  const { year: prevYear, month: prevMonth } = getPrevMonth(currentYear, currentMonth)
  const { year: nextYear, month: nextMonth } = getNextMonth(currentYear, currentMonth)

  // Generate grids
  const prevGrid = generateCalendarGrid(prevYear, prevMonth, null)
  const currentGrid = generateCalendarGrid(currentYear, currentMonth, calendarData.days)
  const nextGrid = generateCalendarGrid(nextYear, nextMonth, null)

  // Mini month renderer
  const renderMiniMonth = (year, month, grid) => (
    <div className='flex flex-col items-center gap-1 flex-1 min-w-0'>
      <h5 className='text-sm font-semibold theme-text text-center'>{getMonthName(year, month)}</h5>
      {/* Day headers */}
      <div className='grid grid-cols-7 gap-px w-full mb-0.5'>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day) => (
          <div key={day} className='text-center text-xs font-semibold theme-text-secondary py-0.5'>
            {day}
          </div>
        ))}
      </div>
      {/* Calendar grid */}
      <div className='grid grid-cols-7 gap-px w-full bg-gray-50 dark:bg-gray-800/20 p-1 rounded'>
        <AnimatePresence>
          {grid?.map((day, idx) => {
            const isEmpty = !day?.date
            const isToday = !isEmpty && new Date(year, month - 1, day?.date).toDateString() === new Date().toDateString()

            return (
              <motion.div
                key={`${month}-${idx}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.01 }}
                className={`aspect-square text-xs rounded flex items-center justify-center font-semibold transition-all duration-150 ${
                  !isEmpty ? 'hover:shadow-md hover:scale-110 cursor-pointer' : ''
                } ${isToday ? 'ring-1' : ''}`}
                style={{
                  backgroundColor: isEmpty ? 'transparent' : getStatusColor(day?.status),
                  ringColor: isToday ? '#ffffff' : 'transparent'
                }}
                title={!isEmpty ? `${day.date} - ${getStatusLabel(day?.status)}` : ''}>
                {!isEmpty && <span className={`${['red', 'orange'].includes(day?.status) ? 'text-white' : 'text-gray-900 dark:text-white'}`}>{day.date}</span>}
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='p-4 theme-card rounded-lg border dark:border-light/10 border-primary/10'>
      {/* Navigation */}
      <div className='flex items-center justify-between mb-4'>
        <motion.button onClick={onPreviousMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-1.5 hover:bg-accent/10 rounded transition-colors duration-200' aria-label='Previous month'>
          <FaChevronLeft className='theme-text text-xs' />
        </motion.button>
        <span className='text-xs font-semibold theme-text-secondary'>
          {getMonthName(prevYear, prevMonth)} - {getMonthName(nextYear, nextMonth)}
        </span>
        <motion.button onClick={onNextMonth} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className='p-1.5 hover:bg-accent/10 rounded transition-colors duration-200' aria-label='Next month'>
          <FaChevronRight className='theme-text text-xs' />
        </motion.button>
      </div>

      {/* Three-month view */}
      <div className='flex gap-3 w-full'>
        {renderMiniMonth(prevYear, prevMonth, prevGrid)}
        {renderMiniMonth(currentYear, currentMonth, currentGrid)}
        {renderMiniMonth(nextYear, nextMonth, nextGrid)}
      </div>

      {/* Legend */}
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
