const CardLoader = () => {
  return (
    <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6'>
      <div className='flex items-center gap-4 mb-4'>
        <div className='w-16 h-16 rounded-full bg-accent/10 animate-pulse'></div>
        <div>
          <div className='h-7 w-32 bg-accent/10 rounded animate-pulse mb-2'></div>
          <div className='h-6 w-24 bg-accent/10 rounded-full animate-pulse'></div>
        </div>
      </div>

      <div className='flex items-center justify-between mb-3'>
        <div className='h-5 w-16 bg-accent/10 rounded animate-pulse'></div>
        <div className='h-5 w-20 bg-accent/10 rounded animate-pulse'></div>
      </div>

      <div className='h-5 w-40 bg-accent/10 rounded animate-pulse'></div>
    </div>
  )
}

export default CardLoader
