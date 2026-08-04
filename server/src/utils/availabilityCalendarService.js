import AvailabilityCalendar from '../models/AvailabilityCalendar.js'
import Logger from './logger.js'

const logger = new Logger('AvailabilityCalendarService')

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
 * Get capacity weight for a priority level
 * @param {string} priority - 'low', 'medium', or 'high'
 * @returns {number} Capacity weight (25, 50, or 100)
 */
const getCapacityWeight = (priority) => {
  return PRIORITY_CAPACITY[priority] || PRIORITY_CAPACITY.low
}

/**
 * Calculate total capacity used by projects on a specific day
 * @param {Array} assignedProjectIds - Array of project ObjectIds
 * @param {Map} projectMap - Map of projectId -> project object with priority
 * @returns {number} Total capacity used (0-100+)
 */
const calculateTotalCapacityUsed = (assignedProjectIds, projectMap) => {
  return assignedProjectIds.reduce((total, projectId) => {
    const projectKey = projectId.toString()
    const project = projectMap.get(projectKey)
    const priority = project?.priority || 'low'
    return total + getCapacityWeight(priority)
  }, 0)
}

/**
 * Check if assigning a project would create a High Priority conflict
 * High Priority projects need exclusive access (no other projects allowed)
 * @param {Array} assignedProjectIds - Current projects on day
 * @param {Map} projectMap - Map of all projects
 * @returns {boolean} True if there's a conflict
 */
const hasHighPriorityConflict = (assignedProjectIds, projectMap) => {
  return assignedProjectIds.some((projectId) => {
    const projectKey = projectId.toString()
    const project = projectMap.get(projectKey)
    return project?.priority === 'high'
  })
}

/**
 * Check if a new project can be assigned to a date range without exceeding capacity
 * @param {Array} assignedProjectIds - Current projects on a specific day
 * @param {Object} newProject - Project to be assigned {priority, _id}
 * @param {Map} projectMap - Map of all existing projects
 * @returns {Object} {canAssign: boolean, capacityUsed: number, capacityAvailable: number, conflictReason: string|null}
 */
const validateDayCapacity = (assignedProjectIds, newProject, projectMap) => {
  const newProjectWeight = getCapacityWeight(newProject.priority)

  // Check High Priority exclusivity
  if (newProject.priority === 'high' && assignedProjectIds.length > 0) {
    return {
      canAssign: false,
      capacityUsed: calculateTotalCapacityUsed(assignedProjectIds, projectMap),
      capacityAvailable: 0,
      conflictReason: 'Cannot assign High Priority project when other projects exist on this date'
    }
  }

  if (hasHighPriorityConflict(assignedProjectIds, projectMap)) {
    return {
      canAssign: false,
      capacityUsed: 100,
      capacityAvailable: 0,
      conflictReason: 'Cannot assign project: High Priority project already occupies this date'
    }
  }

  // Calculate current capacity
  const currentCapacityUsed = calculateTotalCapacityUsed(assignedProjectIds, projectMap)
  const capacityAfterAssignment = currentCapacityUsed + newProjectWeight

  // Check if assignment would exceed 100%
  if (capacityAfterAssignment > 100) {
    return {
      canAssign: false,
      capacityUsed: currentCapacityUsed,
      capacityAvailable: 100 - currentCapacityUsed,
      conflictReason: `Cannot assign project (${newProjectWeight}% needed). Only ${100 - currentCapacityUsed}% capacity available`
    }
  }

  return {
    canAssign: true,
    capacityUsed: capacityAfterAssignment,
    capacityAvailable: 100 - capacityAfterAssignment,
    conflictReason: null
  }
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
      logger.warn('Project has no deadline, skipping calendar population')
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

          // Recalculate capacity using weighted calculation
          const totalCapacity = day.assignedProjects.reduce((sum, proj) => {
            return sum + getCapacityWeight(priority)
          }, 0)

          day.capacity = Math.max(0, 100 - totalCapacity)
          day.status = getStatusByCapacity(totalCapacity)
          day.lastUpdatedReason = 'project_assignment'
        }
      }

      calendar.lastUpdatedReason = 'project_assignment'
      await calendar.save()
    }

    logger.debug(`Availability calendar updated for freelancer ${freelancerId} for project ${projectId}`)
  } catch (error) {
    logger.error('Error populating availability on project assignment:', error)
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

        // Recalculate capacity and status - note: uses stored priority from remaining projects
        const totalCapacity = day.assignedProjects.length > 0 ? day.assignedProjects.length * PRIORITY_CAPACITY.medium : 0
        day.capacity = Math.max(0, 100 - totalCapacity)
        day.status = getStatusByCapacity(totalCapacity)

        return day
      })

      calendar.lastUpdatedReason = 'project_completion'
      await calendar.save()
    }

    logger.debug(`Project ${projectId} removed from availability for freelancer ${freelancerId}`)
  } catch (error) {
    logger.error('Error removing project from availability:', error)
    // Don't throw - this is secondary operation
  }
}
