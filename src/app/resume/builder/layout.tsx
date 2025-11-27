import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Resume Builder',
  description:
    'Build and customize your resume with AI-powered suggestions and export to multiple formats',
}

export default function ResumeBuilderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
