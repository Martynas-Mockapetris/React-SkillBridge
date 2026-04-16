const ADMIN_PANEL_ROLES = ['admin', 'moderator', 'blogger', 'config_manager']

export const hasAdminPanelAccess = (userOrRole) => {
  if (!userOrRole) {
    return false
  }

  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.userType
  return ADMIN_PANEL_ROLES.includes(role)
}

export const isFullAdmin = (userOrRole) => {
  if (!userOrRole) {
    return false
  }

  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.userType
  return role === 'admin'
}

export const getAdminRoleLabel = (userOrRole) => {
  if (!userOrRole) {
    return ''
  }

  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.userType

  if (role === 'admin') return 'Administrator'
  if (role === 'moderator') return 'Moderator'
  if (role === 'blogger') return 'Blogger'
  if (role === 'config_manager') return 'Config Manager'

  return ''
}
