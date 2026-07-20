import { motion } from 'framer-motion'

const AboutHero = ({ eyebrow, headline, subheadline, layout = {} }) => {
  const contentAlign = layout.contentAlign || 'left'
  const contentWidth = layout.contentWidth || 'wide'
  const showEyebrow = layout.showEyebrow ?? true

  const alignClass = contentAlign === 'center' ? 'mx-auto text-center' : ''
  const widthClass = contentWidth === 'narrow' ? 'max-w-3xl' : contentWidth === 'full' ? 'max-w-5xl' : 'max-w-4xl'

  return (
    <motion.div className={`${widthClass} ${alignClass}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      {showEyebrow && <p className='text-sm uppercase tracking-[0.2em] text-accent mb-3'>{eyebrow}</p>}
      <h1 className='text-4xl md:text-5xl font-bold theme-text leading-tight'>{headline}</h1>
      <p className={`theme-text-secondary mt-4 text-lg max-w-3xl ${contentAlign === 'center' ? 'mx-auto' : ''}`}>{subheadline}</p>
    </motion.div>
  )
}

export default AboutHero
