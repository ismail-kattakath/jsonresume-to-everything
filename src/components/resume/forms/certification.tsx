import React from 'react'
import SortableTagInput from '@/components/ui/sortable-tag-input'
import { useSimpleArrayForm } from '@/hooks/use-simple-array-form'

/**
 * Certification form component
 * Displays certifications as sortable inline tags with drag-and-drop
 */
const Certification = () => {
  const { data, add, remove, reorder } = useSimpleArrayForm('certifications')

  return (
    <SortableTagInput
      tags={data}
      onAdd={add}
      onRemove={remove}
      onReorder={reorder}
      placeholder="Add certification..."
      variant="purple"
    />
  )
}

export default Certification
