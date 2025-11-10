import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-static'

export const alt = 'Ismail Kattakath - Principal Software Engineer & Technical Leader'
export const size = {
  width: 1200,
  height: 600,
}

export const contentType = 'image/png'

export default async function Image() {
  // Read images from filesystem during build and convert to ArrayBuffer
  const backgroundImageBuffer = readFileSync(
    join(process.cwd(), 'public', 'images', 'background.jpg')
  )
  const backgroundImageData = backgroundImageBuffer.buffer.slice(
    backgroundImageBuffer.byteOffset,
    backgroundImageBuffer.byteOffset + backgroundImageBuffer.byteLength
  )

  const profileImageBuffer = readFileSync(
    join(process.cwd(), 'public', 'images', 'profile.jpg')
  )
  const profileImageData = profileImageBuffer.buffer.slice(
    profileImageBuffer.byteOffset,
    profileImageBuffer.byteOffset + profileImageBuffer.byteLength
  )

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
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

        {/* Dark Overlay */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        />

        {/* Profile Image - Centered */}
        <img
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          src={profileImageData as any}
          alt="Ismail Kattakath"
          style={{
            width: 280,
            height: 280,
            borderRadius: '50%',
            objectFit: 'cover',
            border: '6px solid #00d9ff',
            boxShadow: '0 8px 32px rgba(0, 217, 255, 0.4)',
            zIndex: '1',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
