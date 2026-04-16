import { FaSearch, FaFilter, FaPlus, FaEdit, FaTrash, FaLock, FaEye } from 'react-icons/fa'
import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import ProjectModal from '../../modal/ProjectModal'
import AdminProjectCancelModal from '../../modal/AdminProjectCancelModal'
import AdminProjectEditModal from '../../modal/AdminProjectEditModal'
import AdminProjectDetailModal from '../../modal/AdminProjectDetailModal'
import AdminLockProjectModal from '../../modal/AdminLockProjectModal'
import PaginationControls from '../shared/PaginationControls'
import { getAdminAllProjects, deleteProjectAsAdmin, updateProjectAsAdmin, toggleProjectLockAsAdmin, removeAssigneeAsAdmin } from '../../services/projectService'
import { getProjectStatusBadgeClass, formatProjectStatusLabel, getProjectPriorityBadgeClass, formatProjectPriorityLabel } from '../../utils/projectStatusUI'
import { useAuth } from '../../context/AuthContext'
import { ADMIN_PERMISSIONS, hasAdminPermission, isFullAdmin } from '../../utils/accessRoles'

const ProgressBar = ({ progress }) => (
  <div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 mt-2'>
    <div className='bg-accent h-2.5 rounded-full transition-all duration-300' style={{ width: `${progress}%` }} />
  </div>
)

const TeamAvatars = ({ team }) => (
  <div className='flex -space-x-2'>
    {team.map((member, index) => (
      <div key={index} className='w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs border-2 border-white dark:border-gray-800' title={member}>
        {member
          .split(' ')
          .map((n) => n[0])
          .join('')}
      </div>
    ))}
  </div>
)

