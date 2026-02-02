import Project from '../models/Project.js'

// @desc    Create a new project
// @route   POST /api/projects
// @access  Private
const createProject = async (req, res) => {
  try {
    console.log('Creating project with data:', req.body)
    console.log('Files received:', req.files)

    const { title, description, category, skills, budget, deadline, status } = req.body

    // Process attachments if any
    const attachments = req.files
      ? req.files.map((file) => ({
          name: file.originalname,
          path: file.path,
          mimetype: file.mimetype
        }))
      : []

    // Create new project
    const project = new Project({
      user: req.user._id, // This comes from the protect middleware
      title,
      description,
      category,
      skills: Array.isArray(skills) ? skills : skills.split(','),
      budget: Number(budget),
      deadline,
      status: status || 'draft',
      attachments
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

// @desc    Get all projects for the logged-in user
// @route   GET /api/projects
// @access  Private
const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find({ user: req.user._id })
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
    // ✅ Only return active projects publicly
    const project = await Project.findOne({ _id: req.params.id, status: 'active' }).populate('user', 'firstName lastName email profilePicture').populate('assignee', 'firstName lastName email profilePicture')

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    res.json(project)
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

    // ✅ Only owner can access draft/private version
    if (project.user.toString() !== req.user._id.toString()) {
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
    const { title, description, category, skills, budget, deadline, status } = req.body

    let project = await Project.findById(req.params.id)

    if (!project) {
      return res.status(404).json({ message: 'Project not found' })
    }

    // Check if the project belongs to the user
    if (project.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' })
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
    project.deadline = deadline || project.deadline
    project.status = status || project.status
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

    await project.deleteOne()
    res.json({ message: 'Project removed' })
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

    project.assignee = null

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error removing assignee:', error)
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
      'interestedUsers.userId': req.user._id
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

    // Remove current user from interestedUsers array
    project.interestedUsers = project.interestedUsers.filter((u) => u.userId.toString() !== req.user._id.toString())

    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.error('Error removing from interested:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

export { createProject, getUserProjects, getProjectById, getProjectByIdOwner, updateProject, deleteProject, getAllProjects, assignUserToProject, reassignProject, removeAssignee, getInterestedProjects, removeFromInterested }
