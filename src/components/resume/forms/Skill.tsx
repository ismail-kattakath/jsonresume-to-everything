import React from 'react'
import { useSkillsForm } from '@/hooks/useSkillsForm'
import SortableTagInput from '@/components/ui/SortableTagInput'

interface SkillProps {
  title: string
}

/**
 * Skill form component - displays skills as sortable inline tags with drag-and-drop
 */
const Skill = ({ title }: SkillProps) => {
  const { skills, add, remove, reorder } = useSkillsForm(title)

  return (
    <SortableTagInput
      tags={skills.map((s) => s.text)}
      onAdd={add}
      onRemove={remove}
      onReorder={reorder}
      placeholder={`Add ${title.toLowerCase()}...`}
      variant="pink"
    />
  )
}

export default Skill
