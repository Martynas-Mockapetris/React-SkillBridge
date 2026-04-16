const ADMIN_PANEL_ROLES = ['admin', 'moderator', 'blogger', 'config_manager']

export const ADMIN_PERMISSIONS = Object.freeze({
  USERS_READ: 'users.read',
  USERS_UPDATE: 'users.update',
  USERS_LOCK: 'users.lock',
  USERS_DELETE: 'users.delete',
  PROJECTS_READ_ADMIN: 'projects.read.admin',
  PROJECTS_UPDATE_ADMIN: 'projects.update.admin',
  PROJECTS_LOCK_ADMIN: 'projects.lock.admin',
  PROJECTS_DELETE_ADMIN: 'projects.delete.admin',
  ANNOUNCEMENTS_READ_ADMIN: 'announcements.read.admin',
  ANNOUNCEMENTS_UPDATE_ADMIN: 'announcements.update.admin',
  ANNOUNCEMENTS_DELETE_ADMIN: 'announcements.delete.admin',
  BLOG_READ_ADMIN: 'blog.read.admin',
  BLOG_WRITE: 'blog.write',
  CONFIG_READ: 'config.read',
  CONFIG_WRITE: 'config.write'
})

const ROLE_ADMIN_PERMISSIONS = Object.freeze({
  admin: Object.freeze(Object.values(ADMIN_PERMISSIONS)),
  moderator: Object.freeze([
    ADMIN_PERMISSIONS.USERS_READ,
    ADMIN_PERMISSIONS.USERS_LOCK,
    ADMIN_PERMISSIONS.PROJECTS_READ_ADMIN,
    ADMIN_PERMISSIONS.PROJECTS_UPDATE_ADMIN,
    ADMIN_PERMISSIONS.PROJECTS_LOCK_ADMIN,
    ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN,
    ADMIN_PERMISSIONS.ANNOUNCEMENTS_UPDATE_ADMIN,
    ADMIN_PERMISSIONS.ANNOUNCEMENTS_DELETE_ADMIN
  ]),
  blogger: Object.freeze([ADMIN_PERMISSIONS.BLOG_READ_ADMIN, ADMIN_PERMISSIONS.BLOG_WRITE]),
  config_manager: Object.freeze([ADMIN_PERMISSIONS.CONFIG_READ, ADMIN_PERMISSIONS.CONFIG_WRITE])
})

const ADMIN_SECTION_REQUIREMENTS = Object.freeze({
  dashboard: [ADMIN_PERMISSIONS.USERS_READ, ADMIN_PERMISSIONS.PROJECTS_READ_ADMIN, ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN],
  users: [ADMIN_PERMISSIONS.USERS_READ],
  projects: [ADMIN_PERMISSIONS.PROJECTS_READ_ADMIN],
  announcements: [ADMIN_PERMISSIONS.ANNOUNCEMENTS_READ_ADMIN],
  blog: [ADMIN_PERMISSIONS.BLOG_READ_ADMIN],
  settings: [ADMIN_PERMISSIONS.CONFIG_READ]
})

const ADMIN_SECTION_ORDER = ['dashboard', 'users', 'projects', 'announcements', 'blog', 'settings']

const getRole = (userOrRole) => {
  if (!userOrRole) {
    return ''
  }

  const role = typeof userOrRole === 'string' ? userOrRole : userOrRole.userType
  return typeof role === 'string' ? role.trim().toLowerCase() : ''
}

export const getAdminPermissions = (userOrRole) => {
  const role = getRole(userOrRole)
  return ROLE_ADMIN_PERMISSIONS[role] || []
}

export const hasAdminPermission = (userOrRole, permission) => {
  if (!permission) {
    return false
  }

  return getAdminPermissions(userOrRole).includes(permission)
}

export const hasAllAdminPermissions = (userOrRole, permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false
  }

  return permissions.every((permission) => hasAdminPermission(userOrRole, permission))
}

export const getAdminSections = (userOrRole) => {
  const role = getRole(userOrRole)

  if (!ADMIN_PANEL_ROLES.includes(role)) {
    return []
  }

  return ADMIN_SECTION_ORDER.filter((sectionId) => hasAllAdminPermissions(userOrRole, ADMIN_SECTION_REQUIREMENTS[sectionId] || []))
}

export const canAccessAdminSection = (userOrRole, sectionId) => {
  if (!sectionId) {
    return false
  }

  return getAdminSections(userOrRole).includes(sectionId)
}

export const getDefaultAdminSection = (userOrRole) => {
  return getAdminSections(userOrRole)[0] || ''
}

export const hasAdminPanelAccess = (userOrRole) => {
  return getAdminSections(userOrRole).length > 0
}

export const isFullAdmin = (userOrRole) => {
  return getRole(userOrRole) === 'admin'
}

export const getAdminRoleLabel = (userOrRole) => {
  const role = getRole(userOrRole)

  if (role === 'admin') return 'Administrator'
  if (role === 'moderator') return 'Moderator'
  if (role === 'blogger') return 'Blogger'
  if (role === 'config_manager') return 'Config Manager'

  return ''
}
