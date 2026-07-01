import Project from '../models/Project.js'
import User from '../models/User.js'
import { buildFieldChanges, logAdminAction } from '../utils/adminActionLogger.js'
import { sendProjectAssignedEmail, sendProjectSubmittedEmail, sendProjectReviewDecisionEmail } from '../utils/activityEmailService.js'
import { notifyProjectAssigned, notifyProjectSubmitted, notifyProjectReviewed } from '../utils/notificationService.js'
import { populateAvailabilityOnProjectAssignment, removeProjectFromAvailability } from '../utils/availabilityCalendarService.js'
import { completeProjectPhase } from '../utils/projectPhaseService.js'

const isImmutableProjectStatus = (status) => ['cancelled_by_admin', 'deleted_by_owner'].includes(status)

const ADMIN_AUDITABLE_PROJECT_FIELDS = ['title', 'description', 'category', 'skills', 'budget', 'priority', 'deadline', 'status', 'projectBrief', 'isLocked', 'lockReason', 'lockDurationDays', 'lockedAt', 'lockExpiresAt']
const ADMIN_EDITABLE_PROJECT_FIELDS = ['title', 'description', 'category', 'skills', 'budget', 'priority', 'deadline', 'status', 'projectBrief']
const ALLOWED_PROJECT_PRIORITIES = ['low', 'medium', 'high']
const ALLOWED_PROJECT_STATUSES = ['draft', 'active', 'assigned', 'negotiating', 'in_progress', 'under_review', 'completed', 'cancelled', 'inactive', 'archived', 'paused']

const PROJECT_BRIEF_EXPERIENCE_LEVELS = ['not_specified', 'junior', 'mid', 'senior', 'expert']
const PROJECT_BRIEF_DURATIONS = ['not_specified', 'less_than_1_week', '1_to_2_weeks', '2_to_4_weeks', '1_to_3_months', '3_plus_months', 'ongoing']
const PROJECT_BRIEF_WORKLOADS = ['not_specified', 'under_10_hours', '10_to_20_hours', '20_to_30_hours', '30_plus_hours', 'full_time']
const PROJECT_BRIEF_START_PREFERENCES = ['not_specified', 'immediately', 'this_week', 'within_2_weeks', 'flexible']
const PROJECT_BRIEF_BUDGET_TYPES = ['not_specified', 'fixed', 'hourly', 'negotiable']

const ALLOWED_ADMIN_STATUS_TRANSITIONS = {
  draft: ['active', 'inactive', 'archived', 'paused', 'cancelled'],
  active: ['assigned', 'negotiating', 'in_progress', 'under_review', 'inactive', 'archived', 'paused', 'cancelled'],
  assigned: ['negotiating', 'in_progress', 'active', 'paused', 'cancelled'],
  negotiating: ['assigned', 'in_progress', 'active', 'paused', 'cancelled'],
  in_progress: ['under_review', 'active', 'paused', 'cancelled'],
  under_review: ['in_progress', 'completed', 'active', 'paused', 'cancelled'],
  completed: ['archived'],
  cancelled: ['active', 'archived'],
  inactive: ['active', 'archived'],
  archived: [],
  paused: ['active', 'assigned', 'negotiating', 'in_progress', 'under_review']
}

const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean)
  }

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value)

      if (Array.isArray(parsedValue)) {
        return parsedValue.map((item) => String(item).trim()).filter(Boolean)
      }
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }

    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const normalizeRateNegotiation = (value) => {
  if (!value) return undefined

  if (typeof value === 'string') {
    try {
      const parsedValue = JSON.parse(value)
      return parsedValue && typeof parsedValue === 'object' ? parsedValue : undefined
    } catch {
      return undefined
    }
  }

  return typeof value === 'object' ? value : undefined
}

const normalizeOptionalText = (value) => {
  if (value === undefined || value === null) return ''
  return String(value).trim()
}

const normalizeEnumValue = (value, allowedValues, fallback = 'not_specified') => {
  if (value === undefined || value === null || value === '') {
    return fallback
  }

  const normalizedValue = String(value).trim()
  return allowedValues.includes(normalizedValue) ? normalizedValue : fallback
}

const normalizeProjectBrief = (value) => {
  let parsedValue = value

  if (typeof value === 'string') {
    try {
      parsedValue = JSON.parse(value)
    } catch {
      parsedValue = null
    }
  }

  const brief = parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue) ? parsedValue : {}

  return {
    objective: normalizeOptionalText(brief.objective),
    deliverables: normalizeStringArray(brief.deliverables),
    scopeNotes: normalizeOptionalText(brief.scopeNotes),
    experienceLevel: normalizeEnumValue(brief.experienceLevel, PROJECT_BRIEF_EXPERIENCE_LEVELS),
    duration: normalizeEnumValue(brief.duration, PROJECT_BRIEF_DURATIONS),
    workload: normalizeEnumValue(brief.workload, PROJECT_BRIEF_WORKLOADS),
    startPreference: normalizeEnumValue(brief.startPreference, PROJECT_BRIEF_START_PREFERENCES),
    budgetType: normalizeEnumValue(brief.budgetType, PROJECT_BRIEF_BUDGET_TYPES),
    applicationInstructions: normalizeOptionalText(brief.applicationInstructions)
  }
}

