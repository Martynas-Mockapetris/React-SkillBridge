export const getSectionSpacingClass = (spacing = {}) => {
  const top = spacing.top || 'normal'
  const bottom = spacing.bottom || 'normal'

  const topClass = top === 'none' ? 'pt-0' : top === 'tight' ? 'pt-10' : top === 'relaxed' ? 'pt-24' : top === 'loose' ? 'pt-32' : 'pt-20'

  const bottomClass = bottom === 'none' ? 'pb-0' : bottom === 'tight' ? 'pb-10' : bottom === 'relaxed' ? 'pb-24' : bottom === 'loose' ? 'pb-32' : 'pb-20'

  return `${topClass} ${bottomClass}`
}