const AdminProjectsList = () => {
  // State
  const [selectedStatus, setSelectedStatus] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriority, setPriority] = useState('All')
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  })
  const [sortBy, setSortBy] = useState('createdAt:desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(30)
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)
  const [lockLoadingProjectId, setLockLoadingProjectId] = useState(null)
  const [isLockModalOpen, setIsLockModalOpen] = useState(false)
  const [projectToLock, setProjectToLock] = useState(null)

  // Data
  const [projectsData, setProjectsData] = useState([])
  const [overallTotalCount, setOverallTotalCount] = useState(0)
  const [totalFilteredCount, setTotalFilteredCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [summaryCounts, setSummaryCounts] = useState({
    total: 0,
    active: 0,
    in_progress: 0,
    under_review: 0,
    completed: 0,
    cancelled: 0
  })
  const [filterOptions, setFilterOptions] = useState({
    statuses: [],
    categories: [],
    priorities: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Edit modal state
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingProjectId, setEditingProjectId] = useState(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    category: '',
    skills: '',
    budget: '',
    priority: 'low',
    deadline: '',
    status: 'active'
  })
  const [removeAssigneeLoading, setRemoveAssigneeLoading] = useState(false)
  const [editingProjectMeta, setEditingProjectMeta] = useState({
    assignee: null,
    owner: null
  })

  // Detail modal state
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [projectForDetails, setProjectForDetails] = useState(null)

  const statusOptions = ['All', ...filterOptions.statuses]
  const categoryOptions = ['All', ...filterOptions.categories]
  const priorityOptions = ['All', ...filterOptions.priorities]

  // Auth
  const { currentUser } = useAuth()
  const canUpdateProjects = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.PROJECTS_UPDATE_ADMIN)
  const canLockProjects = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.PROJECTS_LOCK_ADMIN)
  const canDeleteProjects = hasAdminPermission(currentUser, ADMIN_PERMISSIONS.PROJECTS_DELETE_ADMIN)
  const canCreateProjects = isFullAdmin(currentUser)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getAdminAllProjects({
        search: searchQuery,
        status: selectedStatus === 'All' ? '' : selectedStatus,
        category: selectedCategory === 'All' ? '' : selectedCategory,
        priority: selectedPriority === 'All' ? '' : selectedPriority,
        startDate: dateRange.start,
        endDate: dateRange.end,
        page: currentPage,
        limit: pageSize,
        sort: sortBy
      })

      const data = response.projects || []

      // Map backend project shape to current card UI shape
      const mapped = data.map((project) => ({
        id: project._id,
        name: project.title || 'Untitled project',
        title: project.title || 'Untitled project',
        description: project.description || 'No description',
        status: project.status || 'inactive',
        createdAt: project.createdAt || '',
        updatedAt: project.updatedAt || '',
        deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : '',
        progress: project.status === 'completed' ? 100 : project.status === 'in_progress' ? 65 : project.status === 'under_review' ? 90 : project.status === 'negotiating' ? 35 : project.status === 'assigned' ? 20 : 0,
        priority: project.priority || 'low',
        category: project.category || 'General',
        budget: project.budget ?? null,
        skills: Array.isArray(project.skills) ? project.skills : [],
        attachments: Array.isArray(project.attachments) ? project.attachments : [],
        submission: project.submission || null,
        review: project.review || null,
        interestedUsers: Array.isArray(project.interestedUsers) ? project.interestedUsers : [],
        isRated: Boolean(project.isRated),
        rateNegotiation: project.rateNegotiation || null,
        user: project.user || null,
        assignee: project.assignee || null,
        isLocked: Boolean(project.isLocked),
        lockReason: project.lockReason || '',
        lockDurationDays: project.lockDurationDays ?? null,
        lockExpiresAt: project.lockExpiresAt || null,
        lockedAt: project.lockedAt || null,
        team: [`${project.user?.firstName || ''} ${project.user?.lastName || ''}`.trim() || 'Owner', project.assignee ? `${project.assignee.firstName || ''} ${project.assignee.lastName || ''}`.trim() : null].filter(
          Boolean
        )
      }))

      setProjectsData(mapped)
      setOverallTotalCount(response.overallTotal || 0)
      setTotalFilteredCount(response.total || 0)
      setTotalPages(response.pages || 1)
      setSummaryCounts(response.summaryCounts || { total: 0, active: 0, in_progress: 0, under_review: 0, completed: 0, cancelled: 0 })
      setFilterOptions(response.filterOptions || { statuses: [], categories: [], priorities: [] })
    } catch (err) {
      console.error('Error fetching admin projects:', err)
      setError('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const openDeleteModal = (project) => {
    setProjectToDelete(project)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setProjectToDelete(null)
    setIsDeleteModalOpen(false)
  }

  const openEditModal = (project) => {
    setEditingProjectMeta({
      assignee: project.assignee || null,
      owner: project.user || null
    })
    setEditingProjectId(project.id)
    setEditForm({
      title: project.name || '',
      description: project.description || '',
      category: project.category || '',
      skills: Array.isArray(project.skills) ? project.skills.join(', ') : '',
      budget: project.budget ?? '',
      priority: project.priority || 'low',
      deadline: project.deadline || '',
      status: project.status || 'active'
    })
    setIsEditModalOpen(true)
  }

  const closeEditModal = () => {
    setEditingProjectId(null)
    setIsEditModalOpen(false)
    setRemoveAssigneeLoading(false)
    setEditingProjectMeta({
      assignee: null,
      owner: null
    })
  }

  const openDetailModal = (project) => {
    setProjectForDetails(project)
    setIsDetailModalOpen(true)
  }

  const closeDetailModal = () => {
    setProjectForDetails(null)
    setIsDetailModalOpen(false)
  }

  const openLockModal = (project) => {
    setProjectToLock(project)
    setIsLockModalOpen(true)
  }

  const closeLockModal = () => {
    setProjectToLock(null)
    setIsLockModalOpen(false)
  }

  const handleEditProject = async () => {
    if (!editingProjectId) return

    const title = (editForm.title || '').trim()
    const description = (editForm.description || '').trim()
    const category = (editForm.category || '').trim()
    const skills = String(editForm.skills || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)

    if (!title) {
      toast.warning('Project title is required')
      return
    }

    if (!description) {
      toast.warning('Project description is required')
      return
    }

    if (!category) {
      toast.warning('Project category is required')
      return
    }

    if (!editForm.deadline) {
      toast.warning('Project deadline is required')
      return
    }

    if (editForm.budget !== '' && Number(editForm.budget) < 0) {
      toast.error('Budget cannot be negative')
      return
    }

    try {
      setEditLoading(true)

      await updateProjectAsAdmin(editingProjectId, {
        title,
        description,
        category,
        skills,
        budget: editForm.budget === '' ? undefined : Number(editForm.budget),
        priority: editForm.priority,
        deadline: editForm.deadline,
        status: editForm.status
      })

      await fetchProjects()
      closeEditModal()
      toast.success('Project updated successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update project')
    } finally {
      setEditLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    if (!projectToDelete) return

    try {
      setDeleteLoading(true)
      await deleteProjectAsAdmin(projectToDelete.id)
      await fetchProjects()
      closeDeleteModal()
      toast.success('Project canceled by admin')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel project')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleToggleProjectLock = async (project) => {
    try {
      setLockLoadingProjectId(project.id)

      if (project.isLocked) {
        const response = await toggleProjectLockAsAdmin(project.id)
        await fetchProjects()
        toast.success(response?.message || 'Project unlocked successfully')
        return
      }

      openLockModal(project)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change project lock status')
    } finally {
      setLockLoadingProjectId(null)
    }
  }

  const handleConfirmLockProject = async ({ reason, durationDays }) => {
    if (!projectToLock) return

    try {
      setLockLoadingProjectId(projectToLock.id)
      const response = await toggleProjectLockAsAdmin(projectToLock.id, { reason, durationDays })
      await fetchProjects()
      closeLockModal()
      toast.success(response?.message || 'Project locked successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to lock project')
    } finally {
      setLockLoadingProjectId(null)
    }
  }

  const handleRemoveAssigneeFromEditModal = async () => {
    if (!editingProjectId) {
      toast.error('No project selected')
      return
    }

    if (!editingProjectMeta?.assignee) {
      toast.info('This project has no assignee to remove')
      return
    }

    const fullName = `${editingProjectMeta.assignee.firstName || ''} ${editingProjectMeta.assignee.lastName || ''}`.trim()
    const confirmed = window.confirm(`Remove assignee "${fullName || 'Unknown user'}" from this project?`)
    if (!confirmed) return

    try {
      setRemoveAssigneeLoading(true)
      const response = await removeAssigneeAsAdmin(editingProjectId)
      await fetchProjects()

      setEditingProjectMeta((prev) => ({ ...prev, assignee: null }))

      if (['assigned', 'in_progress', 'negotiating', 'under_review'].includes(editForm.status)) {
        setEditForm((prev) => ({ ...prev, status: 'active' }))
      }

      toast.success(response?.message || 'Assignee removed successfully')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove assignee')
    } finally {
      setRemoveAssigneeLoading(false)
    }
  }

  const clearFilters = () => {
    setSelectedStatus('All')
    setSelectedCategory('All')
    setPriority('All')
    setDateRange({ start: '', end: '' })
    setSearchQuery('')
    setSortBy('createdAt:desc')
    setCurrentPage(1)
  }

  const showingFrom = totalFilteredCount === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const showingTo = Math.min(currentPage * pageSize, totalFilteredCount)

  const summaryChips = [
    { key: 'total', label: 'Total', className: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' },
    { key: 'active', label: 'Active', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' },
    { key: 'in_progress', label: 'In Progress', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300' },
    { key: 'under_review', label: 'Under Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { key: 'completed', label: 'Completed', className: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { key: 'cancelled', label: 'Cancelled', className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  ]

  useEffect(() => {
    setCurrentPage(1)
  }, [selectedStatus, selectedCategory, selectedPriority, dateRange.start, dateRange.end, searchQuery, sortBy, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  useEffect(() => {
    fetchProjects()
  }, [currentPage, pageSize, selectedStatus, selectedCategory, selectedPriority, dateRange.start, dateRange.end, searchQuery, sortBy])

  return (
    <div>
      <div className='flex justify-between items-center mb-4'>
        <div className='flex flex-col'>
          <h2 className='text-xl font-semibold text-gray-900 dark:text-white'>Projects Overview</h2>
          <div className='mb-2 mt-4 flex flex-wrap gap-2'>
            {summaryChips.map((chip) => (
              <span key={chip.key} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${chip.className}`}>
                {chip.label}
                <span className='opacity-80'>{summaryCounts[chip.key]}</span>
              </span>
            ))}
          </div>
          <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
            Showing {showingFrom}-{showingTo} of {totalFilteredCount} {totalFilteredCount === 1 ? 'project' : 'projects'}
            {totalFilteredCount !== overallTotalCount && ` (${overallTotalCount} total)`}
          </div>
        </div>
        {canCreateProjects && (
          <button onClick={() => setIsNewProjectModalOpen(true)} className='flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90'>
            <FaPlus className='w-4 h-4' />
            New Project
          </button>
        )}
      </div>

      {canCreateProjects && <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setIsNewProjectModalOpen(false)} onProjectCreated={fetchProjects} mode='create' />}

      {/* Search and Filter Bar */}
      <div className='mb-6 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm'>
        <div className='flex gap-4'>
          <div className='flex-1 relative'>
            <input
              type='text'
              placeholder='Search projects...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by project status'>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === 'All' ? 'All Statuses' : formatProjectStatusLabel(status)}
              </option>
            ))}
          </select>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by category'>
            {categoryOptions.map((category) => (
              <option key={category} value={category}>
                {category === 'All' ? 'All Categories' : category}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setPriority(e.target.value)}
            className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Filter by priority'>
            {priorityOptions.map((priority) => (
              <option key={priority} value={priority}>
                {priority === 'All' ? 'All Priorities' : formatProjectPriorityLabel(priority)}
              </option>
            ))}
          </select>
          <div className='flex gap-2'>
            <input
              type='date'
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
            <input
              type='date'
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            />
          </div>
          <button onClick={clearFilters} className='flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'>
            <FaFilter className='w-4 h-4' />
            Clear Filters
          </button>
        </div>
      </div>

      {/* Sort + Pagination Controls */}
      <div className='flex flex-wrap justify-end items-center gap-3 mb-4'>
        <div className='flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300'>
          <span>Show</span>
          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className='px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'
            title='Projects per page'>
            <option value={30}>30</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
          </select>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className='px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent dark:bg-gray-700 dark:text-white'>
          <option value='createdAt:desc'>Created (Newest first)</option>
          <option value='createdAt:asc'>Created (Oldest first)</option>
          <option value='deadline:asc'>Deadline (Oldest first)</option>
          <option value='deadline:desc'>Deadline (Newest first)</option>
          <option value='progress:asc'>Progress (Low to High)</option>
          <option value='progress:desc'>Progress (High to Low)</option>
          <option value='priority:asc'>Priority (Low to High)</option>
          <option value='priority:desc'>Priority (High to Low)</option>
        </select>
      </div>

      {loading && <div className='mb-4 rounded-lg bg-white dark:bg-gray-800 p-4 text-sm text-gray-500 dark:text-gray-300'>Loading projects...</div>}
      {error && <div className='mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-300'>{error}</div>}
      {/* Projects Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {/* Project Card */}
        {projectsData.map((project) => {
          const isAdminCancelled = project.status === 'cancelled_by_admin'
          const isProjectLocked = Boolean(project.isLocked)

          return (
            <div key={project.id} className='bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-4 h-full flex flex-col'>
              <div className='flex justify-between items-start mb-4'>
                <h3 className='font-semibold text-gray-900 dark:text-white'>{project.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${getProjectStatusBadgeClass(project.status)}`}>{formatProjectStatusLabel(project.status)}</span>{' '}
              </div>

              <p className='text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-3'>{project.description?.length > 180 ? `${project.description.slice(0, 180)}...` : project.description}</p>

              <div className='mt-auto space-y-2'>
                <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                  <span>Deadline: {project.deadline}</span>
                  <span>Progress: {project.progress}%</span>
                </div>
                <ProgressBar progress={project.progress} />
                <div className='flex justify-between items-center text-sm text-gray-500 dark:text-gray-400'>
                  <span className={`px-2 py-1 text-xs rounded-full ${getProjectPriorityBadgeClass(project.priority)}`}>{formatProjectPriorityLabel(project.priority)} Priority</span>
                  <TeamAvatars team={project.team} />
                </div>
              </div>
              <div className='mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-end space-x-3'>
                <button onClick={() => openDetailModal(project)} title='Quick details' className='text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white'>
                  <FaEye className='w-4 h-4' />
                </button>

                {canUpdateProjects && (
                  <button
                    onClick={() => openEditModal(project)}
                    disabled={isAdminCancelled}
                    title={isAdminCancelled ? 'Project was canceled by admin. Editing is disabled.' : 'Edit project'}
                    className={`${isAdminCancelled ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200'}`}>
                    <FaEdit className='w-4 h-4' />
                  </button>
                )}

                {canLockProjects && (
                  <button
                    onClick={() => handleToggleProjectLock(project)}
                    disabled={isAdminCancelled || lockLoadingProjectId === project.id}
                    title={isAdminCancelled ? 'Project was canceled by admin. Status changes are disabled.' : isProjectLocked ? 'Unlock project' : 'Lock / Pause project'}
                    className={`${
                      isAdminCancelled || lockLoadingProjectId === project.id
                        ? 'text-gray-400 cursor-not-allowed'
                        : isProjectLocked
                          ? 'text-red-800 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400'
                          : 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-200'
                    }`}>
                    <FaLock className='w-4 h-4' />
                  </button>
                )}

                {canDeleteProjects && (
                  <button
                    onClick={() => openDeleteModal(project)}
                    disabled={isAdminCancelled}
                    title={isAdminCancelled ? 'Project already canceled by admin.' : 'Cancel project as admin'}
                    className={`${isAdminCancelled ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200'}`}>
                    <FaTrash className='w-4 h-4' />
                  </button>
                )}
              </div>
              {project.isLocked && (
                <div className='mt-4 rounded-md border border-red-200 dark:border-red-900/40 bg-red-50 dark:bg-red-900/20 p-3 text-xs text-red-700 dark:text-red-300'>
                  <div>
                    <span className='font-semibold'>Lock reason:</span> {project.lockReason || 'Not specified'}
                  </div>
                  <div>
                    <span className='font-semibold'>Unlocks:</span> {project.lockExpiresAt ? new Date(project.lockExpiresAt).toLocaleString() : 'No end date'}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {totalFilteredCount > 0 && (
        <PaginationControls currentPage={currentPage} totalPages={totalPages} onPrev={() => setCurrentPage((prev) => Math.max(1, prev - 1))} onNext={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))} />
      )}
      <AdminProjectDetailModal isOpen={isDetailModalOpen} onClose={closeDetailModal} project={projectForDetails} />
      <AdminProjectEditModal
        isOpen={isEditModalOpen}
        onClose={closeEditModal}
        onSave={handleEditProject}
        loading={editLoading}
        form={editForm}
        setForm={setEditForm}
        assigneeName={editingProjectMeta?.assignee ? `${editingProjectMeta.assignee.firstName || ''} ${editingProjectMeta.assignee.lastName || ''}`.trim() : ''}
        ownerName={editingProjectMeta?.owner ? `${editingProjectMeta.owner.firstName || ''} ${editingProjectMeta.owner.lastName || ''}`.trim() : ''}
        canRemoveAssignee={Boolean(editingProjectMeta?.assignee)}
        onRemoveAssignee={handleRemoveAssigneeFromEditModal}
        removeAssigneeLoading={removeAssigneeLoading}
      />
      <AdminProjectCancelModal isOpen={isDeleteModalOpen} onClose={closeDeleteModal} onConfirm={handleDeleteProject} projectName={projectToDelete?.name} loading={deleteLoading} />
      <AdminLockProjectModal isOpen={isLockModalOpen} onClose={closeLockModal} onConfirm={handleConfirmLockProject} project={projectToLock} loading={lockLoadingProjectId === projectToLock?.id} />
    </div>
  )
}

export default AdminProjectsList
