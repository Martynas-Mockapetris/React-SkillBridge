const LoadingSpinner = ({ size = 'md', fullScreen = false, className = '' }) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  }

  const spinner = <div className={`animate-spin rounded-full border-t-2 border-b-2 border-accent ${sizeClasses[size]} ${className}`}></div>

  if (fullScreen) {
    return <div className='min-h-screen flex items-center justify-center'>{spinner}</div>
  }

  return spinner
}

export default LoadingSpinner
