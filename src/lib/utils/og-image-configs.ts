/**
 * OpenGraph and Twitter image configuration
 * Centralized to maintain consistency across social media previews
 */

/**
 * OpenGraph image configuration (1.91:1 ratio)
 * Used for Facebook, LinkedIn, and general social sharing
 */
export const OG_IMAGE_CONFIG = {
  width: 1200,
  height: 630,
  logoWidth: 600,
  logoHeight: 337,
} as const

/**
 * Twitter image configuration (2:1 ratio)
 * Optimized for Twitter's card format
 */
export const TWITTER_IMAGE_CONFIG = {
  width: 1200,
  height: 600,
  logoWidth: 560,
  logoHeight: 315,
} as const
