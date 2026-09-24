import PropTypes from 'prop-types'

const SkillsList = ({ skills = [], maxDisplay = 3, className = '' }) => {
  if (!skills || skills.length === 0) {
    return null
  }

  const displayedSkills = skills.slice(0, maxDisplay)
  const moreCount = skills.length - maxDisplay

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {displayedSkills.map((skill, idx) => (
        <span key={`${skill}-${idx}`} className='px-2 py-1 bg-accent/10 text-accent rounded text-xs'>
          {skill}
        </span>
      ))}
      {moreCount > 0 && (
        <span className='px-2 py-1 bg-accent/10 text-accent rounded text-xs'>+{moreCount}</span>
      )}
    </div>
  )
}

SkillsList.propTypes = {
  skills: PropTypes.arrayOf(PropTypes.string).isRequired,
  maxDisplay: PropTypes.number,
  className: PropTypes.string
}

export default SkillsList
