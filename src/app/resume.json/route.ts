import { NextResponse } from 'next/server'
import { convertToJSONResume } from '@/lib/json-resume'

export const dynamic = 'force-static'

/**
 * API route that returns the resume data in JSON Resume format.
 */
export async function GET() {
  const jsonResume = convertToJSONResume()

  return NextResponse.json(jsonResume, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
