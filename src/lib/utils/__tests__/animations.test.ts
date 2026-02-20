import {
  fadeInUp,
  fadeInUpWithDelay,
  scaleIn,
  scaleInWithDelay,
  fadeIn,
  slideInLeft,
  slideInRight,
} from '@/lib/utils/animations'

describe('animations presets', () => {
  it('fadeInUp matches expected structure', () => {
    expect(fadeInUp.initial).toEqual({ opacity: 0, y: 30 })
    expect(fadeInUp.whileInView).toEqual({ opacity: 1, y: 0 })
    expect(fadeInUp.viewport).toEqual({ once: true })
  })

  it('fadeInUpWithDelay handles custom delay', () => {
    const anim = fadeInUpWithDelay(2, 0.5)
    expect(anim.transition.delay).toBe(1)
    expect(anim.initial.y).toBe(20)
  })

  it('fadeInUpWithDelay uses default delay', () => {
    const anim = fadeInUpWithDelay(5)
    expect(anim.transition.delay).toBe(0.5)
  })

  it('scaleIn matches expected structure', () => {
    expect(scaleIn.initial.scale).toBe(0.8)
    expect(scaleIn.whileInView.scale).toBe(1)
  })

  it('scaleInWithDelay handles custom delay', () => {
    const anim = scaleInWithDelay(10, 0.05)
    expect(anim.transition.delay).toBe(0.5)
    expect(anim.initial.scale).toBe(0.8)
  })

  it('scaleInWithDelay uses default delay', () => {
    const anim = scaleInWithDelay(10)
    expect(anim.transition.delay).toBe(0.2)
  })

  it('fadeIn matches expected structure', () => {
    expect(fadeIn.initial.opacity).toBe(0)
    expect(fadeIn.whileInView.opacity).toBe(1)
    expect(fadeIn.transition.duration).toBe(0.6)
  })

  it('slideInLeft matches expected structure', () => {
    expect(slideInLeft.initial.x).toBe(-30)
    expect(slideInLeft.whileInView.x).toBe(0)
  })

  it('slideInRight matches expected structure', () => {
    expect(slideInRight.initial.x).toBe(30)
    expect(slideInRight.whileInView.x).toBe(0)
  })
})
