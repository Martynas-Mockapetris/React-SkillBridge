import { FaTrash, FaLock, FaEnvelope, FaUserCog, FaSearch, FaFileExport, FaKey, FaCheckCircle, FaClock } from 'react-icons/fa'
import { useState, useEffect, useRef } from 'react'
import { getAdminUsers, toggleUserLock, updateAdminUser, requestAdminPasswordReset, requestAdminEmailVerification, reactivateAdminUser, verifyAdminUserDirect, deleteAdminUser } from '../../services/userService'
import AdminUserEditModal from '../../modal/AdminUserEditModal'
import AdminLockUserModal from '../../modal/AdminLockUserModal'
import AdminUserDetailsModal from '../../modal/AdminUserDetailModal'
import AdminMailUserModal from '../../modal/AdminMailUserModal'
import PaginationControls from '../shared/PaginationControls'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_PERMISSIONS, hasAdminPermission } from '../../utils/accessRoles'

const AdminUsersList = ({ navigationRequest }) => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortConfig, setSortConfig] = useState('createdAt:desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [lockingUser, setLockingUser] = useState(null)
  const [bulkLockTarget, setBulkLockTarget] = useState(null)
  const [isBulkLockModalOpen, setIsBulkLockModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [mailRecipient, setMailRecipient] = useState(null)
  const { currentUser } = useAuth()
  const canUpdateUsers = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.USERS_UPDATE)
  const canLockUsers = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.USERS_LOCK)
  const canDeleteUsers = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.USERS_DELETE)
  const canResetUsers = canUpdateUsers
  const canVerifyUsers = canUpdateUsers
  const [selectedVerification, setSelectedVerification] = useState('')
  const [selectedPasswordResetRequired, setSelectedPasswordResetRequired] = useState('')
  const latestUsersFetchRef = useRef(0)
  const [activePresetLabel, setActivePresetLabel] = useState('')
  const [selectedAdminTag, setSelectedAdminTag] = useState('')
  const [selectedNotesState, setSelectedNotesState] = useState('')

  const fetchUsers = async () => {
    const fetchId = ++latestUsersFetchRef.current

    try {
      setLoading(true)
      setError(null)

      const data = await getAdminUsers({
        search: searchQuery,
        role: selectedRole,
        status: selectedStatus,
        verification: selectedVerification,
        passwordResetRequired: selectedPasswordResetRequired,
        adminTag: selectedAdminTag,
        notesState: selectedNotesState,
        page: currentPage,
        limit: pageSize,
        sort: sortConfig
      })

      if (fetchId !== latestUsersFetchRef.current) return

      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(Math.max(1, data.pages || 1))
    } catch (err) {
      if (fetchId !== latestUsersFetchRef.current) return

      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      if (fetchId === latestUsersFetchRef.current) {
        setLoading(false)
      }
    }
  }

  const INACTIVE_THRESHOLD_DAYS = 14

  const getUserStatus = (user) => {
    if (user.isLocked) return 'Locked'
    if (!user.lastLogin) return 'Inactive'

    const lastLoginDate = new Date(user.lastLogin)
    const threshold = new Date(Date.now() - INACTIVE_THRESHOLD_DAYS * 24 * 60 * 60 * 1000)

    return lastLoginDate < threshold ? 'Inactive' : 'Active'
  }

  const getStatusBadgeClasses = (status) => {
    if (status === 'Locked') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    if (status === 'Inactive') return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  }

  const getVerificationMeta = (user) => {
    if (user?.isEmailVerified) {
      return {
        label: 'Verified',
        icon: <FaCheckCircle className='w-4 h-4 text-green-600 dark:text-green-400' />,
        sortValue: 1
      }
    }

    return {
      label: 'Pending',
      icon: <FaClock className='w-4 h-4 text-amber-500 dark:text-amber-400' />,
      sortValue: 0
    }
  }

  const toggleVerificationSort = () => {
    setSortConfig((prev) => (prev === 'isEmailVerified:desc' ? 'isEmailVerified:asc' : 'isEmailVerified:desc'))
  }

  const verificationSortLabel = sortConfig === 'isEmailVerified:desc' ? 'Verified first' : sortConfig === 'isEmailVerified:asc' ? 'Pending first' : 'Sort by verification'

  const isPrivilegedUser = (user) => ['admin', 'moderator', 'blogger', 'config_manager'].includes(user.userType)

  const hasAdminNotes = (user) => Boolean(user?.adminNotes && String(user.adminNotes).trim())

  const buildUsersPresetLabel = (filters = {}) => {
    if (filters.status === 'locked') return 'Queue preset: Locked users'
    if (filters.status === 'inactive') return 'Queue preset: Inactive users'
    if (filters.verification === 'unverified') return 'Queue preset: Unverified users'
    if (filters.passwordResetRequired === 'true') return 'Queue preset: Password reset required'
    return ''
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedRole('')
    setSelectedStatus('')
    setSelectedVerification('')
    setSelectedPasswordResetRequired('')
    setSelectedAdminTag('')
    setSelectedNotesState('')
    setSortConfig('createdAt:desc')
    setCurrentPage(1)
    setActivePresetLabel('')
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedRole, selectedStatus, selectedVerification, selectedPasswordResetRequired, selectedAdminTag, selectedNotesState, sortConfig, pageSize])

  useEffect(() => {
    if (!navigationRequest || navigationRequest.section !== 'users') return

    const filters = navigationRequest.filters || {}

    setSearchQuery(filters.search || '')
    setSelectedRole(filters.role || '')
    setSelectedStatus(filters.status || '')
    setSelectedVerification(filters.verification || '')
    setSelectedPasswordResetRequired(filters.passwordResetRequired || '')
    setSelectedAdminTag(filters.adminTag || '')
    setSelectedNotesState(filters.notesState || '')
    setSortConfig(filters.sort || 'createdAt:desc')
    setCurrentPage(1)
    setActivePresetLabel(buildUsersPresetLabel(filters))
  }, [navigationRequest?.requestId, navigationRequest?.section])

  useEffect(() => {
    if (totalPages >= 1 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery, selectedRole, selectedStatus, selectedVerification, selectedPasswordResetRequired, selectedAdminTag, selectedNotesState, sortConfig, pageSize])

  const openLockModal = (user) => {
    setLockingUser(user)
    setIsLockModalOpen(true)
  }

  const closeLockModal = () => {
    setLockingUser(null)
    setIsLockModalOpen(false)
  }

  const openBulkLockModal = () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !user.isLocked && !isPrivilegedUser(user))

    if (eligibleUsers.length === 0) {
      alert('No eligible users selected for bulk lock.')
      return
    }

    setBulkLockTarget({
      _id: 'bulk-lock',
      firstName: `${eligibleUsers.length}`,
      lastName: eligibleUsers.length === 1 ? 'selected user' : 'selected users'
    })
    setIsBulkLockModalOpen(true)
  }

  const closeBulkLockModal = () => {
    setBulkLockTarget(null)
    setIsBulkLockModalOpen(false)
  }

  const openDetailsModal = (user) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedUser(null)
    setIsDetailsModalOpen(false)
  }

  const openMailModal = (user) => {
    setMailRecipient(user)
    setIsMailModalOpen(true)
  }

  const closeMailModal = () => {
    setMailRecipient(null)
    setIsMailModalOpen(false)
  }

  const handleConfirmLock = async ({ reason, durationDays }) => {
    if (!lockingUser) return
    try {
      await toggleUserLock(lockingUser._id, { reason, durationDays })
      await fetchUsers()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to lock user')
    } finally {
      closeLockModal()
    }
  }

  const handleConfirmBulkLock = async ({ reason, durationDays }) => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !user.isLocked && !isPrivilegedUser(user))

    if (eligibleUsers.length === 0) {
      closeBulkLockModal()
      alert('No eligible users selected for bulk lock.')
      return
    }

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => toggleUserLock(user._id, { reason, durationDays })))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])
      closeBulkLockModal()

      if (failedCount === 0) {
        alert(`${successCount} users locked successfully.`)
      } else {
        alert(`${successCount} users locked successfully. ${failedCount} requests failed.`)
      }
    } catch (error) {
      closeBulkLockModal()
      alert(`Failed to process bulk lock: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkUnlock = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => user.isLocked && !isPrivilegedUser(user))

    if (eligibleUsers.length === 0) {
      alert('No eligible users selected for bulk unlock.')
      return
    }

    const confirmed = window.confirm(`Unlock ${eligibleUsers.length} selected users?`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => toggleUserLock(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`${successCount} users unlocked successfully.`)
      } else {
        alert(`${successCount} users unlocked successfully. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk unlock: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleLockUser = async (user) => {
    if (!user.isLocked) {
      openLockModal(user)
      return
    }
    const confirmed = window.confirm(`Unlock ${user.firstName} ${user.lastName}?`)
    if (!confirmed) return
    try {
      await toggleUserLock(user._id)
      fetchUsers()
    } catch (error) {
      alert(`Failed to unlock user: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDeleteUser = async (user) => {
    const confirmed = window.confirm(`Are you sure you want to DELETE ${user.firstName} ${user.lastName}? This cannot be undone.`)

    if (!confirmed) return

    try {
      await deleteAdminUser(user._id)
      // Refresh the list
      fetchUsers()
    } catch (error) {
      alert(`Failed to delete user: ${error.response?.data?.message || error.message}`)
    }
  }

  const handlePasswordReset = async (user) => {
    const confirmed = window.confirm(`Send a password reset email to ${user.firstName} ${user.lastName}?`)

    if (!confirmed) return

    try {
      const response = await requestAdminPasswordReset(user._id)
      alert(response.message || 'Password reset email sent.')
      await fetchUsers()
    } catch (error) {
      alert(`Failed to request password reset: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleReactivateUser = async (user) => {
    const confirmed = window.confirm(`Reactivate ${user.firstName} ${user.lastName} by refreshing their activity timestamp?`)
    if (!confirmed) return

    try {
      const response = await reactivateAdminUser(user._id)
      alert(response.message || 'User reactivated successfully.')
      await fetchUsers()
    } catch (error) {
      alert(`Failed to reactivate user: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDirectVerifyUser = async (user) => {
    const confirmed = window.confirm(`Directly verify ${user.firstName} ${user.lastName} without sending a verification email?`)
    if (!confirmed) return

    try {
      const response = await verifyAdminUserDirect(user._id)
      alert(response.message || 'User email verified successfully.')
      await fetchUsers()
    } catch (error) {
      alert(`Failed to directly verify user: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkReactivateUsers = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user) && !user.isLocked && getUserStatus(user) === 'Inactive')

    if (eligibleUsers.length === 0) {
      alert('No eligible inactive users selected for reactivation.')
      return
    }

    const confirmed = window.confirm(`Reactivate ${eligibleUsers.length} selected users by refreshing their activity timestamp?`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => reactivateAdminUser(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`${successCount} users reactivated successfully.`)
      } else {
        alert(`${successCount} users reactivated successfully. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk reactivation: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkPasswordReset = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user))

    if (eligibleUsers.length === 0) {
      alert('No eligible users selected for password reset.')
      return
    }

    const confirmed = window.confirm(`Send password reset emails to ${eligibleUsers.length} selected users?`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => requestAdminPasswordReset(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`Password reset emails sent to ${successCount} users.`)
      } else {
        alert(`Password reset emails sent to ${successCount} users. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk password reset: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkDirectVerifyUsers = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user) && !user.isEmailVerified)

    if (eligibleUsers.length === 0) {
      alert('No eligible unverified users selected for direct verification.')
      return
    }

    const confirmed = window.confirm(`Directly verify ${eligibleUsers.length} selected users without sending verification emails?`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => verifyAdminUserDirect(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`${successCount} users verified successfully.`)
      } else {
        alert(`${successCount} users verified successfully. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk direct verification: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkVerificationResend = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !user.isEmailVerified)

    if (eligibleUsers.length === 0) {
      alert('No eligible users selected for verification resend.')
      return
    }

    const confirmed = window.confirm(`Send verification emails to ${eligibleUsers.length} selected users?`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => requestAdminEmailVerification(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`Verification emails requested for ${successCount} users.`)
      } else {
        alert(`Verification emails requested for ${successCount} users. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk verification resend: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleBulkDelete = async () => {
    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user))

    if (eligibleUsers.length === 0) {
      alert('No eligible users selected for bulk delete.')
      return
    }

    const confirmed = window.confirm(`Delete ${eligibleUsers.length} selected users?\n\nThis will also remove their related project associations. This cannot be undone.`)
    if (!confirmed) return

    try {
      const results = await Promise.allSettled(eligibleUsers.map((user) => deleteAdminUser(user._id)))

      const successCount = results.filter((result) => result.status === 'fulfilled').length
      const failedCount = results.length - successCount

      await fetchUsers()
      setSelectedUsers([])

      if (failedCount === 0) {
        alert(`${successCount} users deleted successfully.`)
      } else {
        alert(`${successCount} users deleted successfully. ${failedCount} requests failed.`)
      }
    } catch (error) {
      alert(`Failed to process bulk delete: ${error.response?.data?.message || error.message}`)
    }
  }

  const roleTypes = ['client', 'freelancer', 'both', 'moderator', 'blogger', 'config_manager', 'admin']
  const statusTypes = [
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'locked', label: 'Locked' }
  ]

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user._id))
    } else {
      setSelectedUsers([])
    }
  }

  const handleSelectUser = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId)
      }
      return [...prev, userId]
    })
  }

  // Bulk actions toolbar
  const BulkActions = () => {
    if (selectedUsers.length === 0) return null
    if (!canLockUsers && !canDeleteUsers && !canResetUsers && !canVerifyUsers) return null

    const selectedUserRecords = users.filter((user) => selectedUsers.includes(user._id))
    const eligibleVerificationUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user) && !user.isEmailVerified)
    const eligibleReactivationUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user) && !user.isLocked && getUserStatus(user) === 'Inactive')
    const eligibleResetUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user))
    const eligibleLockUsers = selectedUserRecords.filter((user) => !user.isLocked && !isPrivilegedUser(user))
    const eligibleUnlockUsers = selectedUserRecords.filter((user) => user.isLocked && !isPrivilegedUser(user))
    const eligibleDeleteUsers = selectedUserRecords.filter((user) => !isPrivilegedUser(user))

    return (
      <div className='bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-sm space-y-3'>
        <div className='text-sm text-gray-700 dark:text-gray-300'>
          {selectedUsers.length} users selected
          {canVerifyUsers && ` • ${eligibleVerificationUsers.length} eligible for verification`}
          {canUpdateUsers && ` • ${eligibleReactivationUsers.length} eligible for reactivation`}
          {canLockUsers && ` • ${eligibleLockUsers.length} eligible for lock`}
          {canLockUsers && ` • ${eligibleUnlockUsers.length} eligible for unlock`}
          {canResetUsers && ` • ${eligibleResetUsers.length} eligible for reset`}
          {canDeleteUsers && ` • ${eligibleDeleteUsers.length} eligible for delete`}
        </div>

        <div className='flex flex-wrap gap-2'>
          {canLockUsers && (
            <button
              onClick={openBulkLockModal}
              disabled={eligibleLockUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleLockUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'}`}>
              <FaLock className='shrink-0' />
              <span>Suspend Selected ({eligibleLockUsers.length})</span>
            </button>
          )}

          {canLockUsers && (
            <button
              onClick={handleBulkUnlock}
              disabled={eligibleUnlockUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleUnlockUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-100 text-green-800 hover:bg-green-200'}`}>
              <FaLock className='shrink-0' />
              <span>Unlock Selected ({eligibleUnlockUsers.length})</span>
            </button>
          )}

          {canVerifyUsers && (
            <>
              <button
                onClick={handleBulkVerificationResend}
                disabled={eligibleVerificationUsers.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleVerificationUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'}`}>
                <FaEnvelope className='shrink-0' />
                <span>Resend Verification ({eligibleVerificationUsers.length})</span>
              </button>

              <button
                onClick={handleBulkDirectVerifyUsers}
                disabled={eligibleVerificationUsers.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${
                  eligibleVerificationUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}>
                <FaCheckCircle className='shrink-0' />
                <span>Verify Selected ({eligibleVerificationUsers.length})</span>
              </button>
            </>
          )}

          {canUpdateUsers && (
            <button
              onClick={handleBulkReactivateUsers}
              disabled={eligibleReactivationUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleReactivationUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200'}`}>
              <FaClock className='shrink-0' />
              <span>Reactivate Selected ({eligibleReactivationUsers.length})</span>
            </button>
          )}

          {canResetUsers && (
            <button
              onClick={handleBulkPasswordReset}
              disabled={eligibleResetUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleResetUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'}`}>
              <FaKey className='shrink-0' />
              <span>Reset Passwords ({eligibleResetUsers.length})</span>
            </button>
          )}

          {canDeleteUsers && (
            <button
              onClick={handleBulkDelete}
              disabled={eligibleDeleteUsers.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-sm rounded-md whitespace-nowrap ${eligibleDeleteUsers.length === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-red-100 text-red-800 hover:bg-red-200'}`}>
              <FaTrash className='shrink-0' />
              <span>Delete Selected ({eligibleDeleteUsers.length})</span>
            </button>
          )}
        </div>
      </div>
    )
  }

  const openEditModal = (user) => {
    setEditingUser(user)
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setIsEditModalOpen(false)
    setEditingUser(null)
  }

  const handleSaveUser = async (payload) => {
    try {
      await updateAdminUser(payload._id, payload)
      await fetchUsers()
      closeEditModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user')
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Verification', 'Name', 'Email', 'Role', 'Status', 'Subscription', 'Join Date']

    const escapeCSV = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

    const data = users.map((user) => [
      user.isEmailVerified ? 'Verified' : 'Pending',
      `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      user.email || '',
      user.userType || '',
      getUserStatus(user),
      user.subscription?.type || 'N/A',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''
    ])

    const csvContent = [headers.map(escapeCSV).join(','), ...data.map((row) => row.map(escapeCSV).join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'users_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <h2 className='text-xl font-semibold mb-4 text-gray-900 dark:text-white'>Users Management</h2>
      <BulkActions />
      {/* Filters Section */}

      <div className='mb-4 flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm'>
        <div className='flex items-center gap-4'>
          <div className='text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>Total Users: </span>
            <span className='font-semibold text-gray-900 dark:text-white'>{total}</span>
          </div>
          <div className='text-sm'>
            <span className='text-gray-500 dark:text-gray-400'>Showing: </span>
            <span className='font-semibold text-gray-900 dark:text-white'>{users.length}</span>
          </div>
        </div>
        <button
          onClick={exportToCSV}
          className='flex items-center gap-2 px-4 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors'>
          <FaFileExport className='w-4 h-4' />
          Export CSV
        </button>
      </div>

      {activePresetLabel && (
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-accent/20 bg-accent/10 px-4 py-3 text-sm text-gray-800 dark:text-gray-100'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-white'>Active Queue Preset</span>
            <span>{activePresetLabel}</span>
          </div>

          <button type='button' onClick={clearAllFilters} className='rounded-lg border border-accent/30 bg-white px-3 py-2 text-sm font-medium text-accent hover:bg-accent/5 dark:bg-gray-800 dark:hover:bg-accent/10'>
            Clear preset
          </button>
        </div>
      )}

      <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm space-y-4'>
        {/* Search Row */}
        <div className='w-full'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search users by name or email...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
          </div>
        </div>

        {/* Filters Row */}
        <div className='flex flex-wrap gap-3 w-full'>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Roles</option>
            {roleTypes.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Status</option>
            {statusTypes.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>

          <select
            value={selectedVerification}
            onChange={(e) => setSelectedVerification(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Verification</option>
            <option value='verified'>Verified</option>
            <option value='unverified'>Unverified</option>
          </select>

          <select
            value={selectedPasswordResetRequired}
            onChange={(e) => setSelectedPasswordResetRequired(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Recovery States</option>
            <option value='true'>Password Reset Required</option>
            <option value='false'>No Forced Reset</option>
          </select>

          <input
            type='text'
            value={selectedAdminTag}
            onChange={(e) => setSelectedAdminTag(e.target.value)}
            placeholder='Filter by admin tag...'
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
          />

          <select
            value={selectedNotesState}
            onChange={(e) => setSelectedNotesState(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Note States</option>
            <option value='with_notes'>With Internal Notes</option>
            <option value='without_notes'>Without Internal Notes</option>
          </select>

          <select
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
            className='flex-1 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value='createdAt:desc'>Newest First</option>
            <option value='createdAt:asc'>Oldest First</option>
            <option value='lastLogin:desc'>Recent Login First</option>
            <option value='lastLogin:asc'>Oldest Login First</option>
            <option value='isEmailVerified:desc'>Verified First</option>
            <option value='isEmailVerified:asc'>Pending First</option>
          </select>

          <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
            <span>Show</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className='px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
              title='Users per page'>
              <option value={10}>10</option>
              <option value={30}>30</option>
              <option value={60}>60</option>
              <option value={90}>90</option>
            </select>
          </div>

          <button
            onClick={() => {
              clearAllFilters()
            }}
            className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
            Reset
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className='overflow-x-auto'>
        <div className='min-w-[800px] sm:w-full p-4 sm:p-0'>
          <table className='min-w-full bg-white dark:bg-gray-800 rounded-lg'>
            <thead>
              <tr className='bg-gray-50 dark:bg-gray-700'>
                <th className='px-6 py-3 w-4 text-center'>
                  <input type='checkbox' onChange={handleSelectAll} checked={users.length > 0 && selectedUsers.length === users.length} className='rounded border-gray-300 text-accent focus:ring-accent' />
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>
                  <button type='button' onClick={toggleVerificationSort} className='inline-flex items-center gap-2 hover:text-accent transition-colors' title={verificationSortLabel}>
                    <span>Verification</span>
                  </button>
                </th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Name</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Email</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Role</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Join Date</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Last Login</th>
                <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Actions</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-gray-200 dark:divide-gray-700'>
              {loading ? (
                <tr>
                  <td colSpan='9' className='px-6 py-4 text-center text-gray-500'>
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan='9' className='px-6 py-4 text-center text-red-500'>
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan='9' className='px-6 py-4 text-center text-gray-500'>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className='px-6 py-4 w-4 text-center'>
                      <input type='checkbox' checked={selectedUsers.includes(user._id)} onChange={() => handleSelectUser(user._id)} className='rounded border-gray-300 text-accent focus:ring-accent' />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>
                      {(() => {
                        const verification = getVerificationMeta(user)
                        return (
                          <div className='flex items-center gap-2' title={verification.label}>
                            {verification.icon}
                            <span className='hidden sm:inline'>{verification.label}</span>
                          </div>
                        )
                      })()}
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-900 dark:text-gray-100 cursor-pointer' onClick={() => openDetailsModal(user)}>
                      <div className='space-y-2'>
                        <div className='font-medium'>
                          {user.firstName} {user.lastName}
                        </div>

                        {Array.isArray(user.adminTags) && user.adminTags.length > 0 && (
                          <div className='flex flex-wrap gap-2'>
                            {user.adminTags.slice(0, 2).map((tag) => (
                              <span key={`${user._id}-${tag}`} className='inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300'>
                                {tag}
                              </span>
                            ))}

                            {user.adminTags.length > 2 && (
                              <span className='inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300'>+{user.adminTags.length - 2} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 text-sm text-gray-500 dark:text-gray-400'>
                      <div className='space-y-2'>
                        <div className='break-all'>{user.email}</div>

                        {hasAdminNotes(user) && (
                          <span className='inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'>Has internal note</span>
                        )}
                      </div>
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.userType.charAt(0).toUpperCase() + user.userType.slice(1)}</td>
                    <td className='px-6 py-4 whitespace-nowrap'>
                      {(() => {
                        const status = getUserStatus(user)
                        return <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(status)}`}>{status}</span>
                      })()}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3 flex'>
                      {canUpdateUsers && (
                        <button className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200' onClick={() => openEditModal(user)} title='Edit user'>
                          <FaUserCog className='w-4 h-4' />
                        </button>
                      )}

                      {canLockUsers && (
                        <button
                          onClick={() => {
                            if (user.isLocked) {
                              handleLockUser(user)
                            } else {
                              openLockModal(user)
                            }
                          }}
                          title={user.isLocked ? 'Unlock user' : 'Lock user'}
                          className='text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200'>
                          <FaLock className='w-4 h-4' />
                        </button>
                      )}

                      {canResetUsers && !isPrivilegedUser(user) && (
                        <button onClick={() => handlePasswordReset(user)} title='Send password reset email' className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'>
                          <FaKey className='w-4 h-4' />
                        </button>
                      )}

                      {canUpdateUsers && !isPrivilegedUser(user) && !user.isLocked && getUserStatus(user) === 'Inactive' && (
                        <button onClick={() => handleReactivateUser(user)} title='Reactivate user activity' className='text-cyan-600 hover:text-cyan-900 dark:text-cyan-400 dark:hover:text-cyan-200'>
                          <FaClock className='w-4 h-4' />
                        </button>
                      )}

                      {canVerifyUsers && !user.isEmailVerified && (
                        <>
                          <button onClick={() => handleVerificationResend(user)} title='Send verification email' className='text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-200'>
                            <FaEnvelope className='w-4 h-4' />
                          </button>

                          <button onClick={() => handleDirectVerifyUser(user)} title='Directly verify user email' className='text-emerald-600 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200'>
                            <FaCheckCircle className='w-4 h-4' />
                          </button>
                        </>
                      )}

                      <button onClick={() => openMailModal(user)} title='Send admin mail' className='text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200'>
                        <FaEnvelope className='w-4 h-4' />
                      </button>

                      {canDeleteUsers && (
                        <button onClick={() => handleDeleteUser(user)} title='Delete user' className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'>
                          <FaTrash className='w-4 h-4' />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <PaginationControls currentPage={currentPage} totalPages={totalPages} onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))} onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} />
        </div>
      </div>
      <AdminUserEditModal isOpen={isEditModalOpen} onClose={closeEditModal} user={editingUser} onSave={handleSaveUser} />
      <AdminLockUserModal isOpen={isLockModalOpen} onClose={closeLockModal} onConfirm={handleConfirmLock} user={lockingUser} />
      <AdminLockUserModal isOpen={isBulkLockModalOpen} onClose={closeBulkLockModal} onConfirm={handleConfirmBulkLock} user={bulkLockTarget} />
      <AdminUserDetailsModal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} user={selectedUser} />
      <AdminMailUserModal isOpen={isMailModalOpen} onClose={closeMailModal} recipient={mailRecipient} onSent={fetchUsers} />
    </div>
  )
}

export default AdminUsersList
