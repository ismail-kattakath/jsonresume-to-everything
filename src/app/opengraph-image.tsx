import { ImageResponse } from 'next/og'

// Remove edge runtime since it doesn't support fs operations
// export const runtime = 'edge'
export const dynamic = 'force-static'

export const alt = 'Ismail Kattakath - Principal Software Engineer & Technical Leader'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
  // Use public URLs to fetch images
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

  const backgroundImageData = await fetch(`${baseUrl}/images/background.jpg`).then((res) =>
    res.arrayBuffer()
  )

  const profileImageData = await fetch(`${baseUrl}/images/profile.jpg`).then((res) =>
    res.arrayBuffer()
  )

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
        {/* Background Image with blur effect applied directly */}
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
            filter: 'blur(4px)',
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
            background: 'rgba(0, 0, 0, 0.5)',
          }}
        />

        {/* Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: '1',
            padding: '80px',
          }}
        >
          {/* Profile Image */}
          <img
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            src={profileImageData as any}
            alt="Ismail Kattakath"
            style={{
              width: 200,
              height: 200,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '4px solid #00d9ff',
              marginBottom: 30,
            }}
          />

          {/* Name */}
          <h1
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#e3e1f0',
              margin: 0,
              marginBottom: 20,
              textAlign: 'center',
            }}
          >
            Ismail Kattakath
          </h1>

          {/* Title */}
          <h2
            style={{
              fontSize: 36,
              fontWeight: 500,
              color: '#00d9ff',
              margin: 0,
              marginBottom: 30,
              textAlign: 'center',
            }}
          >
            Principal Software Engineer & Technical Leader
          </h2>

          {/* Description */}
          <p
            style={{
              fontSize: 24,
              color: '#c3c1d0',
              margin: 0,
              textAlign: 'center',
              maxWidth: 1000,
              lineHeight: 1.4,
            }}
          >
            15+ Years Architecting Full-Stack & AI/ML Solutions
          </p>

          {/* Tech Stack Pills */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              marginTop: 40,
              justifyContent: 'center',
              maxWidth: 1000,
            }}
          >
            {['OAuth/SSO', 'CI/CD', 'Kubernetes', 'MCP Gateways', 'RAG Systems', 'GenAI'].map((tech) => (
              <div
                key={tech}
                style={{
                  background: 'rgba(0, 217, 255, 0.1)',
                  border: '2px solid #00d9ff',
                  borderRadius: 8,
                  padding: '8px 20px',
                  fontSize: 18,
                  color: '#00d9ff',
                  fontWeight: 500,
                }}
              >
                {tech}
              </div>
            ))}
          </div>

          {/* Website */}
          <div
            style={{
              marginTop: 40,
              fontSize: 20,
              color: '#9e9cb0',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            🌐 ismail.kattakath.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
