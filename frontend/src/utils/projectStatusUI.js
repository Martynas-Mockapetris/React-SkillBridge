const PROJECT_STATUS_BADGE_CLASSES = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  assigned: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  negotiating: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  in_progress: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300',
  under_review: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  paused: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  cancelled_by_admin: 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300',
  deleted_by_owner: 'bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-200',
  archived: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900 dark:text-zinc-300',
  inactive: 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300'
}

const PROJECT_PRIORITY_BADGE_CLASSES = {
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
}

export const getProjectStatusBadgeClass = (status) => {
  return PROJECT_STATUS_BADGE_CLASSES[status] || PROJECT_STATUS_BADGE_CLASSES.inactive
}

export const formatProjectStatusLabel = (status) => {
  if (!status) return 'Unknown'
  if (status === 'cancelled_by_admin') return 'Canceled by Admin'

  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export const getProjectPriorityBadgeClass = (priority) => {
  return PROJECT_PRIORITY_BADGE_CLASSES[priority] || PROJECT_PRIORITY_BADGE_CLASSES.medium
}

export const formatProjectPriorityLabel = (priority) => {
  if (!priority) return 'Medium'
  return priority.charAt(0).toUpperCase() + priority.slice(1)
}
