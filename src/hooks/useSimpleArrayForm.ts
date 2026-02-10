import { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData } from '@/types'

/**
 * Hook for managing simple string array fields (certifications, languages)
 * Simpler than useArrayForm since items are just strings, not objects
 */
export function useSimpleArrayForm(dataKey: 'certifications' | 'languages') {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const data = (resumeData[dataKey] as string[]) || []

  /**
   * Handle value change at specific index
   */
  const handleChange = (index: number, value: string) => {
    const newData = [...data]
    newData[index] = value
    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Add new item (empty or with value)
   */
  const add = (value: string = '') => {
    setResumeData({
      ...resumeData,
      [dataKey]: [...data, value],
    })
  }

  /**
   * Remove item by index
   */
  const remove = (index: number) => {
    const newData = data.filter((_, i) => i !== index)
    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Reorder items via drag and drop
   */
  const reorder = (startIndex: number, endIndex: number) => {
    const newData = [...data]
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
