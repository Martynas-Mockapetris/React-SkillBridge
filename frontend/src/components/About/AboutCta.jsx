import { motion } from 'framer-motion'
import { FaArrowRight } from 'react-icons/fa'
import { Link } from 'react-router-dom'

const AboutCta = ({ eyebrow, headline, body, primaryLabel, primaryHref, secondaryLabel, secondaryHref, layout = {} }) => {
  const contentAlign = layout.contentAlign || 'left'
  const contentWidth = layout.contentWidth || 'wide'
  const buttonLayout = layout.buttonLayout || 'stacked-mobile'
  const emphasisStyle = layout.emphasisStyle || 'soft'
  const showSecondaryButton = layout.showSecondaryButton ?? true

  const widthClass = contentWidth === 'narrow' ? 'max-w-5xl mx-auto' : 'w-full'
  const textAlignClass = contentAlign === 'center' ? 'text-center' : 'text-left'
  const buttonWrapClass =
    buttonLayout === 'inline'
      ? `mt-6 flex flex-wrap gap-3 ${contentAlign === 'center' ? 'justify-center' : ''}`
      : buttonLayout === 'split'
        ? 'mt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3'
        : `mt-6 flex flex-col sm:flex-row flex-wrap gap-3 ${contentAlign === 'center' ? 'justify-center' : ''}`

  const surfaceClass =
    emphasisStyle === 'strong'
      ? 'rounded-3xl border border-accent/30 bg-accent/10 dark:bg-accent/15 p-8 md:p-10'
      : emphasisStyle === 'outline'
        ? 'rounded-3xl border-2 theme-border bg-transparent p-8 md:p-10'
        : 'rounded-3xl border theme-border bg-white/50 dark:bg-black/20 p-8 md:p-10'

  return (
    <motion.div className={`${surfaceClass} ${widthClass}`} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
      <div className={textAlignClass}>
        <p className='text-xs font-semibold uppercase tracking-[0.18em] text-accent mb-3'>{eyebrow}</p>
        <h2 className='text-2xl md:text-3xl font-semibold theme-text'>{headline}</h2>
        <p className='mt-3 theme-text-secondary leading-relaxed'>{body}</p>
      </div>

      <div className={buttonWrapClass}>
        <Link to={primaryHref} className='inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity'>
          {primaryLabel}
          <FaArrowRight />
        </Link>

        {showSecondaryButton && (
          <Link
            to={secondaryHref}
            className='inline-flex items-center justify-center gap-2 rounded-full border theme-border px-5 py-3 text-sm font-semibold theme-text hover:bg-white/40 dark:hover:bg-white/5 transition-colors'>
            {secondaryLabel}
          </Link>
        )}
      </div>
    </motion.div>
  )
}

export default AboutCta
