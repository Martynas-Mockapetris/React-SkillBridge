import { FaTrash, FaLock, FaEnvelope, FaUserCog, FaSearch, FaChevronLeft, FaChevronRight, FaSort, FaSortUp, FaSortDown, FaFileExport } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { getAdminUsers, toggleUserLock, updateAdminUser, deleteAdminUser } from '../../services/userService'
import AdminUserEditModal from '../../modal/AdminUserEditModal'
import AdminLockUserModal from '../../modal/AdminLockUserModal'
import AdminUserDetailsModal from '../../modal/AdminUserDetailModal'

const AdminUsersList = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortConfig, setSortConfig] = useState('createdAt:desc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUsers, setSelectedUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [lockingUser, setLockingUser] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAdminUsers({
        search: searchQuery,
        role: selectedRole,
        status: selectedStatus,
        page,
        limit: itemsPerPage,
        sort: sortConfig
      })

      setUsers(data.users)
      setTotal(data.total)
      setTotalPages(data.pages)
      setCurrentPage(page)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users')
    } finally {
      setLoading(false)
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

  useEffect(() => {
    fetchUsers(1)
  }, [searchQuery, selectedRole, selectedStatus, sortConfig])

  const openLockModal = (user) => {
    setLockingUser(user)
    setIsLockModalOpen(true)
  }

  const closeLockModal = () => {
    setLockingUser(null)
    setIsLockModalOpen(false)
  }

  const openDetailsModal = (user) => {
    setSelectedUser(user)
    setIsDetailsModalOpen(true)
  }

  const closeDetailsModal = () => {
    setSelectedUser(null)
    setIsDetailsModalOpen(false)
  }

  const handleConfirmLock = async ({ reason, durationDays }) => {
    if (!lockingUser) return
    try {
      await toggleUserLock(lockingUser._id, { reason, durationDays })
      await fetchUsers(currentPage)
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to lock user')
    } finally {
      closeLockModal()
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
      fetchUsers(currentPage)
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
      fetchUsers(currentPage)
    } catch (error) {
      alert(`Failed to delete user: ${error.response?.data?.message || error.message}`)
    }
  }

  const roleTypes = ['client', 'freelancer', 'both']
  const statusTypes = ['Active', 'Inactive', 'Locked']

  const renderPagination = () => {
    const handleNextPage = () => {
      fetchUsers(currentPage + 1)
    }

    const handlePrevPage = () => {
      fetchUsers(currentPage - 1)
    }

    return (
      <div className='flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700'>
        <div className='flex items-center'>
          <span className='text-sm text-gray-700 dark:text-gray-300'>
            Showing page {currentPage} of {totalPages}
          </span>
        </div>
        <div className='flex items-center space-x-2'>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className='px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'>
            <FaChevronLeft className='w-4 h-4' />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className='px-3 py-1 rounded-md bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'>
            <FaChevronRight className='w-4 h-4' />
          </button>
        </div>
      </div>
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedUsers(users.map((user) => user.id))
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

    return (
      <div className='bg-white dark:bg-gray-800 p-4 mb-4 rounded-lg shadow-sm flex items-center justify-between'>
        <span className='text-sm text-gray-700 dark:text-gray-300'>{selectedUsers.length} users selected</span>
        <div className='flex gap-2'>
          <button className='px-3 py-1 text-sm bg-yellow-100 text-yellow-800 rounded-md hover:bg-yellow-200'>
            <FaLock className='inline-block mr-1' /> Suspend Selected
          </button>
          <button className='px-3 py-1 text-sm bg-red-100 text-red-800 rounded-md hover:bg-red-200'>
            <FaTrash className='inline-block mr-1' /> Delete Selected
          </button>
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
      await fetchUsers(currentPage)
      closeEditModal()
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user')
    }
  }

  // Export to CSV
  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Subscription', 'Join Date']
    const data = getSortedUsers().map((user) => [user.name, user.email, user.role, user.status, user.subscription.type, user.joinDate])

    const csvContent = [headers.join(','), ...data.map((row) => row.join(','))].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', 'users_export.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
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
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchQuery('')
              setSelectedRole('')
              setSelectedStatus('')
              setSortConfig('createdAt:desc')
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
                  <input type='checkbox' onChange={handleSelectAll} checked={selectedUsers.length === users.length} className='rounded border-gray-300 text-accent focus:ring-accent' />
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
                  <td colSpan='8' className='px-6 py-4 text-center text-gray-500'>
                    Loading users...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan='8' className='px-6 py-4 text-center text-red-500'>
                    {error}
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan='8' className='px-6 py-4 text-center text-gray-500'>
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user._id}>
                    <td className='px-6 py-4 w-4 text-center'>
                      <input type='checkbox' checked={selectedUsers.includes(user._id)} onChange={() => handleSelectUser(user._id)} className='rounded border-gray-300 text-accent focus:ring-accent' />
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 cursor-pointer' onClick={() => openDetailsModal(user)}>
                      {user.firstName} {user.lastName}
                    </td>
                    <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{user.email}</td>
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
                      <button className='text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-200' onClick={() => openEditModal(user)} title='Edit user'>
                        <FaUserCog className='w-4 h-4' />
                      </button>
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
                      <button className='text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-200'>
                        <FaEnvelope className='w-4 h-4' />
                      </button>
                      <button onClick={() => handleDeleteUser(user)} title='Delete user' className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'>
                        <FaTrash className='w-4 h-4' />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {renderPagination()}
        </div>
      </div>
      <AdminUserEditModal isOpen={isEditModalOpen} onClose={closeEditModal} user={editingUser} onSave={handleSaveUser} />
      <AdminLockUserModal isOpen={isLockModalOpen} onClose={closeLockModal} onConfirm={handleConfirmLock} user={lockingUser} />
      <AdminUserDetailsModal isOpen={isDetailsModalOpen} onClose={closeDetailsModal} user={selectedUser} />
    </div>
  )
}

export default AdminUsersList
