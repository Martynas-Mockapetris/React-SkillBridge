import { useNavigate } from 'react-router-dom'
import MolecularPatterns from '../shared/MolecularPatterns'

const HeroSection = () => {
  const navigate = useNavigate()

  // Nukreipimas i listings puslapi su papildoma informacija apie aktyvaus tabo busena
  const handleNavigation = (type) => {
    navigate('/listings', { state: { activeTab: type } })
  }

  return (
    <section className='relative h-screen flex items-center justify-center overflow-hidden theme-bg'>
      <MolecularPatterns />

      {/* Turinio konteineris*/}
      <div className='container mx-auto px-4 md:px-6 lg:px-8 relative z-20'>
        {/* Centrinis tekstas ir mygtukai */}
        <div className='text-center space-y-6'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold'>
            <span className='theme-text'>Find Your Next</span>
            <span className='text-accent'> Opportunity</span>
          </h1>
          {/* Aprasymo tekstas */}
          <p className='theme-text-secondary text-lg md:text-xl max-w-2xl mx-auto'>
            Connect with top talent and clients worldwide on our platform. <br />
            Start your success story today.
          </p>
          {/* Mygtuku grupe - stulpelis mobiliam, eilute desktopui */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button onClick={() => handleNavigation('talent')} className='bg-accent text-light px-8 py-3 rounded-lg hover:bg-accent/70 transition-all duration-300'>
              Find Talent
            </button>
            <button onClick={() => handleNavigation('work')} className='theme-text theme-border border px-8 py-3 rounded-lg theme-hover hover:border-accent hover:text-accent transition-all duration-300'>
              Find Work
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indikatorius */}
      <div className='absolute bottom-8 transform -translate-x-1/2 animate-bounce'>
        <div className='w-8 h-12 rounded-full border-2 dark:border-light/50 border-primary/50 flex items-start justify-center p-2'>
          <div className='w-1 h-3 rounded-full dark:bg-light/50 bg-primary/50'></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
