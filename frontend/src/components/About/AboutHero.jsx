import { motion } from 'framer-motion'

const AboutHero = ({ eyebrow, headline, subheadline }) => {
  return (
    <motion.div className='max-w-4xl mb-10' initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <p className='text-sm uppercase tracking-[0.2em] text-accent mb-3'>{eyebrow}</p>
      <h1 className='text-4xl md:text-5xl font-bold theme-text leading-tight'>{headline}</h1>
      <p className='theme-text-secondary mt-4 text-lg max-w-3xl'>{subheadline}</p>
    </motion.div>
  )
}

export default AboutHero
