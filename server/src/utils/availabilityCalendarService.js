import AvailabilityCalendar from '../models/AvailabilityCalendar.js'

const PRIORITY_CAPACITY = {
  low: 25,
  medium: 50,
  high: 100
}

const getStatusByCapacity = (capacityUsed) => {
  if (capacityUsed >= 100) return 'red'
  if (capacityUsed >= 50) return 'orange'
  if (capacityUsed > 0) return 'yellow'
  return 'green'
}

/**
 * Automatically populate availability calendar when project is assigned
 * @param {string} freelancerId - ID of freelancer being assigned
 * @param {object} projectData - Project object with deadline, priority, and _id
 */
export const populateAvailabilityOnProjectAssignment = async (freelancerId, projectData) => {
  try {
    const { _id: projectId, deadline, priority = 'low' } = projectData

    if (!deadline) {
      console.warn('Project has no deadline, skipping calendar population')
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const deadlineDate = new Date(deadline)
    deadlineDate.setHours(0, 0, 0, 0)

    // Get all months between today and deadline
    const affectedMonths = []
    const currentDate = new Date(today)

    while (currentDate <= deadlineDate) {
      const year = currentDate.getFullYear()
      const month = currentDate.getMonth() + 1
      affectedMonths.push({ year, month })
      currentDate.setMonth(currentDate.getMonth() + 1)
    }

    // Update each month's calendar
    for (const { year, month } of affectedMonths) {
      let calendar = await AvailabilityCalendar.findOne({
        freelancer: freelancerId,
        year,
        month
      })

      if (!calendar) {
        // Create calendar if it doesn't exist
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
      }

      // Find which days in this month should be marked
      const daysInMonth = calendar.days.length
      let dayStart = 1
      let dayEnd = daysInMonth

      // If deadline is in this month, only mark until deadline
      if (year === deadlineDate.getFullYear() && month === deadlineDate.getMonth() + 1) {
        dayEnd = deadlineDate.getDate()
      }

      // If current month is today's month, start from today
      if (year === today.getFullYear() && month === today.getMonth() + 1) {
        dayStart = today.getDate()
      }

      // Mark days with project
      for (let d = dayStart; d <= dayEnd; d++) {
        const dayIndex = calendar.days.findIndex((day) => day.date === d)
        if (dayIndex !== -1) {
          const day = calendar.days[dayIndex]

          // Add project to assignedProjects if not already there
          if (!day.assignedProjects.includes(projectId)) {
            day.assignedProjects.push(projectId)
          }

          // Recalculate capacity
          const totalCapacity = day.assignedProjects.reduce((sum, proj) => {
            // Get priority from actual project or estimate based on order
            return sum + (PRIORITY_CAPACITY[priority] || 0)
          }, 0)

          day.capacity = Math.max(0, 100 - totalCapacity)
          day.status = getStatusByCapacity(totalCapacity)
          day.lastUpdatedReason = 'project_assignment'
        }
      }

      calendar.lastUpdatedReason = 'project_assignment'
      await calendar.save()
    }

    console.log(`Availability calendar updated for freelancer ${freelancerId} for project ${projectId}`)
  } catch (error) {
    console.error('Error populating availability on project assignment:', error)
    // Don't throw - this is secondary operation
  }
}

/**
 * Remove project from availability calendar when assignment is removed
 * @param {string} freelancerId - ID of freelancer
 * @param {string} projectId - ID of project being unassigned
 */
export const removeProjectFromAvailability = async (freelancerId, projectId) => {
  try {
    const calendars = await AvailabilityCalendar.find({
      freelancer: freelancerId
    })

    for (const calendar of calendars) {
      calendar.days = calendar.days.map((day) => {
        // Remove project from assignedProjects
        day.assignedProjects = day.assignedProjects.filter((id) => id.toString() !== projectId.toString())

        // Recalculate capacity and status
        const totalCapacity = day.assignedProjects.length > 0 ? day.assignedProjects.length * 50 : 0
        day.capacity = Math.max(0, 100 - totalCapacity)
        day.status = getStatusByCapacity(totalCapacity)

        return day
      })

      calendar.lastUpdatedReason = 'project_completion'
      await calendar.save()
    }

    console.log(`Project ${projectId} removed from availability for freelancer ${freelancerId}`)
  } catch (error) {
    console.error('Error removing project from availability:', error)
    // Don't throw - this is secondary operation
  }
}
