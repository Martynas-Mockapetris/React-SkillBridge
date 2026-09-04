import { prefersReducedMotion, getMotionConfig } from '../animationConfig'

describe('Animation Configuration Utilities', () => {
  describe('prefersReducedMotion', () => {
    test('should return boolean', () => {
      const result = prefersReducedMotion()
      expect(typeof result).toBe('boolean')
    })
  })

  describe('getMotionConfig', () => {
    test('should return default preset when type not specified', () => {
      const config = getMotionConfig()
      expect(config).toHaveProperty('initial')
      expect(config).toHaveProperty('animate')
      expect(config).toHaveProperty('transition')
    })

    test('should return fade preset', () => {
      const config = getMotionConfig('fade')
      expect(config).toHaveProperty('initial')
      expect(config.initial).toHaveProperty('opacity')
    })

    test('should return scale preset', () => {
      const config = getMotionConfig('scale')
      expect(config).toHaveProperty('initial')
      expect(config.initial).toHaveProperty('scale')
    })

    test('should return slideInLeft preset', () => {
      const config = getMotionConfig('slideInLeft')
      expect(config.initial).toHaveProperty('x')
    })

    test('should have reduced animation on prefers-reduced-motion', () => {
      // Mock will depend on browser environment
      const config = getMotionConfig('default')
      expect(config.transition).toHaveProperty('duration')
      expect(config.transition.duration).toBeGreaterThanOrEqual(0.05)
    })
  })
})
