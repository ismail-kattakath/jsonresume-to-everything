import { VscJson } from 'react-icons/vsc'
import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import { convertToJSONResume, convertFromJSONResume } from '@/lib/jsonResume'
import { validateJSONResume } from '@/lib/jsonResumeSchema'
import { toast } from 'sonner'
import PrintButton from '@/components/document-builder/ui/PrintButton'
import { generateJSONFilename } from '@/lib/filenameGenerator'
import type { ResumeData, SkillGroup } from '@/types'

interface LoadUnloadProps {
  hideExportButton?: boolean
  preserveContent?: boolean
  hidePrintButton?: boolean
}

const LoadUnload = ({
  hideExportButton = false,
  preserveContent = false,
  hidePrintButton = false,
}: LoadUnloadProps) => {
  const { resumeData, setResumeData } = useContext(ResumeContext)

  // migrate old skills format to new format
  const migrateSkillsData = (data: any): ResumeData => {
    const migratedData = { ...data }
    if (migratedData.skills) {
      migratedData.skills = migratedData.skills.map(
        (skillCategory: SkillGroup) => ({
          ...skillCategory,
          skills: (skillCategory.skills || []).map((skill: any) => {
            if (typeof skill === 'string') {
              return { text: skill, highlight: false }
            }
            // Handle old 'underline' property
            if (
              skill.underline !== undefined &&
              skill.highlight === undefined
            ) {
              return { text: skill.text, highlight: skill.underline }
            }
            return skill
          }),
        })
      )
    }
    return migratedData as ResumeData
  }

  // import resume data - supports both internal format and JSON Resume format
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        toast.loading('Processing resume data...', { id: 'import-resume' })

        if (!e.target?.result) {
          throw new Error('Failed to read file content')
        }

        const loadedData = JSON.parse(e.target.result as string)

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
        }
      } catch (error) {
        toast.error(
          `Failed to import resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
          {
            id: 'import-resume',
            duration: 5000,
          }
        )
      }
    }

    reader.onerror = () => {
      toast.error('Failed to read file', { id: 'import-resume' })
    }

    reader.readAsText(file)
  }

  // export resume data in JSON Resume format
  const handleExport = (
    data: ResumeData,
    filename: string,
    event: React.MouseEvent
  ) => {
    event.preventDefault()

    try {
      toast.loading('Generating JSON Resume...', { id: 'export-resume' })

      const jsonResumeData = convertToJSONResume(data)
      const jsonData = JSON.stringify(jsonResumeData, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.download = filename
      link.click()

      toast.success('JSON Resume exported successfully!', {
        id: 'export-resume',
      })
    } catch (error) {
      toast.error(
        `Failed to export resume: ${error instanceof Error ? error.message : 'Unknown error'}`,
        {
          id: 'export-resume',
          duration: 5000,
        }
      )
    }
  }

  return (
    <div
      className={`mx-auto mb-4 grid max-w-3xl gap-3 ${hideExportButton && hidePrintButton ? 'grid-cols-1' : hideExportButton || hidePrintButton ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-3'}`}
    >
      <label className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]">
        <VscJson className="text-lg transition-transform group-hover:rotate-12" />
        <span>Import Json Resume</span>
        <input
          aria-label="Import Json Resume"
          type="file"
          className="hidden"
          onChange={handleImport}
          accept=".json"
        />
      </label>
      {!hideExportButton && (
        <button
          aria-label="Export Json Resume"
          className="group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-medium text-white transition-all hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
          onClick={(event) =>
            handleExport(
              resumeData,
              generateJSONFilename(resumeData.name, resumeData.position),
              event
            )
          }
        >
          <VscJson className="text-lg transition-transform group-hover:rotate-12" />
          <span>Export Json Resume</span>
        </button>
      )}
      {!hidePrintButton && <PrintButton />}
    </div>
  )
}

export default LoadUnload
