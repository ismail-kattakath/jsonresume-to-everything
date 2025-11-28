import React from 'react'
import SortableTagInput from '@/components/ui/SortableTagInput'
import { useSimpleArrayForm } from '@/hooks/useSimpleArrayForm'

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
