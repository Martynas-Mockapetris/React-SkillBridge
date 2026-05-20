export const normalizeSkills = (skills) => {
  if (!Array.isArray(skills)) return []

  return [
    ...new Set(
      skills
        .flatMap((skill) => String(skill).split(','))
        .map((skill) => skill.trim())
        .filter(Boolean)
    )
  ]
}
