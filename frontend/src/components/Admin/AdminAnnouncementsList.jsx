import { FaTrash, FaToggleOn, FaToggleOff, FaSearch, FaUser } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { getAllAnnouncements, toggleAnnouncementStatusAsAdmin, deleteAnnouncementAsAdmin } from '../../services/announcementService'
import { toast } from 'react-toastify'
import PaginationControls from '../shared/PaginationControls'
import { useNavigate } from 'react-router-dom'

const AdminAnnouncementsList = () => {
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [total, setTotal] = useState(0)
  const navigate = useNavigate()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortConfig, setSortConfig] = useState('createdAt:desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(1)

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      setError(null)

      const data = await getAllAnnouncements({
        search: searchQuery,
        status: selectedStatus,
        page: currentPage,
        limit: pageSize,
        sort: sortConfig,
        includeInactive: true
      })

      setAnnouncements(data.announcements || data)
      setTotal(data.total || data.length)
      setTotalPages(Math.max(1, data.pages || Math.ceil(data.length / pageSize)))
    } catch (err) {
      console.error('Error fetching announcements:', err)
      setError('Failed to load announcements')
      toast.error('Failed to load announcements')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedStatus, sortConfig, pageSize])

  useEffect(() => {
    if (totalPages >= 1 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    fetchAnnouncements()
  }, [currentPage, searchQuery, selectedStatus, sortConfig, pageSize])

  const handleToggleStatus = async (announcement) => {
    const action = announcement.isActive ? 'deactivate' : 'activate'
    const confirmed = window.confirm(`Are you sure you want to ${action} this announcement?`)
    if (!confirmed) return

    try {
      await toggleAnnouncementStatusAsAdmin(announcement._id)
      toast.success(`Announcement ${action}d successfully`)
      fetchAnnouncements()
    } catch (error) {
      toast.error(`Failed to ${action} announcement: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleDeleteAnnouncement = async (announcement) => {
    const confirmed = window.confirm(`Are you sure you want to DELETE this announcement?\n\nTitle: ${announcement.title}\nBy: ${announcement.userId?.firstName} ${announcement.userId?.lastName}\n\nThis cannot be undone.`)
    if (!confirmed) return

    try {
      await deleteAnnouncementAsAdmin(announcement._id)
      toast.success('Announcement deleted successfully')
      fetchAnnouncements()
    } catch (error) {
      toast.error(`Failed to delete announcement: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleViewUser = (userId) => {
    navigate(`/admin/users/${userId}`)
  }

  const getStatusBadgeClasses = (isActive) => {
    return isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>Announcements Management</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>Moderate freelancer service announcements</p>
        </div>
        <button onClick={fetchAnnouncements} className='px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-all text-sm font-medium'>
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6'>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {/* Search */}
          <div className='relative'>
            <FaSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search by title, skills, or user...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
          </div>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value=''>All Status</option>
            <option value='active'>Active</option>
            <option value='inactive'>Inactive</option>
          </select>

          {/* Sort */}
          <select
            value={sortConfig}
            onChange={(e) => setSortConfig(e.target.value)}
            className='px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
            <option value='createdAt:desc'>Newest First</option>
            <option value='createdAt:asc'>Oldest First</option>
            <option value='hourlyRate:desc'>Highest Rate</option>
            <option value='hourlyRate:asc'>Lowest Rate</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Total Announcements</p>
          <p className='text-2xl font-bold text-gray-900 dark:text-white'>{total}</p>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Active</p>
          <p className='text-2xl font-bold text-green-600'>{announcements.filter((a) => a.isActive).length}</p>
        </div>
        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>Inactive</p>
          <p className='text-2xl font-bold text-gray-600'>{announcements.filter((a) => !a.isActive).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className='bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden'>
        {loading && (
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-accent'></div>
          </div>
        )}

        {error && (
          <div className='p-8 text-center'>
            <p className='text-red-600 dark:text-red-400'>{error}</p>
            <button onClick={fetchAnnouncements} className='mt-4 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'>
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && announcements.length === 0 && <div className='p-8 text-center text-gray-500 dark:text-gray-400'>No announcements found</div>}

        {!loading && !error && announcements.length > 0 && (
          <>
            <div className='overflow-x-auto'>
              <table className='w-full'>
                <thead className='bg-gray-50 dark:bg-gray-700'>
                  <tr>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Title & Skills</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>User</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Rate</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Status</th>
                    <th className='px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Created</th>
                    <th className='px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider'>Actions</th>
                  </tr>
                </thead>
                <tbody className='bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700'>
                  {announcements.map((announcement) => (
                    <tr key={announcement._id} className='hover:bg-gray-50 dark:hover:bg-gray-700'>
                      <td className='px-6 py-4'>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>{announcement.title}</div>
                        <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                          {announcement.skills?.slice(0, 3).join(', ')}
                          {announcement.skills?.length > 3 && ` +${announcement.skills.length - 3} more`}
                        </div>
                      </td>
                      <td className='px-6 py-4'>
                        <div className='text-sm text-gray-900 dark:text-white'>
                          {announcement.userId?.firstName} {announcement.userId?.lastName}
                        </div>
                        <div className='text-sm text-gray-500 dark:text-gray-400'>{announcement.userId?.email}</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <div className='text-sm font-medium text-gray-900 dark:text-white'>€{announcement.hourlyRate}/hr</div>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap'>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(announcement.isActive)}`}>{announcement.isActive ? 'Active' : 'Inactive'}</span>
                      </td>
                      <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400'>{formatDate(announcement.createdAt)}</td>
                      <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                        <div className='flex items-center justify-end gap-2'>
                          <button onClick={() => handleViewUser(announcement.userId?._id)} className='text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300' title='View User'>
                            <FaUser />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(announcement)}
                            className={`${announcement.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'} dark:hover:opacity-80`}
                            title={announcement.isActive ? 'Deactivate' : 'Activate'}>
                            {announcement.isActive ? <FaToggleOn size={20} /> : <FaToggleOff size={20} />}
                          </button>
                          <button onClick={() => handleDeleteAnnouncement(announcement)} className='text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300' title='Delete'>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className='px-6 py-4 border-t border-gray-200 dark:border-gray-700'>
              <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                total={total}
                onPageChange={setCurrentPage}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminAnnouncementsList
