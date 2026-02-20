/**
 * Framer Motion animation presets
 * Centralized to maintain consistency across homepage sections
 */

// import type { Variants } from 'framer-motion'

/**
 * Common viewport configuration for animations
 * Animations trigger once when element enters viewport
 */
const VIEWPORT_CONFIG = { once: true }

/**
 * Fade in from below animation (large movement)
 * Used for section titles and major content blocks
 *
 * @example
 * <motion.div {...fadeInUp}>
 *   <h2>Title</h2>
 * </motion.div>
 */
export const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
  viewport: VIEWPORT_CONFIG,
} as const

/**
 * Fade in from below animation with staggered delay
 * Used for lists, cards, and repeated elements
 *
 * @param index - Element index for stagger delay
 * @param delayMultiplier - Delay between elements (default: 0.1s)
 *
 * @example
 * {items.map((item, index) => (
 *   <motion.div key={index} {...fadeInUpWithDelay(index)}>
 *     {item}
 *   </motion.div>
 * ))}
 */
export const fadeInUpWithDelay = (index: number, delayMultiplier = 0.1) =>
  ({
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: index * delayMultiplier },
    viewport: VIEWPORT_CONFIG,
  }) as const

/**
 * Scale in animation (zoom effect)
 * Used for badges, tags, and emphasis elements
 *
 * @example
 * <motion.span {...scaleIn}>
 *   Badge
 * </motion.span>
 */
export const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  whileInView: { opacity: 1, scale: 1 },
  transition: { duration: 0.5 },
  viewport: VIEWPORT_CONFIG,
} as const

/**
 * Scale in animation with staggered delay (fast)
 * Used for skill tags, chips, and small repeated elements
 *
 * @param index - Element index for stagger delay
 * @param delayMultiplier - Delay between elements (default: 0.02s)
 *
 * @example
 * {skills.map((skill, index) => (
 *   <motion.span key={index} {...scaleInWithDelay(index)}>
 *     {skill}
 *   </motion.span>
 * ))}
 */
export const scaleInWithDelay = (index: number, delayMultiplier = 0.02) =>
  ({
    initial: { opacity: 0, scale: 0.8 },
    whileInView: { opacity: 1, scale: 1 },
    transition: { duration: 0.3, delay: index * delayMultiplier },
    viewport: VIEWPORT_CONFIG,
  }) as const

/**
 * Fade in animation (no movement)
 * Used for simple opacity transitions
 *
 * @example
 * <motion.div {...fadeIn}>
 *   <p>Content</p>
 * </motion.div>
 */
export const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  transition: { duration: 0.6 },
  viewport: VIEWPORT_CONFIG,
} as const

/**
 * Slide in from left animation
 * Used for horizontal reveals and side panels
 *
 * @example
 * <motion.div {...slideInLeft}>
 *   <aside>Sidebar</aside>
 * </motion.div>
 */
export const slideInLeft = {
  initial: { opacity: 0, x: -30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: VIEWPORT_CONFIG,
} as const

/**
 * Slide in from right animation
 * Used for horizontal reveals and side panels
 *
 * @example
 * <motion.div {...slideInRight}>
 *   <aside>Sidebar</aside>
 * </motion.div>
 */
export const slideInRight = {
  initial: { opacity: 0, x: 30 },
  whileInView: { opacity: 1, x: 0 },
  transition: { duration: 0.6 },
  viewport: VIEWPORT_CONFIG,
} as const
