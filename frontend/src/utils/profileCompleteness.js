export const PROFILE_COMPLETENESS_RULES = [
  { key: 'firstName', label: 'First name', weight: 1, required: true },
  { key: 'lastName', label: 'Last name', weight: 1, required: true },
  { key: 'email', label: 'Email', weight: 2, required: true },
  { key: 'phone', label: 'Phone number', weight: 1, required: false },
  { key: 'location', label: 'Location', weight: 1, required: false },
  { key: 'skills', label: 'Skills', weight: 2, required: true },
  { key: 'bio', label: 'Bio', weight: 2, required: true },
  { key: 'profilePicture', label: 'Profile picture', weight: 1, required: false },
  { key: 'website', label: 'Website', weight: 1, required: false },
  { key: 'github', label: 'GitHub profile', weight: 1, required: false },
  { key: 'linkedin', label: 'LinkedIn profile', weight: 1, required: false },
  { key: 'languages', label: 'Languages', weight: 1, required: false },
  { key: 'serviceCategories', label: 'Service categories', weight: 1, required: false }
]

const hasValue = (value) => {
  if (value === null || value === undefined) return false
  if (typeof value === 'string') return value.trim().length > 0
  if (Array.isArray(value)) return value.length > 0
  return true
}

export const calculateProfileCompleteness = (user) => {
  if (!user) {
    return {
      percentage: 0,
      completedWeight: 0,
      totalWeight: 0,
      missingRequired: [],
      missingOptional: [],
      completedKeys: []
    }
  }

  const totalWeight = PROFILE_COMPLETENESS_RULES.reduce((sum, rule) => sum + rule.weight, 0)
  let completedWeight = 0
  const missingRequired = []
  const missingOptional = []
  const completedKeys = []

  for (const rule of PROFILE_COMPLETENESS_RULES) {
    const filled = hasValue(user[rule.key])

    if (filled) {
      completedWeight += rule.weight
      completedKeys.push(rule.key)
    } else if (rule.required) {
      missingRequired.push({ key: rule.key, label: rule.label })
    } else {
      missingOptional.push({ key: rule.key, label: rule.label })
    }
  }

  const percentage = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0

  return {
    percentage,
    completedWeight,
    totalWeight,
    missingRequired,
    missingOptional,
    completedKeys
  }
}
