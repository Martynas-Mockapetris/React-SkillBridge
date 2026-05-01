import { motion } from 'framer-motion'
import { FaBullseye, FaCompass, FaUsers } from 'react-icons/fa'

const AboutHighlights = ({ mission, vision }) => {
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

  return (
    <div className='grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-6 items-stretch'>
      <motion.div className='rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.08 }}>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3'>Platform Direction</p>
        <h2 className='text-2xl md:text-3xl font-semibold theme-text leading-snug'>A practical platform for better freelance collaboration</h2>
        <div className='mt-5 space-y-4 theme-text-secondary leading-relaxed'>
          <p>{mission}</p>
          <p>{vision}</p>
        </div>
      </motion.div>

      <motion.div className='grid grid-cols-1 gap-4' initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.14 }}>
        {cards.map((card) => (
          <div key={card.title} className='rounded-2xl border theme-border bg-white/50 dark:bg-black/20 p-5'>
            <div className='mb-3 text-xl'>{card.icon}</div>
            <h3 className='text-lg font-semibold theme-text'>{card.title}</h3>
            <p className='mt-2 text-sm leading-relaxed theme-text-secondary'>{card.description}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}

export default AboutHighlights
