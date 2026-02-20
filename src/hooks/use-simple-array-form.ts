import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/document-context'
import type { Certification } from '@/types'

/**
 * Hook for managing simple array fields (certifications, languages)
 * Handles mapping between UI strings and underlying objects for certifications
 */
export function useSimpleArrayForm(dataKey: 'certifications' | 'languages') {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  // eslint-disable-next-line security/detect-object-injection
  const rawData = resumeData[dataKey] || []

  // Map to strings for the UI
  const data = (
    dataKey === 'certifications' ? (rawData as Certification[]).map((c) => c.name) : (rawData as string[])
  ) as string[]

  /**
   * Handle value change at specific index
   */
  const handleChange = (index: number, value: string) => {
    const newData = [...rawData] as unknown[]
    if (dataKey === 'certifications') {
      const current = (newData[index] as Certification) || {
        name: '',
        date: '',
        issuer: '',
        url: '',
      }
      newData[index] = { ...current, name: value }
    } else {
      newData[index] = value
    }
    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Add new item (empty or with value)
   */
  const add = (value: string = '') => {
    const newItem = dataKey === 'certifications' ? { name: value, date: '', issuer: '', url: '' } : value

    setResumeData({
      ...resumeData,
      [dataKey]: [...rawData, newItem],
    })
  }

  /**
   * Remove item by index
   */
  const remove = (index: number) => {
    const newData = rawData.filter((_, i) => i !== index)
    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Reorder items via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    const newData = [...rawData]
    const [removed] = newData.splice(startIndex, 1)
    if (removed !== undefined) {
      newData.splice(endIndex, 0, removed)
    }
    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  return {
    data,
    handleChange,
    add,
    remove,
    reorder,
  }
}