const validateAdminProjectUpdatePayload = (payload) => {
  const providedFields = Object.keys(payload || {})
  const invalidFields = providedFields.filter((field) => !ADMIN_EDITABLE_PROJECT_FIELDS.includes(field))

  if (invalidFields.length > 0) {
    return { valid: false, message: `Unsupported fields: ${invalidFields.join(', ')}` }
  }

  if (payload.priority !== undefined && !ALLOWED_PROJECT_PRIORITIES.includes(payload.priority)) {
    return { valid: false, message: 'Invalid priority value' }
  }

  if (payload.status !== undefined && !ALLOWED_PROJECT_STATUSES.includes(payload.status)) {
    return { valid: false, message: 'Invalid status value' }
  }

  if (payload.deadline !== undefined) {
    const parsedDeadline = new Date(payload.deadline)
    if (Number.isNaN(parsedDeadline.getTime())) {
      return { valid: false, message: 'Invalid deadline value' }
    }
  }

  if (payload.budget !== undefined && payload.budget !== '' && payload.budget !== null) {
    const parsedBudget = Number(payload.budget)
    if (Number.isNaN(parsedBudget) || parsedBudget < 0) {
      return { valid: false, message: 'Budget must be a valid non-negative number' }
    }
  }

  if (payload.skills !== undefined) {
    const normalizedSkills = Array.isArray(payload.skills)
      ? payload.skills.map((s) => String(s).trim()).filter(Boolean)
      : String(payload.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)

    if (normalizedSkills.length === 0) {
      return { valid: false, message: 'At least one skill is required' }
    }
  }

  return { valid: true }
}

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot create projects.' })
    }

    console.log('Creating project with data:', req.body)
    console.log('Files received:', req.files)

    const { title, description, category, skills, budget, priority, deadline, status, assigneeId, rateNegotiation, projectBrief } = req.body

    const normalizedSkills = normalizeStringArray(skills)
    const normalizedRateNegotiation = normalizeRateNegotiation(rateNegotiation)
    const normalizedProjectBrief = normalizeProjectBrief(projectBrief)

    const attachments = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }))
      : []

    let normalizedStatus = status || 'draft'

    if (assigneeId && !status) {
      normalizedStatus = normalizedRateNegotiation?.status === 'proposed' ? 'negotiating' : 'assigned'
    }

    if (assigneeId && assigneeId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot assign project to yourself' })
    }

    let processedRateNegotiation = normalizedRateNegotiation
    if (normalizedRateNegotiation) {
      processedRateNegotiation = {
        ...normalizedRateNegotiation,
        currentOffer: normalizedRateNegotiation.currentOffer
          ? {
              ...normalizedRateNegotiation.currentOffer,
              proposedBy: req.user._id
            }
          : undefined,
        history:
          normalizedRateNegotiation.history?.map((offer) => ({
            ...offer,
            proposedBy: req.user._id
          })) || []
      }
    }

    const shouldSetBudget = !normalizedRateNegotiation || normalizedRateNegotiation.status !== 'proposed'
    const finalBudget = shouldSetBudget ? Number(budget) : undefined

    console.log('=== CREATE PROJECT DEBUG ===')
    console.log('RateNegotiation status:', normalizedRateNegotiation?.status)
    console.log('Should set budget:', shouldSetBudget)
    console.log('Final budget value:', finalBudget)
    console.log('Original budget from request:', budget)

    const project = new Project({
      user: req.user._id,
      assignee: assigneeId || null,
      title,
      description,
      category,
      skills: normalizedSkills,
      budget: finalBudget,
      priority: priority || 'low',
      deadline,
      status: normalizedStatus,
      projectBrief: normalizedProjectBrief,
      attachments,
      rateNegotiation: processedRateNegotiation || undefined
    })

    console.log('Saving project to database:', project)

    const createdProject = await project.save()
    console.log('Project saved successfully:', createdProject)

    if (assigneeId) {
      // Auto-populate availability calendar
      await populateAvailabilityOnProjectAssignment(assigneeId, createdProject)

      await sendProjectAssignedEmail({
        recipientId: assigneeId,
        ownerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
        projectId: createdProject._id.toString(),
        projectTitle: createdProject.title
      })
    }

    if (assigneeId) {
      await notifyProjectAssigned({
        actor: req.user._id,
        recipient: assigneeId,
        projectId: createdProject._id.toString(),
        projectTitle: createdProject.title,
        actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client'
      })
    }

    res.status(201).json(createdProject)
  } catch (error) {
    console.error('Error creating project:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Publish a draft project
// @route   PUT /api/projects/:id/publish
// @access  Private (owner only)
const publishProject = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot publish projects.' })
    }

    if (!req.user.isEmailVerified) {
      return res.status(403).json({ message: 'Verify your email before publishing projects.' })
    }

    const projectId = req.params.id
    const project = await Project.findById(projectId)

    if (!project) return res.status(404).json({ message: 'Project not found' })
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be published' })
    }

    project.status = 'active'
    const updated = await project.save()
    res.json(updated)
  } catch (error) {
    console.error('Error publishing project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all active projects (for listings page)
// @route   GET /api/projects/all
// @access  Public
const getAllProjects = async (req, res) => {
  try {
    // Show only active projects in listings
    const projects = await Project.find({ status: 'active' }).populate('user', 'firstName lastName email profilePicture isEmailVerified').sort({ createdAt: -1 })

    res.json(projects)
  } catch (error) {
    console.error('Error fetching all projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all projects for admin (all statuses)
// @route   GET /api/projects/admin/all
// @access  Admin
const getAdminAllProjects = async (req, res) => {
  try {
    const { search = '', status = '', category = '', priority = '', startDate = '', endDate = '', stalled = '', page = 1, limit = 30, sort = 'createdAt:desc' } = req.query

    const pageNumber = Math.max(Number(page) || 1, 1)
    const pageSize = Math.min(Math.max(Number(limit) || 30, 1), 200)

    const query = {}
    const activeStatuses = ['active', 'assigned', 'negotiating', 'in_progress', 'under_review']

    if (status) query.status = status
    if (category) query.category = category
    if (priority) query.priority = priority

    if (startDate || endDate) {
      query.deadline = {}
      if (startDate) query.deadline.$gte = new Date(startDate)
      if (endDate) query.deadline.$lte = new Date(endDate)
    }

    if (stalled === 'true') {
      if (!status) {
        query.status = { $in: activeStatuses }
      }

      query.updatedAt = { $lt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
    }

    if (search) {
      const regex = new RegExp(search, 'i')
      query.$or = [{ title: regex }, { description: regex }, { category: regex }]
    }

    const [sortField, sortDirection] = String(sort).split(':')
    const direction = sortDirection === 'asc' ? 1 : -1

    const sortMap = {
      createdAt: { createdAt: direction },
      deadline: { deadline: direction },
      progress: { status: direction },
      priority: { priority: direction }
    }

    const sortConfig = sortMap[sortField] || { createdAt: -1 }

    // Keep counts and list consistent by unlocking all expired project locks first.
    const expiredLockedProjects = await Project.find({
      isLocked: true,
      lockExpiresAt: { $lt: new Date() }
    })

    await Promise.all(expiredLockedProjects.map((project) => project.ensureUnlockedIfExpired()))

    const [projects, filteredTotal, overallTotal, statuses, categories, priorities, summaryRaw] = await Promise.all([
      Project.find(query)
        .populate('user', 'firstName lastName email profilePicture')
        .populate('assignee', 'firstName lastName email profilePicture')
        .sort(sortConfig)
        .skip((pageNumber - 1) * pageSize)
        .limit(pageSize),
      Project.countDocuments(query),
      Project.countDocuments({}),
      Project.distinct('status'),
      Project.distinct('category'),
      Project.distinct('priority'),
      Project.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
            under_review: { $sum: { $cond: [{ $eq: ['$status', 'under_review'] }, 1, 0] } },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            cancelled: {
              $sum: {
                $cond: [{ $in: ['$status', ['cancelled', 'cancelled_by_admin']] }, 1, 0]
              }
            }
          }
        }
      ])
    ])

    const pages = Math.max(Math.ceil(filteredTotal / pageSize), 1)
    const summaryCounts = summaryRaw[0] || {
      total: 0,
      active: 0,
      in_progress: 0,
      under_review: 0,
      completed: 0,
      cancelled: 0
    }

    res.json({
      projects,
      page: pageNumber,
      pages,
      limit: pageSize,
      total: filteredTotal,
      overallTotal,
      summaryCounts,
      filterOptions: {
        statuses: statuses.filter(Boolean).sort((a, b) => a.localeCompare(b)),
        categories: categories.filter(Boolean).sort((a, b) => a.localeCompare(b)),
        priorities: priorities.filter(Boolean).sort((a, b) => a.localeCompare(b))
      }
    })
  } catch (error) {
    console.error('Error fetching admin projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Cancel project as admin (soft-delete)
// @route   DELETE /api/projects/admin/:id
// @access  Admin
const deleteProjectAsAdmin = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    const targetLabel = project.title || 'Untitled project'
    const beforeSnapshot = {
      status: project.status
    }

    project.status = 'cancelled_by_admin'
    await project.save()

    await logAdminAction({
      req,
      action: 'project.cancelled',
      targetType: 'project',
      targetId: project._id,
      targetLabel,
      summary: `Cancelled project ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, project.toObject(), ['status']),
      metadata: {
        previousStatus: beforeSnapshot.status,
        newStatus: project.status,
        reason: 'cancelled_by_admin'
      }
    })

    res.json({ message: 'Project cancelled by admin', status: project.status })
  } catch (error) {
    console.error('Error cancelling project as admin:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update project as admin
// @route   PUT /api/projects/admin/:id
// @access  Admin
const updateProjectAsAdmin = async (req, res) => {
  try {
    const payload = req.body || {}
    const { title, description, category, skills, budget, priority, deadline, status, projectBrief } = payload

    const validation = validateAdminProjectUpdatePayload(payload)
    if (!validation.valid) {
      return res.status(400).json({ message: validation.message })
    }

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await project.ensureUnlockedIfExpired()

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be edited' })
    }

    if (status !== undefined && !['cancelled_by_admin', 'deleted_by_owner'].includes(status)) {
      const currentStatus = project.status
      const allowedNextStatuses = ALLOWED_ADMIN_STATUS_TRANSITIONS[currentStatus] || []
      if (status !== currentStatus && !allowedNextStatuses.includes(status)) {
        return res.status(400).json({
          message: `Status transition not allowed: ${currentStatus} -> ${status}`
        })
      }
    }

    const beforeSnapshot = ADMIN_AUDITABLE_PROJECT_FIELDS.reduce((snapshot, field) => {
      snapshot[field] = project[field]
      return snapshot
    }, {})

    if (title !== undefined) project.title = String(title).trim()
    if (description !== undefined) project.description = String(description).trim()
    if (category !== undefined) project.category = String(category).trim()

    if (skills !== undefined) {
      project.skills = Array.isArray(skills)
        ? skills.map((s) => String(s).trim()).filter(Boolean)
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    }

    if (budget !== undefined) {
      if (budget === '' || budget === null) {
        project.budget = undefined
      } else {
        project.budget = Number(budget)
      }
    }

    if (priority !== undefined) project.priority = priority
    if (deadline !== undefined) project.deadline = deadline
    if (projectBrief !== undefined) project.projectBrief = normalizeProjectBrief(projectBrief)

    if (status !== undefined && !['cancelled_by_admin', 'deleted_by_owner'].includes(status)) {
      project.status = status
    }

    const updatedProject = await project.save()
    const changedFields = ADMIN_AUDITABLE_PROJECT_FIELDS.filter((field) => JSON.stringify(beforeSnapshot[field] ?? null) !== JSON.stringify(updatedProject.toObject()[field] ?? null))

    await logAdminAction({
      req,
      action: 'project.updated',
      targetType: 'project',
      targetId: updatedProject._id,
      targetLabel: updatedProject.title || 'Untitled project',
      summary: `Updated project ${updatedProject.title || 'Untitled project'}`,
      changes: buildFieldChanges(beforeSnapshot, updatedProject.toObject(), changedFields),
      metadata: {
        updatedFields: changedFields,
        previousStatus: beforeSnapshot.status,
        newStatus: updatedProject.status
      }
    })

    res.json(updatedProject)
  } catch (error) {
    console.error('Error updating project as admin:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Renew deadlines for multiple projects as admin
// @route   PATCH /api/projects/admin/deadlines/bulk
// @access  Admin
const bulkRenewProjectDeadlinesAsAdmin = async (req, res) => {
  try {
    const { projectIds = [], deadline } = req.body || {}

    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'At least one project must be selected' })
    }

    const normalizedIds = [...new Set(projectIds.map((id) => String(id || '').trim()).filter(Boolean))]

    if (normalizedIds.length === 0) {
      return res.status(400).json({ message: 'At least one valid project ID is required' })
    }

    const parsedDeadline = new Date(deadline)

    if (!deadline || Number.isNaN(parsedDeadline.getTime())) {
      return res.status(400).json({ message: 'A valid renewal deadline is required' })
    }

    if (parsedDeadline <= new Date()) {
      return res.status(400).json({ message: 'Renewal deadline must be in the future' })
    }

    const projects = await Project.find({ _id: { $in: normalizedIds } })

    if (projects.length !== normalizedIds.length) {
      const foundIds = new Set(projects.map((project) => project._id.toString()))
      const missingIds = normalizedIds.filter((id) => !foundIds.has(id))

      return res.status(404).json({
        message: `Some projects were not found: ${missingIds.join(', ')}`
      })
    }

    await Promise.all(projects.map((project) => project.ensureUnlockedIfExpired()))

    const ineligibleProjects = projects.filter((project) => isImmutableProjectStatus(project.status) || ['completed', 'archived', 'cancelled'].includes(project.status) || project.isLocked)

    if (ineligibleProjects.length > 0) {
      return res.status(400).json({
        message: `Some selected projects cannot be renewed: ${ineligibleProjects.map((project) => project.title || project._id.toString()).join(', ')}`
      })
    }

    const updatedProjects = []

    for (const project of projects) {
      const beforeSnapshot = {
        deadline: project.deadline,
        status: project.status
      }

      project.deadline = parsedDeadline
      await project.save()

      await logAdminAction({
        req,
        action: 'project.deadline.renewed',
        targetType: 'project',
        targetId: project._id,
        targetLabel: project.title || 'Untitled project',
        summary: `Renewed project deadline for ${project.title || 'Untitled project'}`,
        changes: buildFieldChanges(beforeSnapshot, project.toObject(), ['deadline']),
        metadata: {
          previousDeadline: beforeSnapshot.deadline,
          newDeadline: project.deadline,
          bulkOperation: normalizedIds.length > 1,
          selectionSize: normalizedIds.length
        }
      })

      updatedProjects.push(project)
    }

    res.json({
      message: `${updatedProjects.length} project deadlines renewed successfully`,
      count: updatedProjects.length,
      deadline: parsedDeadline,
      projectIds: updatedProjects.map((project) => project._id)
    })
  } catch (error) {
    console.error('Error renewing project deadlines as admin:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const query = {
      $or: [
        {
          user: req.user._id,
          status: { $ne: 'deleted_by_owner' }
        },
        {
          assignee: req.user._id,
          status: { $nin: ['draft', 'deleted_by_owner'] }
        }
      ]
    }

    const projects = await Project.find(query)
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })

    await Promise.all(projects.map((project) => project.ensureUnlockedIfExpired()))

    const refreshedProjects = await Project.find(query)
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })

    res.json(refreshedProjects)
  } catch (error) {
    console.error('Error fetching user projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Toggle project lock status as admin (pause/unpause) with reason + duration
// @route   PATCH /api/projects/admin/:id/lock
// @access  Admin
const toggleProjectLockAsAdmin = async (req, res) => {
  try {
    const { reason = '', durationDays = 14 } = req.body || {}

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    if (['completed', 'archived', 'cancelled'].includes(project.status)) {
      return res.status(400).json({ message: 'Finalized project status cannot be lock-toggled' })
    }

    const targetLabel = project.title || 'Untitled project'
    const beforeSnapshot = {
      isLocked: project.isLocked,
      status: project.status,
      lockReason: project.lockReason,
      lockDurationDays: project.lockDurationDays,
      lockedAt: project.lockedAt,
      lockExpiresAt: project.lockExpiresAt
    }

    if (project.isLocked) {
      project.isLocked = false
      project.lockReason = ''
      project.lockDurationDays = null
      project.lockedAt = null
      project.lockExpiresAt = null

      if (project.status === 'paused') {
        project.status = 'active'
      }

      await project.save()

      await logAdminAction({
        req,
        action: 'project.unlocked',
        targetType: 'project',
        targetId: project._id,
        targetLabel,
        summary: `Unlocked project ${targetLabel}`,
        changes: buildFieldChanges(beforeSnapshot, project.toObject(), ['isLocked', 'status', 'lockReason', 'lockDurationDays', 'lockedAt', 'lockExpiresAt']),
        metadata: {
          previousStatus: beforeSnapshot.status,
          newStatus: project.status
        }
      })

      return res.json({
        message: 'Project unlocked successfully',
        isLocked: false,
        status: project.status
      })
    }

    if (!reason.trim()) {
      return res.status(400).json({ message: 'Lock reason is required' })
    }

    const days = Number(durationDays) || 0
    if (days < 0) {
      return res.status(400).json({ message: 'Lock duration must be 0 or greater' })
    }

    const now = new Date()
    const expiresAt = days > 0 ? new Date(now.getTime() + days * 24 * 60 * 60 * 1000) : null

    project.isLocked = true
    project.lockReason = reason.trim()
    project.lockDurationDays = days > 0 ? days : null
    project.lockedAt = now
    project.lockExpiresAt = expiresAt
    project.status = 'paused'

    await project.save()

    await logAdminAction({
      req,
      action: 'project.locked',
      targetType: 'project',
      targetId: project._id,
      targetLabel,
      summary: `Locked project ${targetLabel}`,
      changes: buildFieldChanges(beforeSnapshot, project.toObject(), ['isLocked', 'status', 'lockReason', 'lockDurationDays', 'lockedAt', 'lockExpiresAt']),
      metadata: {
        previousStatus: beforeSnapshot.status,
        newStatus: project.status,
        reason: project.lockReason,
        durationDays: project.lockDurationDays
      }
    })

    res.json({
      message: 'Project locked successfully',
      isLocked: true,
      status: project.status,
      lockReason: project.lockReason,
      lockDurationDays: project.lockDurationDays,
      lockExpiresAt: project.lockExpiresAt
    })
  } catch (error) {
    console.error('Error toggling project lock as admin:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Remove assignee from project as admin (owner remains unchanged)
// @route   DELETE /api/projects/admin/:id/assignee
// @access  Admin
const removeAssigneeAsAdmin = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    if (!project.assignee) {
      return res.status(400).json({ message: 'Project has no assigned user' })
    }

    const previousAssigneeId = project.assignee

    // Remove assignee only (owner is never touched)
    project.assignee = null

    // Reopen workflow statuses when assignee is removed
    if (['assigned', 'in_progress', 'negotiating', 'under_review'].includes(project.status)) {
      project.status = 'active'
    }

    const updatedProject = await project.save()

    // Remove from availability calendar
    await removeProjectFromAvailability(previousAssigneeId, req.params.id)

    res.json({
      message: 'Assignee removed successfully',
      project: updatedProject
    })
  } catch (error) {
    console.error('Error removing assignee as admin:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

const PROJECT_DETAIL_USER_FIELDS = 'firstName lastName email profilePicture isEmailVerified headline'

// @desc    Get project by ID (PUBLIC - only active)
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', PROJECT_DETAIL_USER_FIELDS).populate('assignee', PROJECT_DETAIL_USER_FIELDS)

    if (!project) {
      console.log(`[GET PROJECT] Project ${req.params.id} not found in DB`)
      return res.status(404).json({ message: 'Project not found' })
    }

    await project.ensureUnlockedIfExpired()

    console.log(`[GET PROJECT] Found project ${req.params.id}`)
    console.log(`[GET PROJECT] Project status: ${project.status}`)
    console.log(`[GET PROJECT] Project owner: ${project.user?._id || project.user}`)
    console.log(`[GET PROJECT] Project assignee: ${project.assignee?._id || project.assignee}`)
    console.log(`[GET PROJECT] Current user from req.user: ${req.user?._id}`)

    if (project.status === 'deleted_by_owner') {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Public can see only active
    if (project.status === 'active') {
      console.log(`[GET PROJECT] Project is active, returning to any user`)
      return res.json(project)
    }

    // If not active, only owner or assignee can see
    const currentUserId = req.user?._id?.toString()
    const ownerId = project.user?._id ? project.user._id.toString() : project.user.toString()
    const assigneeId = project.assignee?._id ? project.assignee._id.toString() : project.assignee?.toString()

    console.log(`[GET PROJECT] Non-active project - checking permissions`)
    console.log(`  currentUserId: ${currentUserId}`)
    console.log(`  ownerId: ${ownerId}`)
    console.log(`  assigneeId: ${assigneeId}`)
    console.log(`  isOwner: ${currentUserId === ownerId}`)
    console.log(`  isAssignee: ${currentUserId === assigneeId}`)

    if (currentUserId && (currentUserId === ownerId || currentUserId === assigneeId)) {
      console.log(`[GET PROJECT] User has permission, returning project`)
      return res.json(project)
    }

    console.log(`[GET PROJECT] User does not have permission to access this project`)
    return res.status(404).json({ message: 'Project not found' })
  } catch (error) {
    console.error('Error fetching project:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get project by ID (OWNER ONLY - includes drafts)
// @route   GET /api/projects/:id/owner
// @access  Private (creator only)
const getProjectByIdOwner = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', PROJECT_DETAIL_USER_FIELDS).populate('assignee', PROJECT_DETAIL_USER_FIELDS)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await project.ensureUnlockedIfExpired()

    if (project.status === 'deleted_by_owner') {
      return res.status(404).json({ message: 'Project not found' })
    }

    // ✅ Only owner can access draft/private version
    const projectUserId = project.user._id ? project.user._id.toString() : project.user.toString()
    if (projectUserId !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    res.json(project)
  } catch (error) {
    console.error('Error fetching project (owner):', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Update a project
// @route   PUT /api/projects/:id
// @access  Private
const updateProject = async (req, res) => {
  try {
    const { title, description, category, skills, budget, priority, deadline, projectBrief } = req.body

    let project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    await project.ensureUnlockedIfExpired()

    // Check if the project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    // Prevent any edits if project was cancelled by admin
    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and can no longer be edited' })
    }

    const isDraft = project.status === 'draft'

    // If not draft, only allow extending deadline
    if (!isDraft) {
      const hasOtherUpdates = title || description || category || skills || budget || priority || projectBrief || (req.files && req.files.length > 0)

      if (hasOtherUpdates) {
        return res.status(400).json({ message: 'Only deadline extension is allowed after publish' })
      }

      if (deadline) {
        const newDeadline = new Date(deadline)
        const currentDeadline = new Date(project.deadline)

        if (isNaN(newDeadline)) {
          return res.status(400).json({ message: 'Invalid deadline' })
        }

        if (newDeadline <= currentDeadline) {
          return res.status(400).json({ message: 'Deadline can only be extended' })
        }

        project.deadline = deadline
        const updatedProject = await project.save()
        return res.json(updatedProject)
      }

      // No valid changes
      return res.status(400).json({ message: 'No valid updates provided' })
    }

    // Process new attachments if any
    const newAttachments = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }))
      : []

    // Update project fields
    project.title = title || project.title
    project.description = description || project.description
    project.category = category || project.category
    project.skills = skills !== undefined ? normalizeStringArray(skills) : project.skills
    project.budget = budget || project.budget
    project.priority = priority || project.priority
    project.deadline = deadline || project.deadline
    if (projectBrief !== undefined) project.projectBrief = normalizeProjectBrief(projectBrief)
    project.attachments = [...project.attachments, ...newAttachments]

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Delete a project
// @route   DELETE /api/projects/:id
// @access  Private
const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if the project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    if (project.status === 'deleted_by_owner') {
      return res.status(400).json({ message: 'Project already deleted from your profile' })
    }

    project.status = 'deleted_by_owner'
    await project.save()

    res.json({ message: 'Project removed from your profile', status: project.status })
  } catch (error) {
    console.error('Error deleting project:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Shortlist or unshortlist a project applicant
// @route   PATCH /api/projects/:id/applicants/:userId/shortlist
// @access  Private (project creator only)
const toggleApplicantShortlist = async (req, res) => {
  try {
    const projectId = req.params.id
    const applicantId = req.params.userId
    const { isShortlisted } = req.body

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage applicants for this project' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    const applicant = project.interestedUsers.find((entry) => entry.userId.toString() === applicantId)

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found for this project' })
    }

    applicant.isShortlisted = Boolean(isShortlisted)

    await project.save()

    const populatedProject = await Project.findById(projectId)
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')

    res.json(populatedProject)
  } catch (error) {
    console.error('Error updating applicant shortlist state:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Toggle skills verification for an applicant
// @route   PATCH /api/projects/:id/applicants/:userId/verify-skills
// @access  Private (project creator only)
const toggleApplicantSkillsVerified = async (req, res) => {
  try {
    const projectId = req.params.id
    const applicantId = req.params.userId
    const { skillsVerified } = req.body

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to manage applicants for this project' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    const applicant = project.interestedUsers.find((entry) => entry.userId.toString() === applicantId)

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found for this project' })
    }

    applicant.skillsVerified = Boolean(skillsVerified)

    await project.save()

    const populatedProject = await Project.findById(projectId)
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')

    res.json(populatedProject)
  } catch (error) {
    console.error('Error updating applicant skills verification state:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Assign a user to a project
// @route   POST /api/projects/:id/assign
// @access  Private (project creator only)
const assignUserToProject = async (req, res) => {
  try {
    const { userId } = req.body
    const projectId = req.params.id

    // Verify project exists and user is creator
    let project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to assign this project' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    // Prevent owner from assigning project to themselves
    if (project.user.toString() === userId) {
      return res.status(400).json({ message: 'Cannot assign project to yourself' })
    }

    // Verify assignee is in interestedUsers
    const isInterested = project.interestedUsers.some((u) => u.userId.toString() === userId)
    if (!isInterested) {
      return res.status(400).json({ message: 'User has not contacted this project' })
    }

    // Assign the user
    project.assignee = userId
    project.status = 'in_progress'

    const updatedProject = await project.save()

    // Auto-populate availability calendar
    await populateAvailabilityOnProjectAssignment(userId, updatedProject)

    const populatedProject = await Project.findById(projectId).populate('assignee', 'firstName lastName email profilePicture')

    await sendProjectAssignedEmail({
      recipientId: userId,
      ownerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
      projectId: populatedProject._id.toString(),
      projectTitle: populatedProject.title
    })

    await notifyProjectAssigned({
      actor: req.user._id,
      recipient: userId,
      projectId: populatedProject._id.toString(),
      projectTitle: populatedProject.title,
      actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client'
    })

    res.json(populatedProject)
  } catch (error) {
    console.error('Error assigning user to project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Reassign project to different user
// @route   PUT /api/projects/:id/reassign
// @access  Private (project creator only)
const reassignProject = async (req, res) => {
  try {
    const { userId } = req.body
    const projectId = req.params.id

    let project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    // Verify new assignee is in interestedUsers
    const isInterested = project.interestedUsers.some((u) => u.userId.toString() === userId)
    if (!isInterested) {
      return res.status(400).json({ message: 'User has not contacted this project' })
    }

    const previousAssigneeId = project.assignee
    project.assignee = userId

    const updatedProject = await project.save()

    // Update availability calendars for reassignment
    if (previousAssigneeId) {
      await removeProjectFromAvailability(previousAssigneeId, projectId)
    }
    await populateAvailabilityOnProjectAssignment(userId, updatedProject)

    const populatedProject = await Project.findById(projectId).populate('assignee', 'firstName lastName email profilePicture')

    await sendProjectAssignedEmail({
      recipientId: userId,
      ownerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
      projectId: populatedProject._id.toString(),
      projectTitle: populatedProject.title,
      isReassignment: true
    })

    await notifyProjectAssigned({
      actor: req.user._id,
      recipient: userId,
      projectId: populatedProject._id.toString(),
      projectTitle: populatedProject.title,
      actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
      isReassignment: true
    })

    res.json(populatedProject)
  } catch (error) {
    console.error('Error reassigning project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Remove assignee from project (reopen for new assignments)
// @route   DELETE /api/projects/:id/assignee
// @access  Private (project creator only)
const removeAssignee = async (req, res) => {
  try {
    const projectId = req.params.id

    let project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    const previousAssigneeId = project.assignee
    project.assignee = null

    const updatedProject = await project.save()

    // Remove from availability calendar if there was an assignee
    if (previousAssigneeId) {
      await removeProjectFromAvailability(previousAssigneeId, projectId)
    }

    res.json(updatedProject)
  } catch (error) {
    console.error('Error removing assignee:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Propose project rate (owner only)
// @route   POST /api/projects/:id/rate/propose
// @access  Private
const proposeRate = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot propose rates.' })
    }
    const projectId = req.params.id
    const { amount, type } = req.body

    const project = await Project.findById(projectId)

    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to propose rate' })
    }
    if (!project.assignee) {
      return res.status(400).json({ message: 'Project has no assignee yet' })
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    project.rateNegotiation = project.rateNegotiation || {}
    project.rateNegotiation.status = 'proposed'
    project.rateNegotiation.currentOffer = {
      amount: Number(amount),
      type: type || 'hourly',
      proposedBy: req.user._id,
      proposedAt: new Date()
    }
    project.rateNegotiation.history = project.rateNegotiation.history || []
    project.rateNegotiation.history.push(project.rateNegotiation.currentOffer)

    project.status = 'negotiating'

    const updated = await project.save()
    res.json(updated)
  } catch (error) {
    console.error('Error proposing rate:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Counter project rate (assignee only)
// @route   POST /api/projects/:id/rate/counter
// @access  Private
const counterRate = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot counter rates.' })
    }
    const projectId = req.params.id
    const { amount, type } = req.body

    const project = await Project.findById(projectId)

    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    if (!project.assignee || project.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to counter rate' })
    }
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' })
    }

    project.rateNegotiation = project.rateNegotiation || {}
    project.rateNegotiation.status = 'countered'
    project.rateNegotiation.currentOffer = {
      amount: Number(amount),
      type: type || 'hourly',
      proposedBy: req.user._id,
      proposedAt: new Date()
    }
    project.rateNegotiation.history = project.rateNegotiation.history || []
    project.rateNegotiation.history.push(project.rateNegotiation.currentOffer)

    project.status = 'negotiating'

    const updated = await project.save()
    res.json(updated)
  } catch (error) {
    console.error('Error countering rate:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Accept current rate (owner or assignee)
// @route   POST /api/projects/:id/rate/accept
// @access  Private
const acceptRate = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot accept rates.' })
    }
    const projectId = req.params.id
    const project = await Project.findById(projectId)

    if (!project) return res.status(404).json({ message: 'Project not found' })

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    const isOwner = project.user.toString() === req.user._id.toString()
    const isAssignee = project.assignee?.toString() === req.user._id.toString()

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to accept rate' })
    }

    if (!project.rateNegotiation?.currentOffer) {
      return res.status(400).json({ message: 'No rate proposal to accept' })
    }

    console.log('=== ACCEPT RATE DEBUG ===')
    console.log('Project ID:', projectId)
    console.log('Before accept:')
    console.log('  - Budget:', project.budget)
    console.log('  - RateNegotiation.status:', project.rateNegotiation.status)
    console.log('  - CurrentOffer:', project.rateNegotiation.currentOffer)
    console.log('  - CurrentOffer.amount:', project.rateNegotiation.currentOffer.amount)

    project.rateNegotiation.status = 'accepted'
    project.rateNegotiation.agreedAt = new Date()
    // Update project budget with the agreed rate amount
    const agreedAmount = Number(project.rateNegotiation.currentOffer.amount)
    console.log('Setting budget to agreedAmount:', agreedAmount)
    project.budget = agreedAmount
    project.status = 'in_progress'

    console.log('After setting:')
    console.log('  - Budget:', project.budget)

    const updated = await project.save()

    console.log('After save:')
    console.log('  - Budget:', updated.budget)
    console.log('=== END DEBUG ===')

    res.json(updated)
  } catch (error) {
    console.error('Error accepting rate:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all projects current user is interested in
// @route   GET /api/projects/interested
// @access  Private
const getInterestedProjects = async (req, res) => {
  try {
    // Find all projects where current user is in interestedUsers array
    const projects = await Project.find({
      'interestedUsers.userId': req.user._id,
      status: { $ne: 'deleted_by_owner' }
    })
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    console.error('Error fetching interested projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Remove current user from project's interestedUsers
// @route   DELETE /api/projects/:id/interested
// @access  Private
const removeFromInterested = async (req, res) => {
  try {
    const projectId = req.params.id

    let project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    // Remove current user from interestedUsers array
    project.interestedUsers = project.interestedUsers.filter((u) => u.userId.toString() !== req.user._id.toString())

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error removing from interested:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Submit project work (assignee only)
// @route   POST /api/projects/:id/submit
// @access  Private
const submitProject = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot submit projects.' })
    }
    const projectId = req.params.id
    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    // Only assignee can submit
    const assigneeId = project.assignee?.toString()
    if (!assigneeId || assigneeId !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to submit this project' })
    }

    if (project.status !== 'in_progress') {
      return res.status(400).json({ message: 'Project is not in progress' })
    }

    // Parse links from request
    let links = []
    if (req.body.links) {
      try {
        links = Array.isArray(req.body.links) ? req.body.links : JSON.parse(req.body.links)
      } catch (err) {
        links = req.body.links
          .split(',')
          .map((l) => l.trim())
          .filter(Boolean)
      }
    }

    // Process submission files
    const submissionFiles = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }))
      : []

    project.submission = {
      links,
      files: submissionFiles,
      note: req.body.note || '',
      submittedAt: new Date(),
      submittedBy: req.user._id
    }

    project.status = 'under_review'

    const updatedProject = await project.save()

    await sendProjectSubmittedEmail({
      recipientId: project.user.toString(),
      assigneeName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A freelancer',
      projectId: updatedProject._id.toString(),
      projectTitle: updatedProject.title
    })

    await notifyProjectSubmitted({
      actor: req.user._id,
      recipient: project.user.toString(),
      projectId: updatedProject._id.toString(),
      projectTitle: updatedProject.title,
      actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A freelancer'
    })

    res.json(updatedProject)
  } catch (error) {
    console.error('Error submitting project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Review submitted project (owner only)
// @route   POST /api/projects/:id/review
// @access  Private
const reviewProject = async (req, res) => {
  try {
    const projectId = req.params.id
    const { decision, feedback } = req.body

    const project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be modified' })
    }

    // Only owner can review
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized to review this project' })
    }

    if (project.status !== 'under_review') {
      return res.status(400).json({ message: 'Project is not under review' })
    }

    if (!['accepted', 'declined'].includes(decision)) {
      return res.status(400).json({ message: 'Invalid decision' })
    }

    project.review = {
      decision,
      feedback: feedback || '',
      reviewedAt: new Date(),
      reviewedBy: req.user._id
    }

    project.status = decision === 'accepted' ? 'completed' : 'in_progress'

    const updatedProject = await project.save()

    if (project.assignee) {
      await sendProjectReviewDecisionEmail({
        recipientId: project.assignee.toString(),
        ownerName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
        projectId: updatedProject._id.toString(),
        projectTitle: updatedProject.title,
        decision,
        feedback
      })
    }

    await notifyProjectReviewed({
      actor: req.user._id,
      recipient: project.assignee.toString(),
      projectId: updatedProject._id.toString(),
      projectTitle: updatedProject.title,
      actorName: `${req.user.firstName || ''} ${req.user.lastName || ''}`.trim() || req.user.email || 'A client',
      decision
    })

    res.json(updatedProject)
  } catch (error) {
    console.error('Error reviewing project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Archive a completed project
// @route   PATCH /api/projects/:id/archive
// @access  Private (owner only)
const archiveProject = async (req, res) => {
  try {
    const projectId = req.params.id

    // Find project
    let project = await Project.findById(projectId)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Only owner can archive
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to archive this project' })
    }

    // Only completed projects can be archived
    if (project.status !== 'completed') {
      return res.status(400).json({ message: 'Only completed projects can be archived' })
    }

    // Update status to archived
    project.status = 'archived'

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error archiving project:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Mark a project as complete (owner or assignee)
// @route   PATCH /api/projects/:id/complete
// @access  Private
const markProjectComplete = async (req, res) => {
  try {
    const { projectId } = req.params
    const userId = req.user._id

    // Find project
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check authorization - only owner or assignee can mark complete
    const isOwner = project.owner.toString() === userId.toString()
    const isAssignee = project.assignee && project.assignee.toString() === userId.toString()

    if (!isOwner && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to complete this project' })
    }

    // Check if already completed
    if (project.status === 'completed') {
      return res.status(400).json({ message: 'Project is already completed' })
    }

    // Update project status and completion timestamp
    project.status = 'completed'
    project.completedAt = new Date()
    project.completedBy = userId
    project.lastUpdateReason = 'Project marked as complete'

    // Update availability if assignee exists
    if (project.assignee) {
      try {
        await removeProjectFromAvailability(project.assignee, projectId)
      } catch (availErr) {
        console.error('Error removing project from availability:', availErr)
        // Don't fail the completion if availability update fails
      }
    }

    await project.save()

    // Populate for response
    await project.populate([
      { path: 'owner', select: 'firstName lastName email profileImage' },
      { path: 'assignee', select: 'firstName lastName email profileImage' },
      { path: 'category', select: 'name' }
    ])

    res.status(200).json({
      message: 'Project marked as complete',
      data: project
    })
  } catch (err) {
    console.error('Error marking project complete:', err)
    res.status(500).json({ message: 'Error marking project complete', error: err.message })
  }
}

// @desc    Get project completion stats for current user
// @route   GET /api/projects/completion-stats
// @access  Private
const getProjectCompletionStats = async (req, res) => {
  try {
    const userId = req.user._id

    // Get stats for projects owned by user
    const ownedStats = await Project.aggregate([
      { $match: { owner: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    // Get stats for projects assigned to user
    const assignedStats = await Project.aggregate([
      { $match: { assignee: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ])

    res.status(200).json({
      message: 'Project completion stats retrieved',
      data: {
        owned: ownedStats,
        assigned: assignedStats
      }
    })
  } catch (err) {
    console.error('Error fetching completion stats:', err)
    res.status(500).json({ message: 'Error fetching stats', error: err.message })
  }
}

// @desc    Bulk complete projects (owner or assignee)
// @route   POST /api/projects/bulk-complete
// @access  Private
const bulkCompleteProjects = async (req, res) => {
  try {
    const { projectIds } = req.body
    const userId = req.user._id

    // Validate input
    if (!Array.isArray(projectIds) || projectIds.length === 0) {
      return res.status(400).json({ message: 'projectIds must be a non-empty array' })
    }

    if (projectIds.length > 50) {
      return res.status(400).json({ message: 'Cannot complete more than 50 projects at once' })
    }

    // Find all projects
    const projects = await Project.find({
      _id: { $in: projectIds }
    })

    // Validate authorization and status
    const validProjects = projects.filter((project) => {
      const isOwner = project.owner.toString() === userId.toString()
      const isAssignee = project.assignee && project.assignee.toString() === userId.toString()
      const canComplete = ['in_progress', 'under_review'].includes(project.status)

      return (isOwner || isAssignee) && canComplete && project.status !== 'completed'
    })

    if (validProjects.length === 0) {
      return res.status(400).json({ message: 'No valid projects to complete' })
    }

    const completionTime = new Date()
    const completedProjects = []
    const failedIds = []

    // Update each project
    for (const project of validProjects) {
      try {
        project.status = 'completed'
        project.completedAt = completionTime
        project.completedBy = userId
        project.lastUpdateReason = 'Bulk completed by user'

        // Remove from assignee availability
        if (project.assignee) {
          try {
            await removeProjectFromAvailability(project.assignee, project._id)
          } catch (availErr) {
            console.error('Error removing from availability:', availErr)
          }
        }

        await project.save()
        completedProjects.push(project)
      } catch (err) {
        console.error(`Error completing project ${project._id}:`, err)
        failedIds.push(project._id)
      }
    }

    res.status(200).json({
      message: `${completedProjects.length} project(s) completed successfully`,
      data: {
        completed: completedProjects.length,
        failed: failedIds.length,
        projects: completedProjects,
        failedIds
      }
    })
  } catch (err) {
    console.error('Error bulk completing projects:', err)
    res.status(500).json({ message: 'Error completing projects', error: err.message })
  }
}

// @desc    Reschedule a project (owner only)
// @route   PATCH /api/projects/:id/reschedule
// @access  Private
 const rescheduleProject = async (req, res) => {
  try {
    const { projectId } = req.params
    const { newDeadline } = req.body
    const userId = req.user._id

    // Validate input
    if (!newDeadline) {
      return res.status(400).json({ message: 'newDeadline is required' })
    }

    const newDate = new Date(newDeadline)
    if (isNaN(newDate.getTime())) {
      return res.status(400).json({ message: 'Invalid deadline date' })
    }

    if (newDate <= new Date()) {
      return res.status(400).json({ message: 'New deadline must be in the future' })
    }

    // Find project
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check authorization - only owner can reschedule
    if (project.owner.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Only project owner can reschedule' })
    }

    // Can't reschedule completed or cancelled projects
    if (['completed', 'cancelled', 'archived', 'deleted_by_owner'].includes(project.status)) {
      return res.status(400).json({ message: `Cannot reschedule ${project.status} project` })
    }

    const oldDeadline = project.deadline
    project.deadline = newDate
    project.lastUpdateReason = `Rescheduled from ${oldDeadline.toISOString()} to ${newDate.toISOString()}`

    // Update availability if assignee exists
    if (project.assignee) {
      try {
        // Remove from old date range
        await removeProjectFromAvailability(project.assignee, projectId)
        
        // Add to new date range
        await populateAvailabilityOnProjectAssignment(project.assignee, projectId, project.deadline, project.priority)
      } catch (availErr) {
        console.error('Error updating availability on reschedule:', availErr)
        // Don't fail the reschedule if availability update fails
      }
    }

    await project.save()

    // Populate for response
    await project.populate([
      { path: 'owner', select: 'firstName lastName email' },
      { path: 'assignee', select: 'firstName lastName email' },
      { path: 'category', select: 'name' }
    ])

    res.status(200).json({
      message: 'Project rescheduled successfully',
      data: {
        project,
        oldDeadline,
        newDeadline: project.deadline
      }
    })
  } catch (err) {
    console.error('Error rescheduling project:', err)
    res.status(500).json({ message: 'Error rescheduling project', error: err.message })
  }
}

export {
  createProject,
  publishProject,
  getUserProjects,
  getProjectById,
  getProjectByIdOwner,
  updateProject,
  deleteProject,
  getAllProjects,
  getAdminAllProjects,
  deleteProjectAsAdmin,
  updateProjectAsAdmin,
  bulkRenewProjectDeadlinesAsAdmin,
  toggleProjectLockAsAdmin,
  removeAssigneeAsAdmin,
  toggleApplicantShortlist,
  toggleApplicantSkillsVerified,
  assignUserToProject,
  reassignProject,
  proposeRate,
  counterRate,
  acceptRate,
  removeAssignee,
  getInterestedProjects,
  removeFromInterested,
  submitProject,
  reviewProject,
  archiveProject,
  markProjectComplete,
  getProjectCompletionStats,
  bulkCompleteProjects,
  rescheduleProject
}
