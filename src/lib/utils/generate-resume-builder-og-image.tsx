import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'
import { BACKGROUND_IMAGE_FILE_PATH } from '@/config/background'

interface ResumeBuilderOgImageConfig {
  width: number
  height: number
}

/**
 * Generate OpenGraph/Twitter card image for Resume Builder page
 * Custom design showcasing AI Resume Builder capabilities
 */
export async function generateResumeBuilderOgImage(config: ResumeBuilderOgImageConfig) {
  const { width, height } = config

  // Read background image from filesystem during build
  const backgroundImageBuffer = readFileSync(join(process.cwd(), BACKGROUND_IMAGE_FILE_PATH))
  const backgroundImageData = backgroundImageBuffer.buffer.slice(
    backgroundImageBuffer.byteOffset,
    backgroundImageBuffer.byteOffset + backgroundImageBuffer.byteLength
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Background Image - Same as homepage with stronger blur */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={backgroundImageData as unknown as string}
          alt="Background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'blur(12px) brightness(0.7)',
          }}
        />

        {/* Rich Dark Overlay - Depth and sophistication */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'linear-gradient(135deg, rgba(0, 0, 0, 0.80) 0%, rgba(17, 24, 39, 0.90) 50%, rgba(0, 0, 0, 0.85) 100%)',
          }}
        />

        {/* Brand Gradient Overlay - Subtle color harmony */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'radial-gradient(ellipse at center, rgba(102, 126, 234, 0.12) 0%, rgba(118, 75, 162, 0.08) 50%, transparent 100%)',
          }}
        />

        {/* Content - Professional hierarchy */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            padding: '80px',
            textAlign: 'center',
            maxWidth: '1100px',
          }}
        >
          {/* Main Title - Bold, high-impact typography */}
          <div
            style={{
              fontSize: '96px',
              fontWeight: 900,
              color: '#ffffff',
              marginBottom: '32px',
              letterSpacing: '-4px',
              lineHeight: 1,
              textShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 4px 16px rgba(102, 126, 234, 0.3)',
            }}
          >
            AI Resume Builder
          </div>

          {/* Brand Accent Line - Visual separator with glow */}
          <div
            style={{
              width: '160px',
              height: '8px',
              background: 'linear-gradient(90deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '4px',
              marginBottom: '40px',
              boxShadow: '0 0 24px rgba(102, 126, 234, 0.8), 0 8px 32px rgba(118, 75, 162, 0.5)',
            }}
          />

          {/* Value Proposition - Clear and compelling */}
          <div
            style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.98)',
              marginBottom: '64px',
              maxWidth: '950px',
              lineHeight: 1.4,
              fontWeight: 500,
              textShadow: '0 4px 16px rgba(0, 0, 0, 0.7)',
            }}
          >
            Build JD-tailored ATS resumes with AI - from JSON Resume or start fresh
          </div>

          {/* Feature Pills - Glassmorphism with depth */}
          <div
            style={{
              display: 'flex',
              gap: '20px',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.30) 0%, rgba(102, 126, 234, 0.20) 100%)',
                border: '2.5px solid rgba(102, 126, 234, 0.6)',
                borderRadius: '60px',
                color: '#ddd6fe',
                fontSize: '26px',
                fontWeight: 700,
                boxShadow: '0 12px 32px rgba(102, 126, 234, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              ✨ AI-Powered
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.30) 0%, rgba(168, 85, 247, 0.20) 100%)',
                border: '2.5px solid rgba(168, 85, 247, 0.6)',
                borderRadius: '60px',
                color: '#f3e8ff',
                fontSize: '26px',
                fontWeight: 700,
                boxShadow: '0 12px 32px rgba(168, 85, 247, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              👁️ Real-time Preview
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 32px',
                background: 'linear-gradient(135deg, rgba(236, 72, 153, 0.30) 0%, rgba(236, 72, 153, 0.20) 100%)',
                border: '2.5px solid rgba(236, 72, 153, 0.6)',
                borderRadius: '60px',
                color: '#fce7f3',
                fontSize: '26px',
                fontWeight: 700,
                boxShadow: '0 12px 32px rgba(236, 72, 153, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(8px)',
              }}
            >
              📄 JSON Resume
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  )
}
