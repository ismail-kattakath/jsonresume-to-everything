import { useContext, ChangeEvent } from 'react'
import { ResumeContext } from '@/lib/contexts/document-context'
import { stripProtocol } from '@/lib/utils/url-helpers'
import type { ResumeData } from '@/types'

interface UseArrayFormOptions<T> {
  urlFields?: (keyof T)[]
  transformValue?: (fieldName: keyof T, value: string, item: T, index: number) => string
}

/**
 * Generic hook for managing array form data with CRUD operations
 * Eliminates ~800 lines of duplicated CRUD logic across form components
 *
 * @param dataKey - Key in ResumeData that contains the array
 * @param initialItem - Template object for new items
 * @param options - Optional configuration for URL handling and value transformation
 *
 * @example
 * const { data, handleChange, add, remove } = useArrayForm('workExperience', {
 *   organization: '',
 *   position: '',
 *   startYear: '',
 *   endYear: '',
 * }, { urlFields: ['url'] })
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useArrayForm<T extends Record<string, any>>(
  dataKey: keyof ResumeData,
  initialItem: T,
  options: UseArrayFormOptions<T> = {}
) {
  const context = useContext(ResumeContext)
  const { resumeData, setResumeData } = context
  // eslint-disable-next-line security/detect-object-injection
  const data = (resumeData[dataKey] as unknown as T[]) || []

  /**
   * Handle input change for array items
   */
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, index: number) => {
    const newData = [...data]
    const { name, value } = e.target

    let processedValue = value

    // Apply URL sanitization if field is marked as URL field
    if (options.urlFields?.includes(name as keyof T)) {
      processedValue = stripProtocol(value)
    }

    // Apply custom transformation if provided
    if (options.transformValue) {
      processedValue = options.transformValue(name as keyof T, processedValue, newData[index]!, index)
    }

    newData[index] = { ...newData[index], [name]: processedValue } as T

    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Add new item to array
   */
  const add = () => {
    setResumeData({
      ...resumeData,
      [dataKey]: [...data, initialItem],
    })
  }

  /**
   * Remove item from array by index
   */
  const remove = (index: number) => {
    const newData = data.filter((_, i) => i !== index)

    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  /**
   * Update specific field in an item (useful for complex updates)
   */
  const updateField = <K extends keyof T>(index: number, fieldName: K, value: T[K]) => {
    const newData = [...data]
    newData[index] = { ...newData[index], [fieldName]: value } as T

    setResumeData({ ...resumeData, [dataKey]: newData })
  }

  return {
    data,
    handleChange,
    add,
    remove,
    updateField,
  }
}
