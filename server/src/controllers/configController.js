import SystemConfig from '../models/SystemConfig.js'

const ensureConfig = async () => {
  let config = await SystemConfig.findOne()
  if (!config) {
    config = await SystemConfig.create({})
  }
  return config
}

// @desc    Get system config (admin)
// @route   GET /api/config
// @access  Admin
export const getSystemConfig = async (req, res) => {
  try {
    const config = await ensureConfig()
    res.json(config)
  } catch (error) {
    console.error('Error fetching system config:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Get public config for site content
// @route   GET /api/config/public
// @access  Public
export const getPublicSystemConfig = async (req, res) => {
  try {
    const config = await ensureConfig()

    const publicSections = ['home', 'pricing', 'testimonials', 'blog', 'about', 'contact', 'system']
    const payload = publicSections.reduce((acc, section) => {
      const sectionData = config[section]

      acc[section] = {
        enabled: sectionData?.enabled ?? true,
        values: sectionData?.values || {}
      }

      return acc
    }, {})

    res.json(payload)
  } catch (error) {
    console.error('Error fetching public system config:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}

// @desc    Update one config section (admin)
// @route   PUT /api/config/:section
// @access  Admin
export const updateSystemConfigSection = async (req, res) => {
  try {
    const { section } = req.params
    const allowedSections = ['home', 'pricing', 'testimonials', 'blog', 'about', 'contact', 'mail', 'system']

    if (!allowedSections.includes(section)) {
      return res.status(400).json({ message: 'Invalid config section' })
    }

    const config = await ensureConfig()

    const currentSection = config[section] || {}
    config[section] = {
      ...currentSection.toObject?.(),
      ...req.body,
      updatedBy: req.user?._id || null,
      updatedAt: new Date()
    }

    await config.save()
    res.json({ message: `${section} settings updated`, config })
  } catch (error) {
    console.error('Error updating system config section:', error)
    res.status(500).json({ message: 'Server error', error: error.message })
  }
}
