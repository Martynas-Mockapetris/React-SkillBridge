export const PERMISSIONS = Object.freeze({
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

export const ALL_PERMISSIONS = Object.freeze(Object.values(PERMISSIONS))

const ADMIN_PERMISSIONS = Object.freeze([...ALL_PERMISSIONS])

export const ROLE_PERMISSIONS = Object.freeze({
  client: Object.freeze([]),
  freelancer: Object.freeze([]),
  both: Object.freeze([]),
  admin: ADMIN_PERMISSIONS
})

const normalizeRole = (role) => {
  if (typeof role !== 'string') {
    return ''
  }

  return role.trim().toLowerCase()
}

export const getUserRole = (userOrRole) => {
  if (!userOrRole) {
    return ''
  }

  if (typeof userOrRole === 'string') {
    return normalizeRole(userOrRole)
  }

  return normalizeRole(userOrRole.userType)
}

export const getRolePermissions = (userOrRole) => {
  const role = getUserRole(userOrRole)
  return ROLE_PERMISSIONS[role] || []
}

export const hasPermission = (userOrRole, permission) => {
  if (!permission) {
    return false
  }

  return getRolePermissions(userOrRole).includes(permission)
}

export const hasAnyPermission = (userOrRole, permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false
  }

  return permissions.some((permission) => hasPermission(userOrRole, permission))
}

export const hasAllPermissions = (userOrRole, permissions = []) => {
  if (!Array.isArray(permissions) || permissions.length === 0) {
    return false
  }

  return permissions.every((permission) => hasPermission(userOrRole, permission))
}
