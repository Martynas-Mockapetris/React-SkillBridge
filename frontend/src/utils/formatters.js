// Format status from database format to display format
export const formatStatus = (status) => {
  if (!status) return 'Not specified'

  return String(status)
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
