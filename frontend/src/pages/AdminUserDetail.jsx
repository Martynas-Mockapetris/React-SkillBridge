import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getAdminUserAnnouncements, getAdminUserDetail, getAdminUserProjects, toggleUserLock, updateAdminUser } from '../services/userService'
import { deleteAnnouncementAsAdmin, toggleAnnouncementStatusAsAdmin } from '../services/announcementService'
import { deleteProjectAsAdmin, removeAssigneeAsAdmin, toggleProjectLockAsAdmin } from '../services/projectService'
import AdminLockProjectModal from '../modal/AdminLockProjectModal'
import AdminUserEditModal from '../modal/AdminUserEditModal'
import AdminLockUserModal from '../modal/AdminLockUserModal'
import AdminMailUserModal from '../modal/AdminMailUserModal'
import PaginationControls from '../components/shared/PaginationControls'

const tabs = [
  { id: 'details', label: 'User Details' },
  { id: 'stats', label: 'Stats' },
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

  // User detail state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState(null)
  const [metrics, setMetrics] = useState(null)

  // Projects state
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

  // Announcements state
  const [announcements, setAnnouncements] = useState([])
  const [announcementsMeta, setAnnouncementsMeta] = useState({ total: 0, page: 1, pages: 1 })
  const [announcementsLoading, setAnnouncementsLoading] = useState(false)
  const [announcementQuery, setAnnouncementQuery] = useState({
    page: 1,
    limit: 10,
    status: 'all',
    sort: 'createdAt:desc'
  })

  // Modals state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [isMailModalOpen, setIsMailModalOpen] = useState(false)
  const [isProjectLockModalOpen, setIsProjectLockModalOpen] = useState(false)
  const [projectToLock, setProjectToLock] = useState(null)
  const [projectActionLoadingId, setProjectActionLoadingId] = useState(null)
  const [announcementActionLoadingId, setAnnouncementActionLoadingId] = useState(null)

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

  const reloadProjects = async () => {
    if (!id) return
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
      toast.error(err?.response?.data?.message || 'Failed to reload projects')
    } finally {
      setProjectsLoading(false)
    }
  }

  const handleToggleProjectLock = async (project) => {
    if (!project?._id) return

    if (!project.isLocked) {
      setProjectToLock(project)
      setIsProjectLockModalOpen(true)
      return
    }

    try {
      setProjectActionLoadingId(project._id)
      await toggleProjectLockAsAdmin(project._id)
      await reloadProjects()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Project unlocked successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to unlock project')
    } finally {
      setProjectActionLoadingId(null)
    }
  }

  const handleConfirmProjectLock = async ({ reason, durationDays }) => {
    if (!projectToLock?._id) return

    try {
      setProjectActionLoadingId(projectToLock._id)
      await toggleProjectLockAsAdmin(projectToLock._id, { reason, durationDays })
      setIsProjectLockModalOpen(false)
      setProjectToLock(null)
      await reloadProjects()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Project locked successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to lock project')
    } finally {
      setProjectActionLoadingId(null)
    }
  }

  const handleRemoveProjectAssignee = async (project) => {
    if (!project?._id) return

    if (!project.assignee) {
      toast.info('This project has no assignee')
      return
    }

    const assigneeName = `${project.assignee.firstName || ''} ${project.assignee.lastName || ''}`.trim() || 'Unknown user'
    const confirmed = window.confirm(`Remove assignee "${assigneeName}" from this project?`)
    if (!confirmed) return

    try {
      setProjectActionLoadingId(project._id)
      await removeAssigneeAsAdmin(project._id)
      await reloadProjects()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Assignee removed successfully')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to remove assignee')
    } finally {
      setProjectActionLoadingId(null)
    }
  }

  const handleCancelProject = async (project) => {
    if (!project?._id) return

    const confirmed = window.confirm(`Cancel project "${project.title || 'Untitled project'}" as admin?`)
    if (!confirmed) return

    try {
      setProjectActionLoadingId(project._id)
      await deleteProjectAsAdmin(project._id)
      await reloadProjects()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Project canceled by admin')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to cancel project')
    } finally {
      setProjectActionLoadingId(null)
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
      setAnnouncementActionLoadingId(announcementId)
      await toggleAnnouncementStatusAsAdmin(announcementId)
      await reloadAnnouncements()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Announcement status updated')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update announcement status')
    } finally {
      setAnnouncementActionLoadingId(null)
    }
  }

  const handleDeleteAnnouncement = async (announcementId, title) => {
    const confirmed = window.confirm(`Delete announcement "${title}"?`)
    if (!confirmed) return

    try {
      setAnnouncementActionLoadingId(announcementId)
      await deleteAnnouncementAsAdmin(announcementId)
      await reloadAnnouncements()
      await loadUserDetail({ showToastOnError: false })
      toast.success('Announcement deleted')
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete announcement')
    } finally {
      setAnnouncementActionLoadingId(null)
    }
  }

  const resetProjectFilters = () => {
    setProjectQuery({
      page: 1,
      limit: 10,
      status: 'all',
      scope: 'all',
      sort: 'createdAt:desc'
    })
  }

  const resetAnnouncementFilters = () => {
    setAnnouncementQuery({
      page: 1,
      limit: 10,
      status: 'all',
      sort: 'createdAt:desc'
    })
  }

  const getTabCount = (tabId) => {
    if (tabId === 'stats') {
      return (metrics?.createdProjects ?? 0) + (metrics?.assignedProjects ?? 0)
    }
    if (tabId === 'projects') {
      return projectsMeta?.total ?? 0
    }
    if (tabId === 'announcements') {
      return announcementsMeta?.total ?? 0
    }
    return null
  }

  const hasProjectFilters = projectQuery.scope !== 'all' || projectQuery.status !== 'all' || projectQuery.sort !== 'createdAt:desc' || projectQuery.limit !== 10
  const hasAnnouncementFilters = announcementQuery.status !== 'all' || announcementQuery.sort !== 'createdAt:desc' || announcementQuery.limit !== 10

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
                  <span className='inline-flex items-center gap-2'>
                    <span>{tab.label}</span>
                    {getTabCount(tab.id) !== null && (
                      <span
                        className={`inline-flex min-w-5 h-5 items-center justify-center rounded-full px-1.5 text-[11px] font-semibold ${
                          activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200'
                        }`}>
                        {getTabCount(tab.id)}
                      </span>
                    )}
                  </span>
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

            {!loading && !error && activeTab === 'stats' && (
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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

            {!loading && !error && activeTab === 'projects' && (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <select
                    value={projectQuery.scope}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, scope: e.target.value, page: 1 }))}
                    className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
                    <option value='all'>All Scopes</option>
                    <option value='created'>Created</option>
                    <option value='assigned'>Assigned</option>
                  </select>

                  <select
                    value={projectQuery.status}
                    onChange={(e) => setProjectQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
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
                    className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
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
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                  </select>

                  <button onClick={resetProjectFilters} className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                    Reset
                  </button>
                </div>

                <div className='text-sm text-gray-500 dark:text-gray-400'>Total projects: {projectsMeta.total}</div>

                {projectsLoading && <p className='text-gray-700 dark:text-gray-200'>Loading projects...</p>}
                {!projectsLoading && projects.length === 0 && (
                  <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                    <p className='text-gray-700 dark:text-gray-200'>No projects found.</p>
                    {hasProjectFilters && (
                      <button onClick={resetProjectFilters} className='mt-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                        Clear filters
                      </button>
                    )}
                  </div>
                )}

                {!projectsLoading &&
                  projects.map((project) => (
                    <div key={project._id} className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                      <div className='flex items-center justify-between gap-3'>
                        <p className='text-gray-900 dark:text-white font-medium'>{project.title || 'Untitled project'}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded capitalize ${
                            project.isLocked ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                          }`}>
                          {project.status || 'unknown'}
                        </span>
                      </div>
                      <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                        Budget: {formatMoney(project.budget)} | Deadline: {formatDateTime(project.deadline)}
                      </p>

                      {project.isLocked && (
                        <div className='mt-2 rounded-md border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2'>
                          <p className='text-xs font-medium text-red-700 dark:text-red-300'>
                            Locked
                            {project.lockExpiresAt ? ` until ${formatDateTime(project.lockExpiresAt)}` : ''}
                          </p>
                          {project.lockReason && <p className='text-xs text-red-600 dark:text-red-300/90 mt-1'>Reason: {project.lockReason}</p>}
                        </div>
                      )}
                      <div className='mt-3 flex flex-wrap gap-2'>
                        <button
                          onClick={() => handleToggleProjectLock(project)}
                          disabled={projectActionLoadingId === project._id}
                          className='px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-60'>
                          {project.isLocked ? 'Unlock' : 'Lock'}
                        </button>

                        <button
                          onClick={() => handleRemoveProjectAssignee(project)}
                          disabled={projectActionLoadingId === project._id}
                          className='px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-60'>
                          Remove Assignee
                        </button>

                        <button
                          onClick={() => handleCancelProject(project)}
                          disabled={projectActionLoadingId === project._id}
                          className='px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60'>
                          Cancel
                        </button>
                      </div>
                    </div>
                  ))}

                <PaginationControls
                  currentPage={projectsMeta.page}
                  totalPages={projectsMeta.pages}
                  onPrev={() => setProjectQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  onNext={() => setProjectQuery((prev) => ({ ...prev, page: Math.min(projectsMeta.pages, prev.page + 1) }))}
                  label={`Page ${projectsMeta.page} of ${projectsMeta.pages}`}
                />
              </div>
            )}

            {!loading && !error && activeTab === 'announcements' && (
              <div className='space-y-4'>
                <div className='flex flex-wrap items-center gap-2'>
                  <select
                    value={announcementQuery.status}
                    onChange={(e) => setAnnouncementQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
                    className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
                    <option value='all'>All Statuses</option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </select>

                  <select
                    value={announcementQuery.sort}
                    onChange={(e) => setAnnouncementQuery((prev) => ({ ...prev, sort: e.target.value, page: 1 }))}
                    className='px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
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
                    className='px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
                    <option value={10}>10 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={30}>30 / page</option>
                  </select>

                  <button onClick={resetAnnouncementFilters} className='px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                    Reset
                  </button>
                </div>

                <div className='text-sm text-gray-500 dark:text-gray-400'>Total announcements: {announcementsMeta.total}</div>

                {announcementsLoading && <p className='text-gray-700 dark:text-gray-200'>Loading announcements...</p>}
                {!announcementsLoading && announcements.length === 0 && (
                  <div className='rounded-lg border border-gray-200 dark:border-gray-700 p-4'>
                    <p className='text-gray-700 dark:text-gray-200'>No announcements found.</p>
                    {hasAnnouncementFilters && (
                      <button onClick={resetAnnouncementFilters} className='mt-3 px-4 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors'>
                        Clear filters
                      </button>
                    )}
                  </div>
                )}

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
                        <button
                          onClick={() => handleToggleAnnouncement(announcement._id)}
                          disabled={announcementActionLoadingId === announcement._id}
                          className='px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-60'>
                          {announcement.isActive ? 'Pause' : 'Resume'}
                        </button>

                        <button
                          onClick={() => handleDeleteAnnouncement(announcement._id, announcement.title)}
                          disabled={announcementActionLoadingId === announcement._id}
                          className='px-3 py-1.5 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-60'>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                <PaginationControls
                  currentPage={announcementsMeta.page}
                  totalPages={announcementsMeta.pages}
                  onPrev={() => setAnnouncementQuery((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  onNext={() => setAnnouncementQuery((prev) => ({ ...prev, page: Math.min(announcementsMeta.pages, prev.page + 1) }))}
                  label={`Page ${announcementsMeta.page} of ${announcementsMeta.pages}`}
                />
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

      <AdminLockProjectModal
        isOpen={isProjectLockModalOpen}
        onClose={() => {
          setIsProjectLockModalOpen(false)
          setProjectToLock(null)
        }}
        onConfirm={handleConfirmProjectLock}
        project={projectToLock ? { id: projectToLock._id, name: projectToLock.title || 'Untitled project' } : null}
        loading={projectActionLoadingId === projectToLock?._id}
      />
    </div>
  )
}

export default AdminUserDetail
