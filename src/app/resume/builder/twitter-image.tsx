import { generateResumeBuilderOgImage } from '@/lib/utils/generate-resume-builder-og-image'
import { TWITTER_IMAGE_CONFIG } from '@/lib/utils/og-image-configs'

export const dynamic = 'force-static'

export const alt = 'AI Resume Builder - Build Professional Resumes with AI'
export const size = {
  width: TWITTER_IMAGE_CONFIG.width,
  height: TWITTER_IMAGE_CONFIG.height,
}

export const contentType = 'image/png'

/**
 * Generates the Twitter card image for the AI Resume Builder page.
 */
export default async function Image() {
  return generateResumeBuilderOgImage(TWITTER_IMAGE_CONFIG)
}
