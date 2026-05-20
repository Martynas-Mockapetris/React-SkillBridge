import { formatStatus } from './formatters'

export const getCollaborationStageLabel = (status) => {
  switch (status) {
    case 'active':
      return 'Open for proposals'
    case 'assigned':
      return 'Freelancer assigned'
    case 'negotiating':
      return 'Negotiation in progress'
    case 'in_progress':
      return 'Work in progress'
    case 'under_review':
      return 'Awaiting review'
    default:
      return formatStatus(status)
  }
}

export const getCollaborationStageClasses = (status) => {
  switch (status) {
    case 'negotiating':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
    case 'in_progress':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
    case 'under_review':
      return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
    default:
      return 'bg-accent/10 text-accent'
  }
}

export const getProjectRelationshipSummary = ({ isOwner, isAssignee, hasAssignee }) => {
  if (isOwner) {
    return 'You are managing this project as the client.'
  }

  if (isAssignee) {
    return 'You are the assigned freelancer on this project.'
  }

  if (hasAssignee) {
    return 'This project already has a selected freelancer.'
  }

  return 'This project is still open for the right collaborator.'
}

export const getDisplayName = (user, fallback) => {
  if (!user) return fallback

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  return fullName || fallback
}
