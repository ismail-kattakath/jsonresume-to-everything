import React from 'react'
import SortableTagInput from '@/components/ui/sortable-tag-input'
import { useSimpleArrayForm } from '@/hooks/use-simple-array-form'

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
