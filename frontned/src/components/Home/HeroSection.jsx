import molecularPattern from '../../assets/molecular-pattern.svg'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {
  const navigate = useNavigate()

  // Nukreipimas i listings puslapi su papildoma informacija apie aktyvaus tabo busena
  const handleNavigation = (type) => {
    navigate('/listings', { state: { activeTab: type } })
  }

  return (
    <section className='relative h-[calc(100vh-64px)] flex items-center justify-center bg-primary overflow-hidden'>
      {/* Pagrindinis molekules patternas - kaireje puseje */}
      <div className='absolute -left-20 opacity-10'>
        <img src={molecularPattern} alt='' className='w-[600px] h-[600px] rotate-[40deg]' />
      </div>
      <div className='absolute right-60 top-5 opacity-5'>
        <img src={molecularPattern} alt='' className='w-[600px] h-[600px] rotate-[-45deg]' />
      </div>

      {/* Antriniai molekuliu patternai */}
      <div className='absolute right-0 top-1/4 opacity-10'>
        <img src={molecularPattern} alt='' className='w-[300px] h-[300px] rotate-[12deg]' />
      </div>
      <div className='absolute right-20 bottom-1/4 opacity-5'>
        <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[-25deg]' />
      </div>
      <div className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5'>
        <img src={molecularPattern} alt='' className='w-[400px] h-[400px] rotate-[45deg]' />
      </div>
      <div className='absolute left-20 bottom-20 opacity-15'>
        <img src={molecularPattern} alt='' className='w-[250px] h-[250px] rotate-[60deg]' />
      </div>
      <div className='absolute left-1/2 top-20 -translate-x-1/2 opacity-10'>
        <img src={molecularPattern} alt='' className='w-[200px] h-[200px] rotate-[30deg]' />
      </div>

      {/* Papildomi molekuliu patternai gylio efektui */}
      <div className='absolute right-60 top-2/3 opacity-5'>
        <img src={molecularPattern} alt='' className='w-[150px] h-[150px] rotate-[90deg]' />
      </div>
      <div className='absolute left-40 bottom-1/3 opacity-5'>
        <img src={molecularPattern} alt='' className='w-[180px] h-[180px] rotate-[-15deg]' />
      </div>
      <div className='absolute left-1/3 top-1/4 -translate-y-1/2 opacity-20'>
        <img src={molecularPattern} alt='' className='w-[120px] h-[120px] rotate-[90deg]' />
      </div>
      <div className='absolute right-1/3 top-1/2 -translate-y-1/2 opacity-30'>
        <img src={molecularPattern} alt='' className='w-[120px] h-[120px] rotate-[-90deg]' />
      </div>
      <div className='absolute right-40 top-1/2 opacity-20'>
        <img src={molecularPattern} alt='' className='w-[140px] h-[140px] rotate-[-50deg]' />
      </div>
      <div className='absolute left-1/3 bottom-40 opacity-15'>
        <img src={molecularPattern} alt='' className='w-[160px] h-[160px] rotate-[75deg]' />
      </div>

      {/* Turinio konteineris*/}
      <div className='container mx-auto px-4 md:px-6 lg:px-8 relative z-20'>
        {/* Centrinis tekstas ir mygtukai */}
        <div className='text-center space-y-6'>
          <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold'>
            <span className='text-light'>Find Your Next</span>
            <span className='text-accent'> Opportunity</span>
          </h1>
          {/* Aprasymo tekstas */}
          <p className='text-light/80 text-lg md:text-xl max-w-2xl mx-auto'>
            Connect with top talent and clients worldwide on our platform. <br /> Start your success story today.
          </p>
          {/* Mygtuku grupe - stulpelis mobiliam, eilute desktopui */}
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <button onClick={() => handleNavigation('talent')} className='bg-accent text-light px-8 py-3 rounded-lg hover:bg-accent/70 transition-all duration-300'>
              Find Talent
            </button>
            <button onClick={() => handleNavigation('work')} className='border border-light text-light px-8 py-3 rounded-lg hover:bg-light/5 hover:border-accent hover:text-accent transition-all duration-300'>
              Find Work
            </button>
          </div>
        </div>
      </div>

      {/* Scroll indikatorius */}
      <div className='absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce'>
        <div className='w-8 h-12 rounded-full border-2 border-light/50 flex items-start justify-center p-2'>
          <div className='w-1 h-3 bg-light/50 rounded-full'></div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
