const ProjectCardLoader = () => {
  return (
    <div className='bg-gradient-to-br dark:from-light/10 dark:via-light/5 from-primary/10 via-primary/5 to-transparent backdrop-blur-sm rounded-lg p-6'>
      <div className='h-7 w-3/4 bg-accent/10 rounded animate-pulse mb-2'></div>
      <div className='h-6 w-1/4 bg-accent/10 rounded-full animate-pulse mb-4'></div>
      <div className='flex items-center gap-3 mb-4'>
        <div className='w-10 h-10 rounded-full bg-accent/10 animate-pulse'></div>
        <div>
          <div className='h-5 w-24 bg-accent/10 rounded animate-pulse mb-1'></div>
          <div className='h-4 w-16 bg-accent/10 rounded animate-pulse'></div>
        </div>
      </div>
      <div className='h-4 w-1/3 bg-accent/10 rounded animate-pulse'></div>
    </div>
  )
}

export default ProjectCardLoader
