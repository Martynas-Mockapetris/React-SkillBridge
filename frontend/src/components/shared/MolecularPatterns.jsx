import molecularPattern from '../../assets/molecular-pattern.svg'

const MolecularPatterns = () => {
  return (
    <>
      {/* Pagrindinis molekules patternas - kaireje puseje */}
      <div className='absolute -left-20 opacity-10'>
        <img src={molecularPattern} alt='' className='w-[600px] h-[600px] rotate-[40deg]' />
      </div>
      <div className='absolute right-60 top-20 opacity-5'>
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
    </>
  )
}

export default MolecularPatterns
