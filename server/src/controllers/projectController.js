import Project from '../models/Project.js'

const isImmutableProjectStatus = (status) => ['cancelled_by_admin', 'deleted_by_owner'].includes(status)

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    // Check if user is locked
    if (req.user.isLocked) {
      return res.status(403).json({ message: 'Your account is locked. You cannot create projects.' })
    }

    console.log('Creating project with data:', req.body)
    console.log('Files received:', req.files)

    const { title, description, category, skills, budget, priority, deadline, status, assigneeId, rateNegotiation } = req.body

    // Process attachments if any
    const attachments = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }))
      : []

    let normalizedStatus = status || 'draft'

    if (assigneeId && !status) {
      // If initial rate proposal included, set to negotiating instead of assigned
      normalizedStatus = rateNegotiation?.status === 'proposed' ? 'negotiating' : 'assigned'
    }

    if (assigneeId && assigneeId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Cannot assign project to yourself' })
    }

    // Process rateNegotiation if present - replace 'owner' with actual user ID
    let processedRateNegotiation = rateNegotiation
    if (rateNegotiation) {
      processedRateNegotiation = {
        ...rateNegotiation,
        currentOffer: rateNegotiation.currentOffer
          ? {
              ...rateNegotiation.currentOffer,
              proposedBy: req.user._id
            }
          : undefined,
        history:
          rateNegotiation.history?.map((offer) => ({
            ...offer,
            proposedBy: req.user._id
          })) || []
      }
    }

    const shouldSetBudget = !rateNegotiation || rateNegotiation.status !== 'proposed'
    const finalBudget = shouldSetBudget ? Number(budget) : undefined

    console.log('=== CREATE PROJECT DEBUG ===')
    console.log('RateNegotiation status:', rateNegotiation?.status)
    console.log('Should set budget:', shouldSetBudget)
    console.log('Final budget value:', finalBudget)
    console.log('Original budget from request:', budget)

    // Create new project
    const project = new Project({
      user: req.user._id, // This comes from the protect middleware
      assignee: assigneeId || null,
      title,
      description,
      category,
      skills: Array.isArray(skills) ? skills : skills.split(','),
      // Only set budget if there's no rate negotiation (i.e., this is a fixed budget project)
      // If rate negotiation is proposed, leave budget empty until agreed
      budget: finalBudget,
      priority: priority || 'low',
      deadline,
      status: normalizedStatus,
      attachments,
      rateNegotiation: processedRateNegotiation || undefined
    })

    console.log('Saving project to database:', project)

    const createdProject = await project.save()
    console.log('Project saved successfully:', createdProject)

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
    const projects = await Project.find({ status: 'active' }).populate('user', 'firstName lastName email profilePicture').sort({ createdAt: -1 })

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
    const projects = await Project.find({}).populate('user', 'firstName lastName email profilePicture').populate('assignee', 'firstName lastName email profilePicture').sort({ createdAt: -1 })

    res.json(projects)
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

    // Keep project record, only mark as cancelled by admin
    project.status = 'cancelled_by_admin'
    await project.save()

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
    const { title, description, category, skills, budget, priority, deadline, status } = req.body

    const project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Admin should not edit projects that are already locked by moderation lifecycle.
    if (isImmutableProjectStatus(project.status)) {
      return res.status(403).json({ message: 'Project is locked and cannot be edited' })
    }

    // Only apply provided fields.
    if (title !== undefined) project.title = title
    if (description !== undefined) project.description = description
    if (category !== undefined) project.category = category

    // Accept both CSV string and string[] to keep API flexible for admin UI.
    if (skills !== undefined) {
      project.skills = Array.isArray(skills)
        ? skills
        : String(skills)
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean)
    }

    if (budget !== undefined) project.budget = Number(budget)
    if (priority !== undefined) project.priority = priority
    if (deadline !== undefined) project.deadline = deadline

    // Prevent admin update endpoint from setting moderation terminal statuses directly.
    if (status !== undefined && !['cancelled_by_admin', 'deleted_by_owner'].includes(status)) {
      project.status = status
    }

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error updating project as admin:', error)
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Project not found' })
    }
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({
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
    })
      .populate('user', 'firstName lastName email profilePicture')
      .populate('interestedUsers.userId', 'firstName lastName email profilePicture')
      .populate('assignee', 'firstName lastName email profilePicture')
      .sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    console.error('Error fetching user projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get project by ID (PUBLIC - only active)
// @route   GET /api/projects/:id
// @access  Public
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', 'firstName lastName email profilePicture').populate('assignee', 'firstName lastName email profilePicture')

    if (!project) {
      console.log(`[GET PROJECT] Project ${req.params.id} not found in DB`)
      return res.status(404).json({ message: 'Project not found' })
    }

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
    const project = await Project.findById(req.params.id).populate('user', 'firstName lastName email profilePicture').populate('assignee', 'firstName lastName email profilePicture')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

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
    const { title, description, category, skills, budget, priority, deadline } = req.body

    let project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

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
      const hasOtherUpdates = title || description || category || skills || budget || priority || (req.files && req.files.length > 0)

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
    project.skills = Array.isArray(skills) ? skills : skills ? skills.split(',') : project.skills
    project.budget = budget || project.budget
    project.priority = priority || project.priority
    project.deadline = deadline || project.deadline
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
    const populatedProject = await Project.findById(projectId).populate('assignee', 'firstName lastName email profilePicture')

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

    project.assignee = userId

    const updatedProject = await project.save()
    const populatedProject = await Project.findById(projectId).populate('assignee', 'firstName lastName email profilePicture')

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

    project.assignee = null

    const updatedProject = await project.save()
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
  archiveProject
}
