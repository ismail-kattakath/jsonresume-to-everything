import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const dynamic = 'force-static'

export const alt = 'Ismail Kattakath - Principal Software Engineer & Technical Leader'
export const size = {
  width: 1200,
  height: 600,
}

export const contentType = 'image/png'

export default async function Image() {
  // Fetch the background image
  const backgroundImageData = await fetch(
    new URL('../../public/images/background.jpg', import.meta.url)
  ).then((res) => res.arrayBuffer())

  // Fetch the profile image
  const profileImageData = await fetch(
    new URL('../../public/images/profile.jpg', import.meta.url)
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Background Image */}
        <img
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={backgroundImageData as any}
          alt="Background"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />

        {/* Dark Overlay for better text readability */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.4)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
            padding: '60px',
          }}
        >
          {/* Profile Image */}
          <img
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            src={profileImageData as any}
            alt="Ismail Kattakath"
            style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #00d9ff',
              marginBottom: 24,
            }}
          />

          {/* Name */}
          <h1
            style={{
              fontSize: 64,
              fontWeight: 700,
              color: '#e3e1f0',
              margin: 0,
              marginBottom: 16,
              textAlign: 'center',
            }}
          >
            Ismail Kattakath
          </h1>

          {/* Title */}
          <h2
            style={{
              fontSize: 32,
              fontWeight: 500,
              color: '#00d9ff',
              margin: 0,
              marginBottom: 24,
              textAlign: 'center',
            }}
          >
            Principal Software Engineer & Technical Leader
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 22,
              color: '#c3c1d0',
              margin: 0,
              textAlign: 'center',
              maxWidth: 900,
              lineHeight: 1.3,
            }}
          >
            15+ Years Architecting Full-Stack & AI/ML Solutions
          </p>

          {/* Tech Stack Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 32,
              justifyContent: 'center',
              maxWidth: 900,
            }}
          >
            {['OAuth/SSO', 'CI/CD', 'Kubernetes', 'MCP', 'RAG', 'GenAI'].map((tech) => (
              <div
                key={tech}
                style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '2px solid #00d9ff',
                  borderRadius: 8,
                  padding: '6px 16px',
                  fontSize: 16,
                  color: '#00d9ff',
                  fontWeight: 500,
                }}
              >
                {tech}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
