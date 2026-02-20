import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const scriptFilename = fileURLToPath(import.meta.url)
const scriptDirname = path.dirname(scriptFilename)

export async function downloadResume() {
  const gistUrl = process.env.RESUME_GIST_URL

  if (!gistUrl) {
    console.warn('RESUME_GIST_URL is not defined in environment variables. Skipping download.')
    const targetPath = path.join(scriptDirname, '../src/data/resume.json')
    if (!fs.existsSync(targetPath)) {
      console.error('src/data/resume.json does not exist and RESUME_GIST_URL is missing.')
    }
    return
  }

  console.log(`Downloading resume from ${gistUrl}...`)

  try {
    const response = await fetch(gistUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch resume: ${response.statusText}`)
    }

    const data = await response.json()
    const targetDir = path.join(scriptDirname, '../src/data')
    const targetPath = path.join(targetDir, 'resume.json')

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    fs.writeFileSync(targetPath, JSON.stringify(data, null, 2))
    console.log(`Successfully downloaded and saved to ${targetPath}`)
  } catch (error) {
    console.error('Error downloading resume:', error.message)
    process.exit(1)
  }
}

// Only execute if run directly
if (process.argv[1] === scriptFilename) {
  downloadResume()
}
