import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ATS Resume Builder | Ismail Kattakath',
  description: 'Create ATS-optimized resumes with our professional resume builder',
}

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#ffffff',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 1,
      overflow: 'auto'
    }}>
      {children}
    </div>
  )
}
