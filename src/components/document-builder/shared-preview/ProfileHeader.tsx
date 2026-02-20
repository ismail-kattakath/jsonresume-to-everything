import { useContext } from 'react'
import Image from 'next/image'
import { FaGithub, FaLinkedin, FaTwitter, FaFacebook, FaInstagram, FaYoutube, FaGlobe } from 'react-icons/fa'
import { MdEmail, MdLocationOn, MdPhone } from 'react-icons/md'
import ContactInfo from '@/components/document-builder/shared-preview/ContactInfo'
import { formatUrl } from '@/lib/utils/formatUrl'
import { ResumeContext } from '@/lib/contexts/DocumentContext'
import type { ResumeData, SocialMediaLink } from '@/types/resume'

const ProfileHeader = () => {
  const context = useContext(ResumeContext)

  if (!context) {
    return null
  }

  const { resumeData, setResumeData, editable = true } = context

  const icons = [
    { name: 'github', icon: <FaGithub /> },
    { name: 'linkedin', icon: <FaLinkedin /> },
    { name: 'twitter', icon: <FaTwitter /> },
    { name: 'facebook', icon: <FaFacebook /> },
    { name: 'instagram', icon: <FaInstagram /> },
    { name: 'youtube', icon: <FaYoutube /> },
    { name: 'website', icon: <FaGlobe /> },
  ]

  return (
    <div className="mb-2 flex flex-col items-center border-b-2 border-dashed border-gray-300 pb-1">
      {resumeData.profilePicture && resumeData.profilePicture.length > 0 && (
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
      <h1 className="name editable" contentEditable={editable} suppressContentEditableWarning>
        {resumeData.name}
      </h1>
      <h2 className="profession editable" contentEditable={editable} suppressContentEditableWarning>
        {resumeData.position}
      </h2>
      <ContactInfo
        mainclass="flex flex-row gap-1 mb-1 contact"
        linkclass="inline-flex items-center gap-1"
        teldata={resumeData.contactInformation}
        emaildata={resumeData.email}
        addressdata={resumeData.address}
        telicon={<MdPhone />}
        emailicon={<MdEmail />}
        addressicon={<MdLocationOn />}
      />
      <div className="grid grid-cols-3 gap-1">
        {resumeData.socialMedia &&
          resumeData.socialMedia.map((socialMedia: SocialMediaLink, index: number) => {
            const handleSocialMediaBlur = (e: React.FocusEvent<HTMLAnchorElement>) => {
              const newSocialMedia = resumeData.socialMedia.map((item, i) =>
                i === index
                  ? {
                      ...item,
                      link: (e.target as HTMLElement).innerText,
                    }
                  : item
              )
              setResumeData({
                ...resumeData,
                socialMedia: newSocialMedia,
              })
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
              >
                {(() => {
                  const icon = icons.find((i) => i.name === socialMedia.socialMedia.toLowerCase())
                  return icon ? <span>{icon.icon}</span> : null
                })()}
                {socialMedia.link}
              </a>
            )
          })}
      </div>
    </div>
  )
}

export default ProfileHeader
