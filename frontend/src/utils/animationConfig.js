import React from 'react'

// Animation performance optimization utilities
// Supports prefers-reduced-motion for accessibility

export const prefersReducedMotion = () => {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export const getAnimationPreset = (reducedAnimations) => {
  if (reducedAnimations || prefersReducedMotion()) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      transition: { duration: 0.1 }
    }
  }
  return null
}

export const getMotionConfig = (type = 'default') => {
  const isReduced = prefersReducedMotion()

  const presets = {
    default: {
      initial: isReduced ? {} : { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: isReduced ? {} : { opacity: 0, y: -20 },
      transition: { duration: isReduced ? 0.05 : 0.3 }
    },
    fade: {
      initial: isReduced ? {} : { opacity: 0 },
      animate: { opacity: 1 },
      exit: isReduced ? {} : { opacity: 0 },
      transition: { duration: isReduced ? 0.05 : 0.2 }
    },
    scale: {
      initial: isReduced ? {} : { opacity: 0, scale: 0.95 },
      animate: { opacity: 1, scale: 1 },
      exit: isReduced ? {} : { opacity: 0, scale: 0.95 },
      transition: { duration: isReduced ? 0.05 : 0.25 }
    },
    slideInLeft: {
      initial: isReduced ? {} : { opacity: 0, x: -20 },
      animate: { opacity: 1, x: 0 },
      exit: isReduced ? {} : { opacity: 0, x: -20 },
      transition: { duration: isReduced ? 0.05 : 0.3 }
    },
    slideInRight: {
      initial: isReduced ? {} : { opacity: 0, x: 20 },
      animate: { opacity: 1, x: 0 },
      exit: isReduced ? {} : { opacity: 0, x: 20 },
      transition: { duration: isReduced ? 0.05 : 0.3 }
    }
  }

  return presets[type] || presets.default
}

export const useReducedMotion = () => {
  const [prefersReduced, setPrefersReduced] = React.useState(prefersReducedMotion())

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (e) => setPrefersReduced(e.matches)

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReduced
}
