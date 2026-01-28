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
    // Only show active projects in listings
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
    const projects = await Project.find({ user: req.user._id }).populate('interestedUsers.userId', 'firstName lastName email profilePicture').sort({ createdAt: -1 })
    res.json(projects)
  } catch (error) {
    console.error('Error fetching user projects:', error)
    res.status(500).json({ message: 'Server error' })
  }
}

// @desc    Get project by ID
// @route   GET /api/projects/:id
// @access  Private
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('user', 'firstName lastName email profilePicture')

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

export { createProject, getUserProjects, getProjectById, updateProject, deleteProject, getAllProjects }
