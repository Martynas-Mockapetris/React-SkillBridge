import { motion } from 'framer-motion'
import { FaBullseye, FaCompass, FaUsers } from 'react-icons/fa'

const AboutHighlights = ({ mission, vision, layout = {} }) => {
  const contentAlign = layout.contentAlign || 'left'
  const contentWidth = layout.contentWidth || 'wide'
  const cardLayout = layout.cardLayout || 'stacked'
  const showIcons = layout.showIcons ?? true

  const alignClass = contentAlign === 'center' ? 'text-center' : 'text-left'
  const introAlignClass = contentAlign === 'center' ? 'mx-auto text-center' : ''
  const widthClass = contentWidth === 'narrow' ? 'max-w-5xl mx-auto' : 'w-full'

  const cards = [
    {
      title: 'Clear Matching',
      description: 'Projects, people, and expectations are easier to align when the platform is structured around practical work signals.',
      icon: <FaUsers className='text-accent' />
    },
    {
      title: 'Mission',
      description: mission,
      icon: <FaBullseye className='text-accent' />
    },
    {
      title: 'Vision',
      description: vision,
      icon: <FaCompass className='text-accent' />
    }
  ]

  const introCardClass =
    cardLayout === 'grid'
      ? 'rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8 lg:col-span-3'
      : cardLayout === 'feature-first'
        ? 'rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8 lg:col-span-2'
        : 'rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8'

  const asideGridClass = cardLayout === 'grid' ? 'grid grid-cols-1 md:grid-cols-3 gap-4' : cardLayout === 'feature-first' ? 'grid grid-cols-1 gap-4' : 'grid grid-cols-1 gap-4'

  const wrapperClass =
    cardLayout === 'grid'
      ? `grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch ${widthClass}`
      : cardLayout === 'feature-first'
        ? `grid grid-cols-1 lg:grid-cols-[1.4fr_0.6fr] gap-6 items-stretch ${widthClass}`
        : `grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-stretch ${widthClass}`

  return (
    <div className={wrapperClass}>
      <motion.div className={introCardClass} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <div className={introAlignClass}>
          <p className='text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3'>Platform Direction</p>
          <h2 className='text-2xl md:text-3xl font-semibold theme-text leading-snug'>A practical platform for better freelance collaboration</h2>
          <div className={`mt-5 space-y-4 theme-text-secondary leading-relaxed ${alignClass}`}>
            <p>{mission}</p>
            <p>{vision}</p>
          </div>
        </div>
      </motion.div>

      <motion.div className={asideGridClass} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
        {cards.map((card) => (
          <div key={card.title} className={`rounded-2xl border theme-border bg-white/50 dark:bg-black/20 p-5 ${alignClass}`}>
            {showIcons && <div className={`mb-3 text-xl ${contentAlign === 'center' ? 'flex justify-center' : ''}`}>{card.icon}</div>}
            <h3 className='text-lg font-semibold theme-text'>{card.title}</h3>
            <p className='mt-2 text-sm leading-relaxed theme-text-secondary'>{card.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default AboutHighlights
