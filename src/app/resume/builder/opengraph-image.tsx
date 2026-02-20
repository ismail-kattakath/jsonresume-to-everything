import { generateResumeBuilderOgImage } from '@/lib/utils/generateResumeBuilderOgImage'
import { OG_IMAGE_CONFIG } from '@/lib/utils/ogImageConfigs'

export const dynamic = 'force-static'

export const alt = 'AI Resume Builder - Build Professional Resumes with AI'
export const size = {
  width: OG_IMAGE_CONFIG.width,
  height: OG_IMAGE_CONFIG.height,
}

export const contentType = 'image/png'

/**
 * Generates the OpenGraph image for the AI Resume Builder page.
 */
export default async function Image() {
  return generateResumeBuilderOgImage(OG_IMAGE_CONFIG)
}
