import resumeData from '@/lib/resumeAdapter'
import { generateOgImage } from '@/lib/utils/generateOgImage'
import { OG_IMAGE_CONFIG } from '@/lib/utils/ogImageConfigs'

export const dynamic = 'force-static'

export const alt = (resumeData.name || 'Portfolio').toUpperCase()
export const size = {
  width: OG_IMAGE_CONFIG.width,
  height: OG_IMAGE_CONFIG.height,
}

export const contentType = 'image/png'

/**
 * Generates the OpenGraph image for the main portfolio page.
 */
export default async function Image() {
  return generateOgImage(OG_IMAGE_CONFIG)
}
