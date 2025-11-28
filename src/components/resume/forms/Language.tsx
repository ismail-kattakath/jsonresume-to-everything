import React from 'react'
import SortableTagInput from '@/components/ui/SortableTagInput'
import { useSimpleArrayForm } from '@/hooks/useSimpleArrayForm'

/**
 * Language form component
 * Displays languages as sortable inline tags with drag-and-drop
 */
const Language = () => {
  const { data, add, remove, reorder } = useSimpleArrayForm('languages')

  return (
    <SortableTagInput
      tags={data}
      onAdd={add}
      onRemove={remove}
      onReorder={reorder}
      placeholder="Add language..."
      variant="purple"
    />
  )
}

export default Language
