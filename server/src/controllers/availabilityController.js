import AvailabilityCalendar from '../models/AvailabilityCalendar.js'
import Project from '../models/Project.js'

// Priority to capacity consumption mapping
const PRIORITY_CAPACITY = {
  low: 25,
  medium: 50,
  high: 100
}

// Status determination based on total capacity used
const getStatusByCapacity = (capacityUsed) => {
  if (capacityUsed >= 100) return 'red'
  if (capacityUsed >= 50) return 'orange'
  if (capacityUsed > 0) return 'yellow'
  return 'green'
}

// Get or create calendar for a month
export const getOrCreateCalendar = async (freelancerId, year, month) => {
  try {
    let calendar = await AvailabilityCalendar.findOne({
      freelancer: freelancerId,
      year,
      month
    }).populate('days.assignedProjects', 'title priority deadline status')

    if (!calendar) {
      const daysInMonth = new Date(year, month, 0).getDate()
      const days = []
      for (let i = 1; i <= daysInMonth; i++) {
        days.push({
          date: i,
          status: 'green',
          capacity: 100,
          assignedProjects: [],
          manualStatus: null,
          notes: ''
        })
      }

      calendar = new AvailabilityCalendar({
        freelancer: freelancerId,
        year,
        month,
        days
      })
      await calendar.save()
    }

    return calendar
  } catch (error) {
    console.error('Error getting/creating calendar:', error)
    throw error
  }
}

// Get calendar for freelancer
export const getFreelancerCalendar = async (req, res) => {
  try {
    const { freelancerId } = req.params
    const { year, month } = req.query

    if (!year || !month) {
      return res.status(400).json({ message: 'Year and month are required' })
    }

    const calendar = await getOrCreateCalendar(freelancerId, parseInt(year), parseInt(month))

    res.status(200).json({
      success: true,
      data: calendar
    })
  } catch (error) {
    console.error('Error fetching calendar:', error)
    res.status(500).json({ message: 'Error fetching calendar', error: error.message })
  }
}

// Get freelancer availability status
export const getFreelancerAvailability = async (req, res) => {
  try {
    const { freelancerId } = req.params

    // Get current month calendar
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth() + 1

    const calendar = await getOrCreateCalendar(freelancerId, year, month)

    const overallCapacity = calendar.days.reduce((sum, day) => sum + (100 - day.capacity), 0) / calendar.days.length
    const overallStatus = getStatusByCapacity(overallCapacity)

    res.status(200).json({
      success: true,
      data: {
        freelancerId,
        year,
        month,
        overallStatus,
        overallCapacity: Math.round(overallCapacity),
        daysBreakdown: {
          red: calendar.days.filter((d) => d.status === 'red').length,
          orange: calendar.days.filter((d) => d.status === 'orange').length,
          yellow: calendar.days.filter((d) => d.status === 'yellow').length,
          green: calendar.days.filter((d) => d.status === 'green').length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching availability:', error)
    res.status(500).json({ message: 'Error fetching availability', error: error.message })
  }
}

// Update manual availability for a day
export const updateDayAvailability = async (req, res) => {
  try {
    const { freelancerId, year, month, date } = req.params
    const { manualStatus, notes } = req.body

    // Check if freelancer is updating their own calendar
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ message: 'You can only update your own calendar' })
    }

    const calendar = await getOrCreateCalendar(freelancerId, parseInt(year), parseInt(month))

    const dayIndex = calendar.days.findIndex((d) => d.date === parseInt(date))
    if (dayIndex === -1) {
      return res.status(404).json({ message: 'Day not found in calendar' })
    }

    calendar.days[dayIndex].manualStatus = manualStatus || null
    if (notes !== undefined) calendar.days[dayIndex].notes = notes

    // Recalculate status if manual status changed
    if (manualStatus) {
      const capacityMap = { unavailable: 100, busy: 50, available: 0 }
      const baseCapacity = capacityMap[manualStatus] || 0
      const projectCapacity = calendar.days[dayIndex].assignedProjects.reduce((sum, proj) => {
        return sum + (PRIORITY_CAPACITY[proj.priority] || 0)
      }, 0)

      calendar.days[dayIndex].capacity = Math.max(0, 100 - projectCapacity)
      calendar.days[dayIndex].status = getStatusByCapacity(Math.min(100, projectCapacity + baseCapacity))
    }

    calendar.lastUpdatedReason = 'manual'
    await calendar.save()

    res.status(200).json({
      success: true,
      message: 'Availability updated successfully',
      data: calendar
    })
  } catch (error) {
    console.error('Error updating availability:', error)
    res.status(500).json({ message: 'Error updating availability', error: error.message })
  }
}

// Get all calendars for a freelancer (all months)
export const getFreelancerAllCalendars = async (req, res) => {
  try {
    const { freelancerId } = req.params

    const calendars = await AvailabilityCalendar.find({
      freelancer: freelancerId
    })
      .sort({ year: 1, month: 1 })
      .populate('days.assignedProjects', 'title priority deadline status')

    res.status(200).json({
      success: true,
      data: calendars
    })
  } catch (error) {
    console.error('Error fetching all calendars:', error)
    res.status(500).json({ message: 'Error fetching calendars', error: error.message })
  }
}

// Get public calendar (for viewing profile)
export const getPublicFreelancerCalendar = async (req, res) => {
  try {
    const { freelancerId, year, month } = req.params

    const calendar = await AvailabilityCalendar.findOne({
      freelancer: freelancerId,
      year: parseInt(year),
      month: parseInt(month),
      isPublic: true
    }).populate('days.assignedProjects', 'title priority deadline')

    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found or not public' })
    }

    // Only show public information
    const publicData = {
      ...calendar.toObject(),
      days: calendar.days.map((day) => ({
        date: day.date,
        status: day.status,
        capacity: day.capacity,
        projectsCount: day.assignedProjects.length,
        projectTitles: day.assignedProjects.map((p) => ({ title: p.title, priority: p.priority }))
      }))
    }

    res.status(200).json({
      success: true,
      data: publicData
    })
  } catch (error) {
    console.error('Error fetching public calendar:', error)
    res.status(500).json({ message: 'Error fetching calendar', error: error.message })
  }
}

