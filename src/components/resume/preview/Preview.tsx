import {
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaInstagram,
  FaYoutube,
  FaBold,
  FaItalic,
  FaPlus,
  FaMinus,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaUnderline,
  FaGlobe,
} from 'react-icons/fa'
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md'
import Skills from '@/components/resume/preview/Skills'
import DateRange from '@/lib/utils/DateRange'
import ContactInfo from '@/components/document-builder/shared-preview/ContactInfo'
import { formatUrl } from '@/lib/utils/formatUrl'
import Image from 'next/image'
import React, { useContext } from 'react'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import dynamic from 'next/dynamic'
import Language from '@/components/resume/preview/Language'
import Certification from '@/components/resume/preview/Certification'
import useKeyboardShortcut from '@/hooks/useKeyboardShortcut'
import { useAISettings } from '@/lib/contexts/AISettingsContext'
import { Highlight } from '@/components/ui/Highlight'

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
const HighlightMenu = dynamic(
  () =>
    import('react-highlight-menu').then((mod) => {
      return mod.HighlightMenu
    }),
  { ssr: false }
)

const Preview = () => {
  const { settings } = useAISettings()
  const {
    resumeData,
    setResumeData,
    editable = true,
  } = useContext(ResumeContext)
  const icons = [
    { name: 'github', icon: <FaGithub /> },
    { name: 'linkedin', icon: <FaLinkedin /> },
    { name: 'twitter', icon: <FaTwitter /> },
    { name: 'facebook', icon: <FaFacebook /> },
    { name: 'instagram', icon: <FaInstagram /> },
    { name: 'youtube', icon: <FaYoutube /> },
    { name: 'website', icon: <FaGlobe /> },
  ]

  const onDragEnd = (result: any) => {
    const { destination, source } = result

    if (!destination) return

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return

    if (source.droppableId === 'work-experience') {
      const newWorkExperience = [...resumeData.workExperience]
      const [removed] = newWorkExperience.splice(source.index, 1)
      if (removed) {
        newWorkExperience.splice(destination.index, 0, removed)
        setResumeData({ ...resumeData, workExperience: newWorkExperience })
      }
    }

    if (source.droppableId.includes('WORK_EXPERIENCE_KEY_ACHIEVEMENT')) {
      const newWorkExperience = [...resumeData.workExperience]
      const workExperienceIndex = parseInt(source.droppableId.split('-')[1])
      const workExp = newWorkExperience[workExperienceIndex]
      if (workExp && workExp.keyAchievements) {
        const keyAchievements = [...workExp.keyAchievements]
        const [removed] = keyAchievements.splice(source.index, 1)
        if (removed) {
          keyAchievements.splice(destination.index, 0, removed)
          workExp.keyAchievements = keyAchievements
          setResumeData({ ...resumeData, workExperience: newWorkExperience })
        }
      }
    }

    if (source.droppableId === 'skills') {
      const newSkills = [...resumeData.skills]
      const [removed] = newSkills.splice(source.index, 1)
      if (removed) {
        newSkills.splice(destination.index, 0, removed)
        setResumeData({ ...resumeData, skills: newSkills })
      }
    }

    if (source.droppableId.includes('projects') && resumeData.projects) {
      const newProjects = [...resumeData.projects]
      const [removed] = newProjects.splice(source.index, 1)
      if (removed) {
        newProjects.splice(destination.index, 0, removed)
        setResumeData({ ...resumeData, projects: newProjects })
      }
    }

    if (
      source.droppableId.includes('PROJECTS_KEY_ACHIEVEMENT') &&
      resumeData.projects
    ) {
      const newProjects = [...resumeData.projects]
      const projectIndex = parseInt(source.droppableId.split('-')[1])
      const project = newProjects[projectIndex]
      if (project && project.keyAchievements) {
        const keyAchievements = [...project.keyAchievements]
        const [removed] = keyAchievements.splice(source.index, 1)
        if (removed) {
          keyAchievements.splice(destination.index, 0, removed)
          project.keyAchievements = keyAchievements
          setResumeData({ ...resumeData, projects: newProjects })
        }
      }
    }
  }

  const MenuButton = ({
    title,
    icon,
    onClick,
  }: {
    title: string
    icon: React.ReactNode
    onClick: () => void
  }) => (
    <button
      onClick={onClick}
      title={title}
      className="rounded p-2 font-semibold hover:bg-gray-200"
    >
      {icon}
    </button>
  )

  const formatText = (command: string, value: string | null = null) => {
    document.execCommand(command, false, value || undefined)
  }

  const toggleBold = () => formatText('bold')
  const toggleItalic = () => formatText('italic')
  const toggleUnderline = () => formatText('underline')
  const changeFontSize = (size: string) => formatText('fontSize', size)
  const alignText = (alignment: string) => formatText(`justify${alignment}`)

  useKeyboardShortcut('b', true, toggleBold)
  useKeyboardShortcut('i', true, toggleItalic)
  useKeyboardShortcut('u', true, toggleUnderline)

  return (
    <div className="preview rm-padding-print w-full bg-white p-6 text-black md:min-h-[11in] md:w-[8.5in]">
      <A4PageWrapper>
        <HighlightMenu
          styles={{
            borderColor: '#C026D3',
            backgroundColor: '#C026D3',
            boxShadow: '0px 5px 5px 0px rgba(0, 0, 0, 0.15)',
            zIndex: 10,
            borderRadius: '5px',
            padding: '3px',
          }}
          target="body"
          allowedPlacements={['top', 'bottom']}
          menu={() => (
            <>
              <MenuButton
                title="Bold (Ctrl+B)"
                icon={<FaBold />}
                onClick={toggleBold}
              />
              <MenuButton
                title="Italic (Ctrl+I)"
                icon={<FaItalic />}
                onClick={toggleItalic}
              />
              <MenuButton
                title="Underline (Ctrl+U)"
                icon={<FaUnderline />}
                onClick={toggleUnderline}
              />
              <MenuButton
                title="Increase Font Size"
                icon={<FaPlus />}
                onClick={() => changeFontSize('4')}
              />
              <MenuButton
                title="Decrease Font Size"
                icon={<FaMinus />}
                onClick={() => changeFontSize('2')}
              />

              <MenuButton
                title="Align Left"
                icon={<FaAlignLeft />}
                onClick={() => alignText('Left')}
              />
              <MenuButton
                title="Align Center"
                icon={<FaAlignCenter />}
                onClick={() => alignText('Center')}
              />
              <MenuButton
                title="Align Right"
                icon={<FaAlignRight />}
                onClick={() => alignText('Right')}
              />
            </>
          )}
        />
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="mb-2 flex flex-col items-center border-b-2 border-dashed border-gray-300 pb-1">
            {resumeData.profilePicture.length > 0 && (
              <div className="h-24 w-24 overflow-hidden rounded-full border-2 border-[black]">
                <Image
                  src={resumeData.profilePicture}
                  alt="profile"
                  width={100}
                  height={100}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            <h1
              className="name editable"
              contentEditable={editable}
              suppressContentEditableWarning
            >
              {resumeData.name}
            </h1>
            <h2
              className="profession editable"
              contentEditable={editable}
              suppressContentEditableWarning
            >
              {resumeData.position}
            </h2>
            <ContactInfo
              mainclass="flex flex-row gap-4 mb-1 contact"
              linkclass="inline-flex items-center gap-1"
              teldata={resumeData.contactInformation}
              emaildata={resumeData.email}
              addressdata={resumeData.address}
              telicon={<MdPhone />}
              emailicon={<MdEmail />}
              addressicon={<MdLocationOn />}
            />
            <div className="social-media-container flex flex-row gap-4 mb-1">
              {resumeData.socialMedia.map((socialMedia, index) => {
                const handleSocialMediaBlur = (
                  e: React.FocusEvent<HTMLAnchorElement>
                ) => {
                  const newSocialMedia = [...resumeData.socialMedia]
                  const item = newSocialMedia[index]
                  if (item) {
                    item.link = e.target.innerText
                    setResumeData({
                      ...resumeData,
                      socialMedia: newSocialMedia,
                    })
                  }
                }

                return (
                  <a
                    href={formatUrl(socialMedia.link)}
                    aria-label={socialMedia.socialMedia}
                    key={index}
                    title={socialMedia.socialMedia}
                    target="_blank"
                    rel="noreferrer"
                    className="content align-center editable inline-flex items-center justify-center gap-1 text-blue-700 hover:underline"
                    contentEditable={editable}
                    suppressContentEditableWarning
                    onBlur={handleSocialMediaBlur}
                  // Prevent text overflowing, If the socialMedia.link string is longer than 32 characters, apply the wordWrap and display styles to this <a> tag.
                  // wordWrap: "break-word" breaks the text onto the next line if it's too long,
                  // display: "inline-block" is necessary for wordWrap to work on an inline element like <a>.
                  >
                    {icons.map((icon, index) => {
                      if (icon.name === socialMedia.socialMedia.toLowerCase()) {
                        return <span key={index}>{icon.icon}</span>
                      }
                    })}
                    {socialMedia.link}
                  </a>
                )
              })}
            </div>
          </div>
          {/* two column start */}
          <div className="grid grid-cols-8 gap-6">
            <div className="col-span-3 space-y-2 bg-[#fefefe]">
              {resumeData.summary.length > 0 && (
                <div className="mb-1">
                  <h2
                    className="section-title editable mb-1 border-b-2 border-dashed border-gray-300"
                    contentEditable={editable}
                    suppressContentEditableWarning
                  >
                    Summary
                  </h2>
                  <p
                    className="content editable break-words"
                    contentEditable={editable}
                    suppressContentEditableWarning
                  >
                    {resumeData.summary
                      .split(/(?<=[.!?])\s+/)
                      .map((sentence, index, array) => (
                        <React.Fragment key={index}>
                          <Highlight
                            text={`⦿ ${sentence}`}
                            keywords={settings.skillsToHighlight}
                          />
                          {index < array.length - 1 && <br />}
                        </React.Fragment>
                      ))}
                  </p>
                </div>
              )}

              <Droppable droppableId="skills" type="SKILLS">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {resumeData.skills.map((skill, index) => (
                      <Draggable
                        key={`SKILLS-${index}`}
                        draggableId={`SKILLS-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`mb-1 cursor-grab active:cursor-grabbing ${snapshot.isDragging &&
                              'bg-white outline-2 outline-gray-400 outline-dashed'
                              }`}
                          >
                            <Skills title={skill.title} skills={skill.skills} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>

              {resumeData.projects && resumeData.projects.length > 0 && (
                <div className="mb-1">
                  <h2
                    className="section-title editable mb-1 border-b-2 border-dashed border-gray-300"
                    contentEditable={editable}
                    suppressContentEditableWarning
                  >
                    Projects
                  </h2>
                  {resumeData.projects.map((project, index) => (
                    <div key={index} className="mb-1">
                      <div className="flex flex-col space-y-0.5">
                        <a
                          href={project.link ? formatUrl(project.link) : '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="content i-bold editable text-blue-700 hover:underline"
                          contentEditable={editable}
                          suppressContentEditableWarning
                        >
                          {project.name}
                        </a>
                      </div>
                      <p
                        className="content editable"
                        contentEditable={editable}
                        suppressContentEditableWarning
                      >
                        {project.description}
                      </p>
                      <Droppable
                        droppableId={`PROJECTS_KEY_ACHIEVEMENT-${index}`}
                        type="PROJECTS_KEY_ACHIEVEMENT"
                      >
                        {(provided) => (
                          <ul
                            className="content mt-1 list-disc ps-3.5"
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {Array.isArray(project.keyAchievements) &&
                              project.keyAchievements.map((achievement, subIndex) => (
                                <Draggable
                                  key={`PROJECT-KEY-ACHIEVEMENT-${index}-${subIndex}`}
                                  draggableId={`PROJECTS_KEY_ACHIEVEMENT-${index}-${subIndex}`}
                                  index={subIndex}
                                >
                                  {(provided, snapshot) => (
                                    <li
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                      className={`cursor-grab hover:outline-2 hover:outline-gray-400 hover:outline-dashed active:cursor-grabbing ${snapshot.isDragging &&
                                        'bg-white outline-2 outline-gray-400 outline-dashed'
                                        }`}
                                    >
                                      <Highlight
                                        text={achievement.text}
                                        keywords={settings.skillsToHighlight}
                                        isHTML={true}
                                        className="editable-block"
                                        contentEditable={editable}
                                        suppressContentEditableWarning
                                      />
                                    </li>
                                  )}
                                </Draggable>
                              ))}
                            {provided.placeholder}
                          </ul>
                        )}
                      </Droppable>
                      {project.keywords && project.keywords.length > 0 && (
                        <div className="mt-1">
                          <span className="content select-all">
                            <Highlight
                              text={project.keywords.join(', ')}
                              keywords={settings.skillsToHighlight}
                            />
                          </span>
                        </div>
                      )}
                      <DateRange
                        startYear={project.startYear}
                        endYear={project.endYear}
                        id={`project-start-end-date-${index}`}
                      />
                    </div>
                  ))}
                </div>
              )}
              <div>
                {resumeData.education.length > 0 && (
                  <div className="mb-1">
                    <h2
                      className="section-title editable mb-1 border-b-2 border-dashed border-gray-300"
                      contentEditable={editable}
                      suppressContentEditableWarning
                    >
                      Education
                    </h2>
                    {resumeData.education.map((item, index) => (
                      <div key={index} className="mb-1">
                        <p
                          className="content i-bold editable"
                          contentEditable={editable}
                          suppressContentEditableWarning
                        >
                          {item.studyType && item.area
                            ? `${item.studyType} in ${item.area}`
                            : item.studyType || item.area}
                        </p>
                        {item.url ? (
                          <a
                            href={formatUrl(item.url)}
                            target="_blank"
                            rel="noreferrer"
                            className="content text-blue-700 hover:underline"
                          >
                            {item.school}
                          </a>
                        ) : (
                          <p className="content">{item.school}</p>
                        )}
                        <DateRange
                          startYear={item.startYear}
                          endYear={item.endYear}
                          id={`education-start-end-date-${index}`}
                          showOnlyEndDate={true}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Language title="Languages" languages={resumeData.languages} />
              <Certification
                title="Certifications"
                certifications={resumeData.certifications}
              />
            </div>

            <div className="col-span-5 space-y-2">
              {resumeData.workExperience.length > 0 && (
                <Droppable droppableId="work-experience" type="WORK_EXPERIENCE">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <h2
                        className="section-title editable mb-1 border-b-2 border-dashed border-gray-300"
                        contentEditable={editable}
                        suppressContentEditableWarning
                      >
                        Experience
                      </h2>
                      {resumeData.workExperience.map((item, index) => (
                        <Draggable
                          key={`${item.organization}-${index}`}
                          draggableId={`WORK_EXPERIENCE-${index}`}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`mb-2 cursor-grab active:cursor-grabbing ${index !== resumeData.workExperience.length - 1
                                ? 'border-b-2 border-dashed border-gray-300 pb-1'
                                : ''
                                } ${snapshot.isDragging &&
                                'bg-white outline-2 outline-gray-400 outline-dashed'
                                }`}
                            >
                              <div className="flex flex-row justify-between space-y-1">
                                <a
                                  href={item.url ? formatUrl(item.url) : '#'}
                                  target={item.url ? '_blank' : '_self'}
                                  rel={item.url ? 'noreferrer' : undefined}
                                  className="content i-bold editable text-blue-700 uppercase hover:underline"
                                  contentEditable={editable}
                                  suppressContentEditableWarning
                                >
                                  <Highlight
                                    text={item.organization}
                                    keywords={settings.skillsToHighlight}
                                  />
                                </a>
                                <DateRange
                                  startYear={item.startYear}
                                  endYear={item.endYear}
                                  id={`work-experience-start-end-date`}
                                />
                              </div>
                              <p
                                className="content i-bold editable"
                                contentEditable={editable}
                                suppressContentEditableWarning
                              >
                                <Highlight
                                  text={item.position}
                                  keywords={settings.skillsToHighlight}
                                />
                              </p>
                              <p
                                className="content editable"
                                contentEditable={editable}
                                suppressContentEditableWarning
                              >
                                <Highlight
                                  text={item.description}
                                  keywords={settings.skillsToHighlight}
                                />
                              </p>
                              <Droppable
                                droppableId={`WORK_EXPERIENCE_KEY_ACHIEVEMENT-${index}`}
                                type="WORK_EXPERIENCE_KEY_ACHIEVEMENT"
                              >
                                {(provided) => (
                                  <ul
                                    className="content mt-1 list-disc ps-3.5"
                                    {...provided.droppableProps}
                                    ref={provided.innerRef}
                                  >
                                    {Array.isArray(item.keyAchievements) &&
                                      item.keyAchievements.map(
                                        (achievement, subIndex) => (
                                          <Draggable
                                            key={`${item.organization}-${index}-${subIndex}`}
                                            draggableId={`WORK_EXPERIENCE_KEY_ACHIEVEMENT-${index}-${subIndex}`}
                                            index={subIndex}
                                          >
                                            {(provided, snapshot) => (
                                              <li
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                className={`cursor-grab hover:outline-2 hover:outline-gray-400 hover:outline-dashed active:cursor-grabbing ${snapshot.isDragging &&
                                                  'bg-white outline-2 outline-gray-400 outline-dashed'
                                                  }`}
                                              >
                                                <Highlight
                                                  text={achievement.text}
                                                  keywords={settings.skillsToHighlight}
                                                  isHTML={true}
                                                  className="editable-block"
                                                  contentEditable={editable}
                                                  suppressContentEditableWarning
                                                />
                                              </li>
                                            )}
                                          </Draggable>
                                        )
                                      )}
                                    {provided.placeholder}
                                  </ul>
                                )}
                              </Droppable>
                              {item.showTechnologies !== false &&
                                item.technologies &&
                                item.technologies.length > 0 && (
                                  <div className="mt-1">
                                    <span className="content i-bold">
                                      Tech Stack:{' '}
                                    </span>
                                    <span className="content select-all">
                                      <Highlight
                                        text={item.technologies.join(', ')}
                                        keywords={settings.skillsToHighlight}
                                      />
                                    </span>
                                  </div>
                                )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              )}
            </div>
          </div>
        </DragDropContext>
      </A4PageWrapper>
    </div >
  )
}

const A4PageWrapper = ({ children }: { children: React.ReactNode }) => {
  const alertA4Size = () => {
    const preview = document.querySelector('.preview') as HTMLElement | null
    if (preview) {
      const previewHeight = preview.offsetHeight
      console.log(previewHeight)
      if (previewHeight > 1122) {
        alert('A4 size exceeded')
      }
    }
  }

  return (
    <div className="w-8.5in" onLoad={alertA4Size}>
      {children}
    </div>
  )
}

export default Preview
