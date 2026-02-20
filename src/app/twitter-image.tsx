import resumeData from '@/lib/resumeAdapter'
import { generateOgImage } from '@/lib/utils/generateOgImage'
import { TWITTER_IMAGE_CONFIG } from '@/lib/utils/ogImageConfigs'

export const dynamic = 'force-static'

export const alt = (resumeData.name || 'Portfolio').toUpperCase()
export const size = {
  width: TWITTER_IMAGE_CONFIG.width,
  height: TWITTER_IMAGE_CONFIG.height,
}

export const contentType = 'image/png'

/**
 * Generates the Twitter card image for the main portfolio page.
 */
export default async function Image() {
  return generateOgImage(TWITTER_IMAGE_CONFIG)
}
