/**
 * Project Status & Priority Utility Functions
 *
 * Used for formatting labels in dropdowns, filters, and other UI elements.
 * Badge components (ProjectStatusBadge, PriorityBadge) handle visual rendering.
 */

/**
 * Format project status for display in UI
 * @param {string} status - The project status (e.g., 'in_progress', 'completed')
 * @returns {string} Formatted label (e.g., 'In Progress', 'Completed')
 */
export const formatProjectStatusLabel = (status) => {
  if (!status) return 'Unknown'
  if (status === 'cancelled_by_admin') return 'Canceled by Admin'

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format project priority for display in UI
 * @param {string} priority - The project priority (e.g., 'high', 'medium', 'low')
 * @returns {string} Formatted label (e.g., 'High', 'Medium', 'Low')
 */
export const formatProjectPriorityLabel = (priority) => {
  if (!priority) return 'Medium'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
