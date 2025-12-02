import React, { useContext } from 'react'
import { VscJson } from 'react-icons/vsc'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { convertToJSONResume, convertFromJSONResume } from '@/lib/jsonResume'
import { validateJSONResume } from '@/lib/jsonResumeSchema'
import { toast } from 'sonner'
import { analytics } from '@/lib/analytics'
import { generateJSONFilename } from '@/lib/filenameGenerator'
import type { ResumeData } from '@/types/resume'

interface ImportExportProps {
  preserveContent?: boolean
}

const ImportExport = ({ preserveContent = false }: ImportExportProps) => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  // migrate old skills format to new format
  const migrateSkillsData = (data: ResumeData) => {
    const migratedData = { ...data }
    if (migratedData.skills) {
      migratedData.skills = migratedData.skills.map((skillCategory) => ({
        ...skillCategory,
        skills: skillCategory.skills.map((skill) => {
          if (typeof skill === 'string') {
            return { text: skill, highlight: false }
          }
          // Handle old 'underline' property
          if ('underline' in skill && skill.highlight === undefined) {
            return {
              text: skill.text,
              highlight: (skill as { underline: boolean }).underline,
            }
          }
          return skill
        }),
      }))
    }
    return migratedData
  }

  // import resume data - supports both internal format and JSON Resume format
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        toast.loading('Processing resume data...', { id: 'import-resume' })

        const loadedData = JSON.parse(event.target?.result as string)

        // Check if it's JSON Resume format (has $schema or basics field)
        const isJSONResume =
          loadedData.$schema?.includes('jsonresume') || loadedData.basics

        if (isJSONResume) {
          // Validate JSON Resume format
          const validation = validateJSONResume(loadedData)

          if (!validation.valid) {
            toast.error(
              `Invalid JSON Resume format:\n${validation.errors.join('\n')}`,
              { id: 'import-resume', duration: 5000 }
            )
            return
          }

          // Convert from JSON Resume to internal format
          const convertedData = convertFromJSONResume(loadedData)

          if (!convertedData) {
            toast.error('Failed to convert JSON Resume format', {
              id: 'import-resume',
            })
            return
          }

          // Preserve cover letter content if flag is set
          if (preserveContent && resumeData.content) {
            convertedData.content = resumeData.content
          }

          setResumeData(convertedData)
          toast.success('JSON Resume imported successfully!', {
            id: 'import-resume',
          })
          analytics.resumeImport('JSON Resume', true)
        } else {
          // Handle internal format (legacy)
          const migratedData = migrateSkillsData(loadedData)

          // Preserve cover letter content if flag is set
          if (preserveContent && resumeData.content) {
            migratedData.content = resumeData.content
          }

          setResumeData(migratedData)
          toast.success('Resume data imported successfully!', {
            id: 'import-resume',
          })
          analytics.resumeImport('Internal Format', true)
        }
      } catch (error) {
        toast.error(`Failed to import resume: ${(error as Error).message}`, {
          id: 'import-resume',
          duration: 5000,
        })
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read file', { id: 'import-resume' })
    }

    reader.readAsText(file)
  }

  // export resume data in JSON Resume format
  const handleExport = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault()

    try {
      toast.loading('Generating JSON Resume...', { id: 'export-resume' })

      const jsonResumeData = convertToJSONResume(resumeData)
      const jsonData = JSON.stringify(jsonResumeData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = generateJSONFilename(resumeData.name, resumeData.position)
      link.click()

      toast.success('JSON Resume exported successfully!', {
        id: 'export-resume',
      })

      // Track export event
      const sectionsCount = Object.keys(resumeData).filter(
        (key) => resumeData[key as keyof ResumeData]
      ).length
      analytics.resumeExport('JSON', sectionsCount)
    } catch (error) {
      toast.error(`Failed to export resume: ${(error as Error).message}`, {
        id: 'export-resume',
        duration: 5000,
      })
    }
  }

  return (
    <div className="group">
      <p className="mb-3 text-sm text-white/60">
        Import or export your resume in JSON Resume format for portability
        across different resume tools.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="group/btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
          <VscJson className="text-lg transition-transform group-hover/btn:rotate-12" />
          <span>Import JSON Resume</span>
          <input
            aria-label="Import JSON Resume"
            type="file"
            className="hidden"
            onChange={handleImport}
            accept=".json"
          />
        </label>

        <button
          aria-label="Export JSON Resume"
          className="group/btn inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          onClick={handleExport}
        >
          <VscJson className="text-lg transition-transform group-hover/btn:rotate-12" />
          <span>Export JSON Resume</span>
        </button>
      </div>
    </div>
  )
}

export default ImportExport
