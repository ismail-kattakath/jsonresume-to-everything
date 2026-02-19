import React, { useContext } from 'react'
import dynamic from 'next/dynamic'
import FormButton from '@/components/ui/FormButton'
import { FormInput } from '@/components/ui/FormInput'
import { FormTextarea } from '@/components/ui/FormTextarea'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { DeleteButton } from '@/components/ui/DeleteButton'
import { useArrayForm } from '@/hooks/useArrayForm'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { DropResult } from '@hello-pangea/dnd'
import type { Project } from '@/types'
import ProjectKeyAchievements from '@/components/resume/forms/ProjectKeyAchievements'
import SortableTagInput from '@/components/ui/SortableTagInput'

const DragDropContext = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.DragDropContext
    }),
  { ssr: false }
)
const Droppable = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.Droppable
    }),
  { ssr: false }
)
const Draggable = dynamic(
  () =>
    import('@hello-pangea/dnd').then((mod) => {
      return mod.Draggable
    }),
  { ssr: false }
)

/**
 * Projects form component
 */
const Projects = () => {
  const { resumeData, setResumeData } = useContext(ResumeContext)
  const { data, handleChange, add, remove } = useArrayForm<Project>('projects', {
    name: '',
    link: '',
    description: '',
    keyAchievements: [],
    keywords: [],
    startYear: '',
    endYear: '',
  })

  const onDragEnd = (result: any) => {
    const { destination, source } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    const newProjects = [...(resumeData.projects || [])]
    const [removed] = newProjects.splice(source.index, 1)
    if (removed) {
      newProjects.splice(destination.index, 0, removed)
      setResumeData({ ...resumeData, projects: newProjects })
    }
  }

  const handleAddKeyword = (index: number, keyword: string) => {
    const project = resumeData.projects?.[index]
    if (!project) return

    const newProjects = [...(resumeData.projects || [])]
    const keywords = project.keywords || []
    newProjects[index] = {
      ...project,
      keywords: [...keywords, keyword],
    }
    setResumeData({ ...resumeData, projects: newProjects })
  }

  const handleRemoveKeyword = (index: number, keywordIndex: number) => {
    const project = resumeData.projects?.[index]
    if (!project) return

    const newProjects = [...(resumeData.projects || [])]
    const keywords = [...(project.keywords || [])]
    keywords.splice(keywordIndex, 1)
    newProjects[index] = {
      ...project,
      keywords,
    }
    setResumeData({ ...resumeData, projects: newProjects })
  }

  const handleReorderKeyword = (
    index: number,
    startIndex: number,
    endIndex: number
  ) => {
    const project = resumeData.projects?.[index]
    if (!project) return

    const newProjects = [...(resumeData.projects || [])]
    const keywords = [...(project.keywords || [])]
    const [removed] = keywords.splice(startIndex, 1)
    if (removed) {
      keywords.splice(endIndex, 0, removed)
      newProjects[index] = {
        ...project,
        keywords,
      }
      setResumeData({ ...resumeData, projects: newProjects })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionHeader title="Projects" variant="teal" />

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="projects">
          {(provided) => (
            <div
              className="flex flex-col gap-3"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {data.map((project, index) => (
                <Draggable
                  key={`PROJECT-${index}`}
                  draggableId={`PROJECT-${index}`}
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={`group flex cursor-grab flex-col gap-3 rounded-lg border border-white/10 bg-white/5 p-4 hover:border-white/20 hover:bg-white/10 active:cursor-grabbing ${snapshot.isDragging
                        ? 'bg-white/20 outline-2 outline-purple-400 outline-dashed'
                        : ''
                        }`}
                    >
                      <FormInput
                        label="Project Name"
                        name="name"
                        value={project.name}
                        onChange={(e) => handleChange(e, index)}
                        variant="teal"
                      />

                      <FormInput
                        label="Link"
                        name="link"
                        type="url"
                        value={project.link}
                        onChange={(e) => handleChange(e, index)}
                        variant="teal"
                      />

                      <FormTextarea
                        label="Description"
                        name="description"
                        value={project.description}
                        onChange={(e) => handleChange(e, index)}
                        variant="teal"
                        maxLength={250}
                        showCounter
                        minHeight="120px"
                      />

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                          Highlights
                        </label>
                        <ProjectKeyAchievements
                          projectIndex={index}
                          variant="teal"
                        />
                      </div>

                      <div>
                        <label className="mb-2 block text-sm font-medium text-white">
                          Keywords
                        </label>
                        <SortableTagInput
                          tags={project.keywords || []}
                          onAdd={(tag) => handleAddKeyword(index, tag)}
                          onRemove={(tagIndex) =>
                            handleRemoveKeyword(index, tagIndex)
                          }
                          onReorder={(startIndex, endIndex) =>
                            handleReorderKeyword(index, startIndex, endIndex)
                          }
                          placeholder="Add keywords..."
                          variant="teal"
                        />
                      </div>

                      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
                        <FormInput
                          label="Start Year"
                          name="startYear"
                          type="date"
                          value={project.startYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />

                        <FormInput
                          label="End Year"
                          name="endYear"
                          type="date"
                          value={project.endYear}
                          onChange={(e) => handleChange(e, index)}
                          variant="teal"
                          className="flex-1"
                        />

                        <DeleteButton
                          onClick={() => remove(index)}
                          label="Delete this project"
                        />
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <FormButton size={data.length} add={add} label="Project" />
    </div>
  )
}

export default Projects
