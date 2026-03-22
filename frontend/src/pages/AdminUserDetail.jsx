import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAdminUserAnnouncements, getAdminUserDetail, getAdminUserProjects, toggleUserLock, updateAdminUser } from '../services/userService'
import { deleteAnnouncementAsAdmin, toggleAnnouncementStatusAsAdmin } from '../services/announcementService'
import AdminUserEditModal from '../modal/AdminUserEditModal'
import AdminLockUserModal from '../modal/AdminLockUserModal'
import AdminMailUserModal from '../modal/AdminMailUserModal'

const tabs = [
  { id: 'details', label: 'User Details' },
  { id: 'profile', label: 'Profile' },
  { id: 'projects', label: 'Projects' },
  { id: 'announcements', label: 'Announcements' }
]

const formatDateTime = (value) => {
  if (!value) return 'N/A'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'N/A'
  return date.toLocaleString()
}

const formatMoney = (value) => {
  if (value === undefined || value === null || Number.isNaN(Number(value))) return 'N/A'
  return `€${Number(value)}`
}

const AdminUserDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [activeTab, setActiveTab] = useState('details')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState(null)

  const [projects, setProjects] = useState([])
  const [projectsMeta, setProjectsMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [projectsLoading, setProjectsLoading] = useState(false)
  const [projectQuery, setProjectQuery] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    scope: 'all',
    sort: 'createdAt:desc'
  })

  const [announcements, setAnnouncements] = useState([])
  const [announcementsMeta, setAnnouncementsMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [announcementQuery, setAnnouncementQuery] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    sort: 'createdAt:desc'
  })

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)

  const headerSubtitle = useMemo(() => {
    if (!id) return 'No user selected'
    if (!user) return `User ID: ${id}`
    return `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ID: ${id}`
  }, [id, user])

  const loadUserDetail = async ({ showToastOnError = true } = {}) => {
    if (!id) {
      setError('Missing user id in route')
      setLoading(false)
      return false
    }

    try {
      setLoading(true)
      setError('')
      const response = await getAdminUserDetail(id)
      setUser(response.user || null)
      setMetrics(response.metrics || null)
      return true
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to load user details'
      setError(message)
      if (showToastOnError) toast.error(message)
      return false
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUserDetail()
  }, [id])

  useEffect(() => {
    setProjectQuery((prev) => ({ ...prev, page: 1 }))
    setAnnouncementQuery((prev) => ({ ...prev, page: 1 }))
  }, [id])

  useEffect(() => {
    const loadProjects = async () => {
      if (!id || activeTab !== 'projects') return
      try {
        setProjectsLoading(true)
        const response = await getAdminUserProjects(id, projectQuery)
        setProjects(response.projects || [])
        setProjectsMeta({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1
        })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load user projects')
      } finally {
        setProjectsLoading(false)
      }
    }

    loadProjects()
  }, [activeTab, id, projectQuery])

  useEffect(() => {
    const loadAnnouncements = async () => {
      if (!id || activeTab !== 'announcements') return
      try {
        setAnnouncementsLoading(true)
        const response = await getAdminUserAnnouncements(id, announcementQuery)
        setAnnouncements(response.announcements || [])
        setAnnouncementsMeta({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1
        })
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to load user announcements')
      } finally {
        setAnnouncementsLoading(false)
      }
    }

    loadAnnouncements()
  }, [activeTab, announcementQuery, id])

  const statusLabel = useMemo(() => {
    if (!user) return 'Unknown'
    if (user.isLocked) return 'Locked'
    return 'Active'
  }, [user])

  const refreshAll = async () => {
    const ok = await loadUserDetail({ showToastOnError: true })
    if (!ok) return

    if (activeTab === 'projects') {
      setProjectQuery((prev) => ({ ...prev }))
    }

    if (activeTab === 'announcements') {
      setAnnouncementQuery((prev) => ({ ...prev }))
    }

    toast.success('User data refreshed')
  }

  const handleSaveUser = async (payload) => {
    try {
      if (!payload?._id) {
        toast.error('Invalid user payload')
        return
      }
      await updateAdminUser(payload._id, payload)
      setIsEditModalOpen(false)
      await loadUserDetail({ showToastOnError: false })
      toast.success('User updated successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update user')
    }
  }

  const handleConfirmLock = async ({ reason, durationDays }) => {
    try {
      if (!user?._id) return
      await toggleUserLock(user._id, { reason, durationDays })
      setIsLockModalOpen(false)
      await loadUserDetail({ showToastOnError: false })
      toast.success('User locked successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to lock user')
    }
  }

  const handleUnlock = async () => {
    if (!user?._id) return
    const confirmed = window.confirm(`Unlock ${user.firstName} ${user.lastName}?`)
    if (!confirmed) return

    try {
      await toggleUserLock(user._id)
      await loadUserDetail({ showToastOnError: false })
      toast.success('User unlocked successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unlock user')
    }
  }

  const reloadAnnouncements = async () => {
    if (!id) return
    try {
      setAnnouncementsLoading(true)
      const response = await getAdminUserAnnouncements(id, announcementQuery)
      setAnnouncements(response.announcements || [])
      setAnnouncementsMeta({
        total: response.total || 0,
        page: response.page || 1,
        pages: response.pages || 1
      })
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to reload announcements')
    } finally {
      setAnnouncementsLoading(false)
    }
  }

  const handleToggleAnnouncement = async (announcementId) => {
    try {
      await toggleAnnouncementStatusAsAdmin(announcementId)
      await reloadAnnouncements()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Announcement status updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update announcement status')
    }
  }

  const handleDeleteAnnouncement = async (announcementId, title) => {
    const confirmed = window.confirm(`Delete announcement "${title}"?`)
    if (!confirmed) return

    try {
      await deleteAnnouncementAsAdmin(announcementId)
      await reloadAnnouncements()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Announcement deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete announcement')
    }
  }

  return (
    <div className='min-h-screen bg-gray-100 dark:bg-gray-900 pt-[68px]'>
      <div className='container mx-auto px-6 py-8'>
        <div className='mb-6 flex items-start justify-between gap-4'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>Admin User Detail</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400 mt-1'>{headerSubtitle}</p>
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <button onClick={refreshAll} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
              Refresh
            </button>

            {user && (
              <>
                <button onClick={() => setIsEditModalOpen(true)} className='px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent/90'>
                  Edit User
                </button>

                {!user.isLocked ? (
                  <button onClick={() => setIsLockModalOpen(true)} className='px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700'>
                    Lock User
                  </button>
                ) : (
                  <button onClick={handleUnlock} className='px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700'>
                    Unlock User
                  </button>
                )}

                <button onClick={() => setIsMailModalOpen(true)} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
                  Mail User
                </button>
              </>
            )}

            <button onClick={() => navigate('/admin')} className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'>
              Back to Admin
            </button>
          </div>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm'>
          <div className='border-b border-gray-200 dark:border-gray-700 px-4 pt-4'>
            <div className='flex flex-wrap gap-2'>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-t-lg text-sm font-medium transition ${
                    activeTab === tab.id ? 'bg-accent text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Announcements Tab */}
          <div className='p-6'>
            {loading && <p className='text-gray-700 dark:text-gray-200'>Loading user details...</p>}
            {!loading && error && <p className='text-red-600 dark:text-red-400'>{error}</p>}

            {!loading && !error && activeTab === 'details' && user && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Full Name</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Email</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{user.email || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Role</p>
                  <p className='text-gray-900 dark:text-white font-medium capitalize'>{user.userType || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Status</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{statusLabel}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Created At</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{formatDateTime(user.createdAt)}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Last Login</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{formatDateTime(user.lastLogin)}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Created Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.createdProjects ?? 0}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Assigned Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.assignedProjects ?? 0}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Completed Projects</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{metrics?.completedProjects ?? 0}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Active Announcements</p>
                  <p className='text-gray-900 dark:text-white font-medium'>
                    {metrics?.activeAnnouncements ?? 0} / {metrics?.totalAnnouncements ?? 0}
                  </p>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'profile' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Phone</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{user?.phone || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Location</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{user?.location || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Skills</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{user?.skills || 'N/A'}</p>
                </div>
                <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                  <p className='text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400'>Hourly Rate</p>
                  <p className='text-gray-900 dark:text-white font-medium'>{formatMoney(user?.hourlyRate)}</p>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'projects' && (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <select
                    value={projectQuery.scope}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, scope: e.target.value, page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value='all'>All Scopes</option>
                    <option value='created'>Created</option>
                    <option value='assigned'>Assigned</option>
                  </select>

                  <select
                    value={projectQuery.status}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value='all'>All Statuses</option>
                    <option value='draft'>Draft</option>
                    <option value='active'>Active</option>
                    <option value='assigned'>Assigned</option>
                    <option value='in_progress'>In Progress</option>
                    <option value='under_review'>Under Review</option>
                    <option value='completed'>Completed</option>
                    <option value='cancelled'>Cancelled</option>
                    <option value='archived'>Archived</option>
                    <option value='paused'>Paused</option>
                  </select>

                  <select
                    value={projectQuery.sort}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value='createdAt:desc'>Newest</option>
                    <option value='createdAt:asc'>Oldest</option>
                    <option value='deadline:asc'>Deadline ↑</option>
                    <option value='deadline:desc'>Deadline ↓</option>
                    <option value='budget:desc'>Budget ↓</option>
                    <option value='budget:asc'>Budget ↑</option>
                  </select>

                  <select
                    value={projectQuery.limit}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                  </select>
                </div>

                <div className='text-sm text-gray-500 dark:text-gray-400'>Total projects: {projectsMeta.total}</div>

                {projectsLoading && <p className='text-gray-700 dark:text-gray-200'>Loading projects...</p>}
                {!projectsLoading && projects.length === 0 && <p className='text-gray-700 dark:text-gray-200'>No projects found.</p>}

                {!projectsLoading &&
                  projects.map((project) => (
                    <div key={project._id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <p className='text-gray-900 dark:text-white font-medium'>{project.title || 'Untitled project'}</p>
                        <span className='text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 capitalize'>{project.status || 'unknown'}</span>
                      </div>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        Budget: {formatMoney(project.budget)} | Deadline: {formatDateTime(project.deadline)}
                      </p>
                    </div>
                  ))}

                <div className='flex items-center justify-between pt-2'>
                  <button
                    onClick={() => setProjectQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={projectsMeta.page <= 1 || projectsLoading}
                    className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50'>
                    Previous
                  </button>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Page {projectsMeta.page} / {projectsMeta.pages}
                  </span>
                  <button
                    onClick={() => setProjectQuery((prev) => ({ ...prev, page: Math.min(projectsMeta.pages, prev.page + 1) }))}
                    disabled={projectsMeta.page >= projectsMeta.pages || projectsLoading}
                    className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50'>
                    Next
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && activeTab === 'announcements' && (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <select
                    value={announcementQuery.status}
                    onChange={(e) => setAnnouncementQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value='all'>All Statuses</option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </select>

                  <select
                    value={announcementQuery.sort}
                    onChange={(e) => setAnnouncementQuery((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value='createdAt:desc'>Newest</option>
                    <option value='createdAt:asc'>Oldest</option>
                    <option value='title:asc'>Title A-Z</option>
                    <option value='title:desc'>Title Z-A</option>
                    <option value='hourlyRate:desc'>Rate ↓</option>
                    <option value='hourlyRate:asc'>Rate ↑</option>
                  </select>

                  <select
                    value={announcementQuery.limit}
                    onChange={(e) => setAnnouncementQuery((prev) => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-700 dark:text-white'>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                  </select>
                </div>

                <div className='text-sm text-gray-500 dark:text-gray-400'>Total announcements: {announcementsMeta.total}</div>

                {announcementsLoading && <p className='text-gray-700 dark:text-gray-200'>Loading announcements...</p>}
                {!announcementsLoading && announcements.length === 0 && <p className='text-gray-700 dark:text-gray-200'>No announcements found.</p>}

                {!announcementsLoading &&
                  announcements.map((announcement) => (
                    <div key={announcement._id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <p className='text-gray-900 dark:text-white font-medium'>{announcement.title}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            announcement.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                          {announcement.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        Hourly: {formatMoney(announcement.hourlyRate)} | Skills: {(announcement.skills || []).join(', ') || 'N/A'}
                      </p>
                      <div className='mt-3 flex flex-wrap gap-2'>
                        <button onClick={() => handleToggleAnnouncement(announcement._id)} className='px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'>
                          {announcement.isActive ? 'Pause' : 'Resume'}
                        </button>

                        <button onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)} className='px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700'>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                <div className='flex items-center justify-between pt-2'>
                  <button
                    onClick={() => setAnnouncementQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                    disabled={announcementsMeta.page <= 1 || announcementsLoading}
                    className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50'>
                    Previous
                  </button>
                  <span className='text-sm text-gray-600 dark:text-gray-300'>
                    Page {announcementsMeta.page} / {announcementsMeta.pages}
                  </span>
                  <button
                    onClick={() => setAnnouncementQuery((prev) => ({ ...prev, page: Math.min(announcementsMeta.pages, prev.page + 1) }))}
                    disabled={announcementsMeta.page >= announcementsMeta.pages || announcementsLoading}
                    className='px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 disabled:opacity-50'>
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <AdminUserEditModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} user={user} onSave={handleSaveUser} />

      <AdminLockUserModal isOpen={isLockModalOpen} onClose={() => setIsLockModalOpen(false)} onConfirm={handleConfirmLock} user={user} />

      <AdminMailUserModal
        isOpen={isMailModalOpen}
        onClose={() => setIsMailModalOpen(false)}
        recipient={user}
        onSent={() => {
          toast.success('Mail sent successfully')
        }}
      />
    </div>
  )
}

export default AdminUserDetail