// Toggle calendar visibility
export const toggleCalendarVisibility = async (req, res) => {
  try {
    const { freelancerId } = req.params
    const { year, month } = req.body

    // Check if freelancer is updating their own calendar
    if (req.user._id.toString() !== freelancerId) {
      return res.status(403).json({ message: 'You can only update your own calendar' })
    }

    const calendar = await AvailabilityCalendar.findOneAndUpdate({ freelancer: freelancerId, year, month }, { isPublic: { $not: '$isPublic' } }, { new: true })

    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' })
    }

    res.status(200).json({
      success: true,
      message: `Calendar is now ${calendar.isPublic ? 'public' : 'private'}`,
      data: calendar
    })
  } catch (error) {
    console.error('Error toggling visibility:', error)
    res.status(500).json({ message: 'Error updating visibility', error: error.message })
  }
}

// Calculate freelancer capacity for project filtering
export const calculateFreelancerCapacity = async (req, res) => {
  try {
    const { freelancerId } = req.params
    const { startDate, endDate } = req.query

    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000) // Default 30 days

    // Get all calendars needed for date range
    const startMonth = start.getMonth() + 1
    const startYear = start.getFullYear()
    const endMonth = end.getMonth() + 1
    const endYear = end.getFullYear()

    const calendars = await AvailabilityCalendar.find({
      freelancer: freelancerId,
      $or: [
        {
          year: startYear,
          month: { $gte: startMonth }
        },
        {
          year: { $gt: startYear, $lt: endYear }
        },
        {
          year: endYear,
          month: { $lte: endMonth }
        }
      ]
    }).populate('days.assignedProjects', 'priority')

    // Collect all relevant days
    const relevantDays = []
    for (const calendar of calendars) {
      for (const day of calendar.days) {
        const dayDate = new Date(calendar.year, calendar.month - 1, day.date)
        if (dayDate >= start && dayDate <= end) {
          relevantDays.push({
            date: dayDate,
            capacity: day.capacity,
            status: day.status,
            projects: day.assignedProjects || []
          })
        }
      }
    }

    // Calculate average capacity and find earliest available date for each priority
    const avgCapacity = relevantDays.length > 0 ? relevantDays.reduce((sum, d) => sum + d.capacity, 0) / relevantDays.length : 100
    const totalAvailableCapacity = Math.round(avgCapacity)

    // Find earliest dates when specific projects can be taken
    const getEarliestAvailableDate = (requiredCapacity) => {
      const availableDay = relevantDays.find((d) => d.capacity >= requiredCapacity)
      return availableDay ? availableDay.date : null
    }

    // Determine which project priorities can be accommodated
    const capacityMatrix = {
      low: {
        required: 25,
        canTake: totalAvailableCapacity >= 25,
        earliestAvailable: getEarliestAvailableDate(25),
        maxConcurrent: Math.floor(totalAvailableCapacity / 25)
      },
      medium: {
        required: 50,
        canTake: totalAvailableCapacity >= 50,
        earliestAvailable: getEarliestAvailableDate(50),
        maxConcurrent: Math.floor(totalAvailableCapacity / 50)
      },
      high: {
        required: 100,
        canTake: totalAvailableCapacity >= 100,
        earliestAvailable: getEarliestAvailableDate(100),
        maxConcurrent: Math.floor(totalAvailableCapacity / 100)
      }
    }

    // Determine overall recommendation
    let recommendation = 'unavailable'
    if (capacityMatrix.high.canTake) recommendation = 'available_for_high'
    else if (capacityMatrix.medium.canTake) recommendation = 'available_for_medium'
    else if (capacityMatrix.low.canTake) recommendation = 'available_for_low'

    res.status(200).json({
      success: true,
      data: {
        freelancerId,
        dateRange: { start, end },
        averageCapacity: totalAvailableCapacity,
        totalDaysAnalyzed: relevantDays.length,
        capacityMatrix,
        recommendation,
        daysBreakdown: {
          red: relevantDays.filter((d) => d.status === 'red').length,
          orange: relevantDays.filter((d) => d.status === 'orange').length,
          yellow: relevantDays.filter((d) => d.status === 'yellow').length,
          green: relevantDays.filter((d) => d.status === 'green').length
        }
      }
    })
  } catch (error) {
    console.error('Error calculating capacity:', error)
    res.status(500).json({ message: 'Error calculating capacity', error: error.message })
  }
}

// Batch calculate capacity for multiple freelancers (for project filtering UI)
export const batchCalculateCapacity = async (req, res) => {
  try {
    const { freelancerIds, startDate, endDate } = req.body

    if (!Array.isArray(freelancerIds) || freelancerIds.length === 0) {
      return res.status(400).json({ message: 'freelancerIds array is required' })
    }

    const start = startDate ? new Date(startDate) : new Date()
    const end = endDate ? new Date(endDate) : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000)

    const results = []

    for (const freelancerId of freelancerIds) {
      try {
        const calendars = await AvailabilityCalendar.find({
          freelancer: freelancerId
        }).populate('days.assignedProjects', 'priority')

        const relevantDays = []
        for (const calendar of calendars) {
          for (const day of calendar.days) {
            const dayDate = new Date(calendar.year, calendar.month - 1, day.date)
            if (dayDate >= start && dayDate <= end) {
              relevantDays.push({ capacity: day.capacity, status: day.status })
            }
          }
        }

        const avgCapacity = relevantDays.length > 0 ? Math.round(relevantDays.reduce((sum, d) => sum + d.capacity, 0) / relevantDays.length) : 100

        let recommendation = 'unavailable'
        if (avgCapacity >= 100) recommendation = 'available_for_high'
        else if (avgCapacity >= 50) recommendation = 'available_for_medium'
        else if (avgCapacity > 0) recommendation = 'available_for_low'

        results.push({
          freelancerId,
          averageCapacity: avgCapacity,
          recommendation
        })
      } catch (err) {
        results.push({
          freelancerId,
          error: err.message
        })
      }
    }

    res.status(200).json({
      success: true,
      data: results
    })
  } catch (error) {
    console.error('Error in batch calculation:', error)
    res.status(500).json({ message: 'Error in batch calculation', error: error.message })
  }
}

export const getFilteredAvailability = async (req, res) => {
  try {
    const { freelancerId } = req.params
    const { year, month, status } = req.query
    const userId = req.user._id

    // Check authorization - can only view own or public calendars
    const isOwnCalendar = freelancerId === userId.toString()
    if (!isOwnCalendar) {
      return res.status(403).json({ message: 'Not authorized to view this calendar' })
    }

    // Validate filters
    const validStatuses = ['draft', 'active', 'assigned', 'in_progress', 'under_review', 'completed', 'cancelled']
    const statusFilter = status && validStatuses.includes(status) ? status : null

    const calendar = await AvailabilityCalendar.findOne({
      freelancer: freelancerId,
      year: parseInt(year),
      month: parseInt(month)
    })

    if (!calendar) {
      return res.status(404).json({ message: 'Calendar not found' })
    }

    // Filter days based on project status
    let filteredDays = calendar.days

    if (statusFilter) {
      filteredDays = calendar.days
        .map((day) => {
          if (!day.assignedProjects || day.assignedProjects.length === 0) {
            return day
          }

          const filteredProjects = day.assignedProjects.filter((p) => p.status === statusFilter)

          return {
            ...day.toObject(),
            assignedProjects: filteredProjects,
            projectsCount: filteredProjects.length,
            capacity: filteredProjects.length > 0 ? Math.round((filteredProjects.length / calendar.days.length) * 100) : 0
          }
        })
        .filter((day) => day.projectsCount > 0)
    }

    res.status(200).json({
      message: 'Filtered availability retrieved',
      data: {
        ...calendar.toObject(),
        days: filteredDays,
        appliedFilters: {
          status: statusFilter
        }
      }
    })
  } catch (err) {
    console.error('Error fetching filtered availability:', err)
    res.status(500).json({ message: 'Error fetching availability', error: err.message })
  }
}
