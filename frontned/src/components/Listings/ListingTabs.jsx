import { motion } from 'framer-motion'

// Projektu ir freelanceriu tab sekcija
const ListingTabs = () => {
  return (
    <section className='w-full py-20 theme-bg relative z-[1]'>
      <div className='container mx-auto px-4 relative z-10'>
        <motion.div className='text-center mb-16' initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h2 className='text-4xl font-heading font-bold mb-4'>
            <span className='theme-text'>Discover</span>
            <span className='text-accent'> Opportunities</span>
          </h2>
        </motion.div>

        {/* Tab toggle implementation will go here */}

        {/* Listings grid will go here */}
      </div>
    </section>
  )
}

export default ListingTabs
